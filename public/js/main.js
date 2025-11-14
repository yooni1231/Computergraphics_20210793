// main.js

let scene, camera, renderer, controls;

init();
animate();

function init() {
  const canvas = document.getElementById('webgl-canvas');

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0.5, 2.5);

  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 5, 5);
  scene.add(ambient, dir);

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const loader = new THREE.OBJLoader();
  loader.load(
    "/models/glasses.obj",
    (obj) => {
      obj.scale.set(0.01, 0.01, 0.01);
      scene.add(obj);
      console.log("OBJ 로드 완료");
    },
    undefined,
    (err) => console.error("OBJ 오류:", err)
  );

  // ----------- 버튼 클릭 이벤트 연결 -------------
  document.querySelectorAll('#mode-buttons button').forEach((btn) => {
    btn.addEventListener("click", () => {
      const mode = btn.dataset.mode;

      if (mode === "exhibition") {
        enableExhibitionMode(scene, renderer);
      }

      console.log(mode + " 모드 전환");
    });
  });

  window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
