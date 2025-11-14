//5번 버튼: 전시 모드 ( 미술관 모드 )

// exhibitionMode.js

window.enableExhibitionMode = function (scene, renderer) {
    console.log(" Exhibition Mode!");

    const loader = new THREE.EXRLoader();

    loader.load(
        "/models/art_studio.exr",
        (texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;

            scene.environment = texture;
            scene.background = texture;

            console.log("EXR 환경맵 적용 완료!");
        },
        (progress) => {
            console.log(
                `EXR 로딩: ${((progress.loaded / progress.total) * 100).toFixed(2)}%`
            );
        },
        (error) => {
            console.error("❌ EXR 로딩 실패:", error);
        }
    );
}
