// 1번 버튼: 착용 모드

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';  

export function initAssembleMode(containerId) {
    const container = document.getElementById(containerId);

    // ----- 기본 세팅 -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    const camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
    );
    camera.position.set(0, 1, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // ----- 조명 -----
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    // ----- 재질 -----
    const material = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.3, roughness: 0.7 });

    // ----- OBJ 모델 로드 -----
    const loader = new OBJLoader();
    loader.load(
        'models/glasses_total.obj',
        (object) => {
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = material;
                }
            });
            object.scale.set(0.01, 0.01, 0.01);
            scene.add(object);
        },
        (xhr) => {
            console.log(`Loading: ${(xhr.loaded / xhr.total * 100).toFixed(2)}% loaded`);
        },
        (error) => {
            console.error('OBJ 로드 실패:', error);
        }
    );

    // ----- 컨트롤 -----
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    // ----- 반응형 처리 -----
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
    });

    // ----- 렌더링 루프 -----
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
