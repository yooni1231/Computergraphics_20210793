// disassembleMode.js
// ⚠️ import 절대 없음 (전역 방식)
// main.js에서 disassembleMode(scene, renderer, camera, controls)로 호출됨

window.disassembleMode = function (scene, renderer, camera, controls) {
    console.log("🔩 Disassemble Mode 활성화");

    // ---------------------------------------------
    // 기존 씬 초기화 (기존 오브젝트 제거)
    // ---------------------------------------------
    const removeList = [];
    scene.traverse((obj) => {
        if (obj.isMesh && obj.userData.isDisassemblePart) {
            removeList.push(obj);
        }
    });
    removeList.forEach(obj => scene.remove(obj));

    // ---------------------------------------------
    // 광원 보강
    // ---------------------------------------------
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(3, 5, 3);
    dir.castShadow = true;
    scene.add(ambient, dir);

    // ---------------------------------------------
    // STL Loader
    // ---------------------------------------------
    const stlLoader = new THREE.STLLoader();

    // ---------------------------------------------
    // 부품 정의
    // ---------------------------------------------
    const parts = [
        {
            file: "/models/camera.stl",
            label: "Front Camera",
            desc: "전면 사물 인식 카메라",
            color: 0x3366ff,
        },
        {
            file: "/models/camera.stl",
            label: "Eye Tracking Camera",
            desc: "시선 추적 카메라",
            color: 0x33aaff,
        },
        {
            file: "/models/jetsonnano.stl",
            label: "Jetson Nano",
            desc: "AI 연산 메인 보드",
            color: 0x00aa88,
        },
        {
            file: "/models/frame.stl",
            label: "3D Printed Frame",
            desc: "안경 전체 프레임",
            color: 0xffffff,
        },
    ];

    const loadedParts = [];

    // ---------------------------------------------
    // 통합 모델 fade-out
    // ---------------------------------------------
    stlLoader.load("/models/glasses_with_camera.stl", (geo) => {
        const mat = new THREE.MeshStandardMaterial({
            color: 0x999999,
            transparent: true,
            opacity: 1,
        });

        const mesh = new THREE.Mesh(geo, mat);
        mesh.scale.set(0.01, 0.01, 0.01);
        scene.add(mesh);

        new TWEEN.Tween(mesh.material)
            .to({ opacity: 0 }, 1200)
            .onComplete(() => {
                scene.remove(mesh);
            })
            .start();
    });

    // ---------------------------------------------
    // STL 부품 로드
    // ---------------------------------------------
    parts.forEach((part, index) => {
        stlLoader.load(part.file, (geometry) => {
            const mat = new THREE.MeshStandardMaterial({
                color: part.color,
                roughness: 0.4,
                metalness: 0.3,
            });

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

            animateDisassemble(mesh, index);
            createLabel(mesh, part.label);
        });
    });

    // ---------------------------------------------
    // 분해 애니메이션
    // ---------------------------------------------
    function animateDisassemble(mesh, i) {
        const angle = (i / parts.length) * Math.PI * 2;
        const target = {
            x: Math.cos(angle) * 2,
            y: 0.3 + Math.random(),
            z: Math.sin(angle) * 2,
        };

        new TWEEN.Tween(mesh.position)
            .to(target, 2000)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();

        new TWEEN.Tween(mesh.rotation)
            .to(
                {
                    x: Math.random() * Math.PI,
                    y: Math.random() * Math.PI,
                    z: Math.random() * Math.PI,
                },
                2000
            )
            .start();
    }

    // ---------------------------------------------
    // Raycaster 클릭 설명 패널
    // ---------------------------------------------
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener("click", (e) => {
        mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(loadedParts);

        if (hits.length > 0) {
            const obj = hits[0].object;
            showPanel(obj.userData.label, obj.userData.desc);
        }
    });

    // ---------------------------------------------
    // 설명 패널
    // ---------------------------------------------
    function showPanel(title, desc) {
        let panel = document.getElementById("info-panel");
        if (!panel) {
            panel = document.createElement("div");
            panel.id = "info-panel";
            panel.style.position = "absolute";
            panel.style.right = "20px";
            panel.style.top = "20px";
            panel.style.padding = "15px";
            panel.style.width = "240px";
            panel.style.background = "rgba(255,255,255,0.9)";
            panel.style.borderRadius = "12px";
            panel.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
            document.body.appendChild(panel);
        }

        panel.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    }

    // ---------------------------------------------
    // 3D 라벨
    // ---------------------------------------------
    function createLabel(mesh, text) {
        const div = document.createElement("div");
        div.innerHTML = text;
        div.style.position = "absolute";
        div.style.padding = "4px 10px";
        div.style.background = "rgba(255,255,255,0.9)";
        div.style.borderRadius = "6px";
        div.style.fontSize = "12px";
        document.body.appendChild(div);

        const pos = new THREE.Vector3();

        function update() {
            pos.copy(mesh.position).project(camera);
            div.style.left = (pos.x * 0.5 + 0.5) * window.innerWidth + "px";
            div.style.top = (-pos.y * 0.5 + 0.5) * window.innerHeight + "px";
            requestAnimationFrame(update);
        }
        update();
    };

    console.log("✅ Disassemble Mode 적용 완료");
};
