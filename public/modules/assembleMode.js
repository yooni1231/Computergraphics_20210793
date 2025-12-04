// assembleMode.js

window.assembleMode = function (scene, renderer, camera, controls) {
    console.log(" Assemble Mode 실행");

    // ---------------------------------------------
    // 이전 모드요소 정리
    // ---------------------------------------------
    if (window.clearDisassembleAssets) {
        window.clearDisassembleAssets();
    }

    // ---------------------------------------------
    // 기존 씬 초기화 (이전 모드/자신 모드 오브젝트 제거)
    // ---------------------------------------------
    const removeList = [];
    scene.traverse((obj) => {
        // Disassemble Mode에서 추가된 파트/조명 제거
        if ((obj.isMesh && obj.userData.isDisassemblePart) || 
            (obj.isLight && obj.userData.isDisassembleLight)) 
        { 
            removeList.push(obj);
        }
        // Assemble Mode에서 추가된 조명/파트 제거 (다시 로드할 것이므로)
        if ((obj.isMesh && obj.userData.isAssemblePart) || 
            (obj.isLight && obj.userData.isAssembleLight)) 
        {
            removeList.push(obj);
        }
    });
    removeList.forEach(obj => scene.remove(obj));

    scene.background = new THREE.Color(0xdddddd);
    scene.environment = null;

    // ---------------------------------------------
    // 새 조명 세팅 (Assemble Mode 전용)
    // ---------------------------------------------
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    
    // 조명에 식별자 추가
    ambientLight.userData.isAssembleLight = true;
    directionalLight.userData.isAssembleLight = true;

    scene.add(ambientLight, directionalLight);

    // ---------------------------------------------
    // 재질
    // ---------------------------------------------
    const material = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.3,
        roughness: 0.7,
    });

    // ---------------------------------------------
    // OBJ 로더
    // ---------------------------------------------
    const loader = new THREE.OBJLoader();
    loader.load(
        "/models/glasses_total.obj",
        (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                    child.castShadow = true;
                    child.receiveShadow = true;
                    // Assemble Mode 파트 식별자 추가
                    child.userData.isAssemblePart = true; 
                }
            });

            object.scale.set(0.01, 0.01, 0.01);
            scene.add(object);

            console.log("✅ glasses_total.obj 로드 성공");
        },
        (xhr) => {
            console.log(`Loading: ${((xhr.loaded / xhr.total) * 100).toFixed(2)}%`);
        },
        (error) => {
            console.error(" OBJ 로드 실패:", error);
        }
    );

    // ---------------------------------------------
    // 컨트롤 설정 (Assemble Mode에 맞게)
    // ---------------------------------------------
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    
    // 카메라 위치 재설정 (조립 모드에 적합하게)
    new TWEEN.Tween(camera.position)
        .to({ x: 0, y: 0.5, z: 2.5 }, 1000)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();

  
    
    console.log(" Assemble Mode 적용 완료");
};