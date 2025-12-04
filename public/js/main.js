// main.js

let scene, camera, renderer, controls;
let glassesObj = null; 
let world; 
let isPhysicsMode = false; 

init();
animate();

function init() {
    const canvas = document.getElementById("webgl-canvas");

    // ----- 씬 & 배경 & 기본 조명 설정 -----
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    scene.userData.isExhibition = true; 

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 2.5);

    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 기본 조명
    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 5, 5);
    dir.castShadow = true;
    ambient.userData.isMainLight = true; 
    dir.userData.isMainLight = true; 
    scene.add(ambient, dir);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1;
    controls.maxDistance = 5;

    // ----- OBJ 모델 로드 (exhibitionMode용) -----
    const loader = new THREE.OBJLoader();
    loader.load(
        "/models/glasses.obj",
        (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = new THREE.MeshStandardMaterial({ color: 0xdddddd, metalness: 0.4, roughness: 0.5 });
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            object.scale.set(0.01, 0.01, 0.01);
            object.userData.isExhibitionPart = true; 
            scene.add(object);
            glassesObj = object;
            console.log("exhibition OBJ 로드 성공");
        },
        (xhr) => { console.log(`Loading ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`); },
        (err) => { console.error("모델 로드 실패:", err); }
    );

    window.addEventListener("resize", onWindowResize);

    //  더블클릭: 모든 모드에서 안경 토글
    window.addEventListener("dblclick", () => {
        if (glassesObj) {
            glassesObj.visible = !glassesObj.visible;
            console.log("👓 OBJ 안경 토글:", glassesObj.visible);
        }
    });

    //  이전 모드에서 추가된 특수 조명을 제거하는 함수
    function clearModeLights(scene) {
        const lightsToRemove = [];
        scene.traverse((obj) => {
            if (obj.isLight && (obj.userData.isDisassembleLight || obj.userData.isAssembleLight)) {
                lightsToRemove.push(obj);
            }
        });
        lightsToRemove.forEach(obj => scene.remove(obj));
    }

    // ----- 모드 버튼 이벤트 리스너 -----
    document.querySelectorAll("#mode-buttons button").forEach((btn) => {
        btn.addEventListener("click", () => {
            const mode = btn.dataset.mode;
            console.log(`👉 ${mode} 모드 진입`);

            // 정리 함수 호출 (모드 전환 시 모든 모드의 잔여물 정리)
            if (window.clearDisassembleAssets) {
                window.clearDisassembleAssets(); 
            }
            if (window.clearExhibitionAssets) {
                window.clearExhibitionAssets(); 
            }
            if (window.clearHighlightAssets) { // 
                window.clearHighlightAssets();
            }
            clearModeLights(scene); 
            
            // 물리 모드 초기화
            isPhysicsMode = false;
            world = null;

            // DOM 정보 박스 관리 및 카메라 초기화
            const infoBox = document.getElementById('info-box');
            if (infoBox) infoBox.style.display = 'block'; 

            if (glassesObj) {
                glassesObj.visible = mode === "exhibition";
                // Exhibition 모드가 아닐 때, 기본 조명 활성화
                scene.traverse(obj => {
                    if (obj.isLight && obj.userData.isMainLight) {
                        obj.visible = true; // 기본 조명은 항상 켜두고 각 모드에서 추가/삭제
                    }
                });
            }
            
            // 카메라 및 컨트롤 타겟을 초기 위치로 복구
            controls.target.set(0, 0.5, 0);
            camera.position.set(0, 0.5, 2.5);

            switch (mode) {
                case "exhibition":
                    if (typeof enableExhibitionMode === "function") {
                        enableExhibitionMode(scene, renderer);
                    }
                    if (infoBox) infoBox.querySelector('#info-text').textContent = '마우스로 드래그해서 회전해보세요!';
                    break;

                case "assemble":
                    if (typeof assembleMode === "function") {
                        assembleMode(scene, renderer, camera, controls);
                    }
                    if (infoBox) infoBox.querySelector('#info-text').textContent = '부품을 클릭하여 조립해보세요.';
                    break;

                case "disassemble":
                    if (typeof disassembleMode === "function") {
                        disassembleMode(scene, renderer, camera, controls);
                    }
                    if (infoBox) infoBox.style.display = 'none'; 
                    break;
                
                case "highlight":
                    if (typeof window.highlightMode === "function") {
                        window.highlightMode(scene, renderer, camera, controls); 
                    }
                    if (infoBox) infoBox.style.display = 'none'; 
                    break;
            }
        });
    });
}

// ----- 리사이즈 & 애니메이션 루프 (동일) -----
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    
    TWEEN.update(); 
    
    // 💡 물리 엔진 업데이트
    if (isPhysicsMode && world) {
        world.step(1 / 60); 
        
        scene.traverse(obj => {
            if (obj.userData.cannonBody) {
                obj.position.copy(obj.userData.cannonBody.position);
                obj.quaternion.copy(obj.userData.cannonBody.quaternion);
            }
        });
    }
    
    renderer.render(scene, camera);
}