// disassembleMode.js

// 전역 정리 함수 정의 (Disassemble Mode DOM 요소 및 이벤트)
let clickHandler = null; // 클릭 이벤트 핸들러를 저장할 전역 변수

window.clearDisassembleAssets = function() {
    if (window._disassembleLabels) {
        window._disassembleLabels.forEach(div => {
            if (div.parentNode) {
                div.parentNode.removeChild(div);
            }
        });
        window._disassembleLabels = [];
    }
    const panel = document.getElementById("info-panel");
    if (panel) {
        panel.style.display = 'none'; // 패널 숨김
    }

    // 이벤트 리스너 제거
    if (clickHandler) {
        window.removeEventListener("click", clickHandler);
        clickHandler = null;
    }
    
    // 물리 모드 초기화
    window.isPhysicsMode = false;
    window.world = null;
    console.log(" Disassemble Assets 정리 완료");
};

// 설명 패널 표시 함수
function showPanel(title, desc) {
    let panel = document.getElementById("info-panel");
    if (!panel) return;
    
    panel.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    panel.style.display = 'block';
}


window.disassembleMode = function (scene, renderer, camera, controls) {
    console.log("Disassemble Mode 활성화 (TWEEN + Cannon.js)");
    
    // 씬 및 이전 모드 정리
    window.clearDisassembleAssets(); 
    if (window.clearExhibitionAssets) window.clearExhibitionAssets();

    //  물리 엔진 초기화
    window.world = new CANNON.World();
    window.world.gravity.set(0, -9.82, 0); 
    window.world.broadphase = new CANNON.NaiveBroadphase();
    
    const groundShape = new CANNON.Plane();
    const groundBody = new CANNON.Body({ mass: 0 }); 
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2); 
    window.world.addBody(groundBody);
    
    // 기존 씬 초기화 및 광원 설정 
    const removeList = [];
    scene.traverse((obj) => {
        if (obj.userData.isDisassemblePart) removeList.push(obj);
    });
    const lightsToRemove = scene.children.filter(obj => obj.isLight && obj.userData.isDisassembleLight);
    removeList.push(...lightsToRemove);
    removeList.forEach(obj => scene.remove(obj));
    
    scene.background = null;
    scene.environment = null;
 
    // 광원 보강
   
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(3, 5, 3);
    dir.castShadow = true;
    ambient.userData.isDisassembleLight = true;
    dir.userData.isDisassembleLight = true;
    scene.add(ambient, dir);
    // 부품 정의 (요청된 설명 반영)
    const stlLoader = new THREE.STLLoader();
    const parts = [
        { file: "/models/camera.stl", label: "Front Camera", desc: "그림 인식, 사물 식별", color: 0x3366ff },
        { file: "/models/camera.stl", label: "Rear Camera", desc: "눈동자 시선 추적", color: 0x33aaff }, 
        { file: "/models/jetsonnano.stl", label: "Jetson Nano", desc: "소형 컴퓨터, AI 모델 작동", color: 0x00aa88 },
        { file: "/models/frame.stl", label: "3D Printed Frame", desc: "3D 프린터로 디자인하여 출력", color: 0xffffff },
    ];
    const loadedParts = [];
    
  

   
    // STL 부품 로드 및 TWEEN/Cannon.js 연결
   
    parts.forEach((part, index) => {
        stlLoader.load(part.file, (geometry) => {
            const mat = new THREE.MeshStandardMaterial({ color: part.color, roughness: 0.4, metalness: 0.3 });
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.scale.set(0.01, 0.01, 0.01);
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            mesh.userData = {
                isDisassemblePart: true,
                label: part.label,
                desc: part.desc,
            };

            scene.add(mesh);
            loadedParts.push(mesh);

            animateDisassemble(mesh, index, geometry); 
            createLabel(mesh, part.label);
        });
    });
    
    // 분해 애니메이션 (TWEEN)
    function animateDisassemble(mesh, i, geometry) {
        const angle = (i / parts.length) * Math.PI * 2;
        const target = {
            x: Math.cos(angle) * 1.5,
            y: 0.3 + Math.random() * 0.5,
            z: Math.sin(angle) * 1.5,
        };
        
        new TWEEN.Tween(mesh.position)
            .to(target, 1500)
            .easing(TWEEN.Easing.Cubic.Out)
            .onComplete(() => {
                addCannonBody(mesh, geometry); // TWEEN 완료 후 물리 바디 추가
            })
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to({ x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI }, 1500)
            .start();
    }
    
    // Cannon.js 바디 추가 및 물리 모드 전환
    function addCannonBody(mesh, geometry) {
        if (!window.world) { 
            console.warn("Cannon.js 월드가 이미 정리");
            return; 
        }
        
        window.isPhysicsMode = true; 
        
        geometry.computeBoundingBox();
        const size = geometry.boundingBox.getSize(new THREE.Vector3());
        const scaleFactor = 0.01;
        const scaledSize = size.multiplyScalar(scaleFactor);

        const initialPosition = mesh.position.clone();
        
        const boxShape = new CANNON.Box(new CANNON.Vec3(scaledSize.x / 2, scaledSize.y / 2, scaledSize.z / 2));
        
        const mass = 1; 
        const body = new CANNON.Body({ mass: mass, shape: boxShape, position: initialPosition });

        body.velocity.set(0.1 * (Math.random() - 0.5), 0.5, 0.1 * (Math.random() - 0.5)); 
        body.angularVelocity.set(Math.random(), Math.random(), Math.random());
        
        window.world.addBody(body);
        mesh.userData.cannonBody = body; 
    }

    // Raycaster 클릭 이벤트 핸들러
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    clickHandler = (e) => {
        if (loadedParts.length === 0 || !window.isPhysicsMode) return; 

        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(loadedParts);

        if (hits.length > 0) {
            const obj = hits[0].object;
            showPanel(obj.userData.label, obj.userData.desc);
        }
    };
    window.addEventListener("click", clickHandler);
    
    // 3D 라벨 생성 (로직은 동일)
    if (!window._disassembleLabels) {
        window._disassembleLabels = [];
    }

    function createLabel(mesh, text) {
        const div = document.createElement("div");
        div.innerHTML = text;
        div.classList.add("disassemble-label");
        div.style.position = "absolute";
        div.style.padding = "4px 10px";
        div.style.background = "rgba(255,255,255,0.9)";
        div.style.borderRadius = "6px";
        div.style.fontSize = "12px";
        document.body.appendChild(div);
        
        window._disassembleLabels.push(div); 

        const pos = new THREE.Vector3();

        function update() {
            // mesh.position은 cannonBody에서 업데이트됩니다.
            pos.copy(mesh.position).project(camera);
            div.style.left = (pos.x * 0.5 + 0.5) * window.innerWidth + "px";
            div.style.top = (-pos.y * 0.5 + 0.5) * window.innerHeight + "px";
            requestAnimationFrame(update);
        }
        update();
    };
    
    console.log(" Disassemble Mode 적용 완료");
};