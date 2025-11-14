// exhibitionMode.js
window.enableExhibitionMode = function (scene, renderer) {
    console.log("Exhibition Mode 활성화");

    // EXR Loader
    const loader = new THREE.EXRLoader();
    loader.load(
        "/models/art_studio.exr",
        (texture) => {
            console.log("✅ EXR 파일 로드 완료");

            // 환경맵
            texture.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = texture;
            scene.background = texture;

            renderer.toneMapping = THREE.ACESFilmicToneMapping;
            renderer.toneMappingExposure = 1.0; // 기본 밝기

            console.log("HDRI !");
        },
        (progress) => {
            if (progress.total) {
                console.log(
                    `EXR 로딩 ${((progress.loaded / progress.total) * 100).toFixed(2)}%`
                );
            } else {
                console.log("EXR 로딩 중...");
            }
        },
        (error) => {
            console.error("" EXR 로딩 실패:", error);
        }
    );

    // ----- 슬라이더 UI 생성 -----
    const container = document.body;

    const sliderLabel = document.createElement("label");
    sliderLabel.textContent = "밝기 조절: ";
    sliderLabel.style.position = "absolute";
    sliderLabel.style.top = "10px";
    sliderLabel.style.left = "10px";
    sliderLabel.style.color = "#fff";
    sliderLabel.style.fontFamily = "sans-serif";

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = 0;
    slider.max = 3;
    slider.step = 0.01;
    slider.value = 1;
    slider.style.verticalAlign = "middle";

    sliderLabel.appendChild(slider);
    container.appendChild(sliderLabel);

    // ----- 슬라이더 이벤트 -----
    slider.addEventListener("input", (event) => {
        const val = parseFloat(event.target.value);
        renderer.toneMappingExposure = val;
        console.log("밝기 변경:", val.toFixed(2));
    });
};
