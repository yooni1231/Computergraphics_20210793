let scene, camera, renderer, controls;

init();
animate();

function init() {
  // ----- 캔버스 & 씬 -----
  const canvas = document.getElementById('webgl-canvas');
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  // ----- 카메라 -----
  camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 0.5, 2.5);

  // ----- 렌더러 -----
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // ----- 조명 -----
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 5, 5);
  scene.add(ambient, dir);

  // ----- OrbitControls -----
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false; // 평면 이동 금지
  controls.minDistance = 1;
  controls.maxDistance = 5;

  // ----- OBJ 모델 로드 -----
  const loader = new THREE.OBJLoader();
  loader.load(
    '/models/glasses.obj', // public/models/ 폴더에 위치
    (object) => {
      object.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: 0xdddddd,
            metalness: 0.4,
            roughness: 0.5,
          });
        }
      });
      object.scale.set(0.01, 0.01, 0.01);
      scene.add(object);
      console.log('✅ OBJ 로드 성공');
    },
    (xhr) => {
      console.log(`Loading ${(xhr.loaded / xhr.total * 100).toFixed(2)}%`);
    },
    (err) => {
      console.error('❌ 모델 로드 실패:', err);
    }
  );

  // ----- 창 크기 변경 대응 -----
  window.addEventListener('resize', onWindowResize);

  // ----- 모드 버튼 이벤트 -----
  document.querySelectorAll('#mode-buttons button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.dataset.mode;
      alert(`${mode} 모드로 전환합니다!`);
      // TODO: 각 모드별 함수 호출 가능
      // if (mode === 'disassemble') initDisassembleMode(scene, camera);
    });
  });
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
