// disassembleMode.js
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';

export function initDisassembleMode(containerId) {
    const container = document.getElementById(containerId);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(ambientLight, dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const loader = new STLLoader();
    const material = new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.2, roughness: 0.4 });

    const parts = {};

    const loadPart = (name, path, position) => {
        loader.load(path, (geometry) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(0.01, 0.01, 0.01);
            mesh.position.set(0, 0, 0);
            scene.add(mesh);
            parts[name] = mesh;

            // 애니메이션 (중심 → 지정 위치)
            new TWEEN.Tween(mesh.position)
                .to(position, 2000)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            new TWEEN.Tween(mesh.rotation)
                .to({ x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI }, 2500)
                .easing(TWEEN.Easing.Quadratic.Out)
                .start();

            // 라벨
            createLabel(name, mesh);
        });
    };

    // 부품 로드
    loadPart('glasses', 'public/models/glasses.stl', { x: -1.5, y: 0, z: 0 });
    loadPart('camera_front', 'public/models/camera_front.stl', { x: 0, y: 1.5, z: 0 });
    loadPart('camera_back', 'public/models/camera_back.stl', { x: 1.5, y: 0, z: 0 });
    loadPart('nano', 'public/models/nano.stl', { x: 0, y: -1.5, z: 0 });

    function createLabel(text, mesh) {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = text;
        div.style.position = 'absolute';
        div.style.color = '#111';
        div.style.fontWeight = 'bold';
        div.style.background = 'rgba(255,255,255,0.7)';
        div.style.padding = '2px 6px';
        div.style.borderRadius = '6px';
        container.appendChild(div);

        const vector = new THREE.Vector3();

        function updateLabel() {
            vector.copy(mesh.position).project(camera);
            const x = (vector.x * 0.5 + 0.5) * renderer.domElement.clientWidth;
            const y = (-vector.y * 0.5 + 0.5) * renderer.domElement.clientHeight;
            div.style.left = `${x}px`;
            div.style.top = `${y}px`;
        }

        function animateLabel() {
            updateLabel();
            requestAnimationFrame(animateLabel);
        }
        animateLabel();
    }

    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        controls.update();
        renderer.render(scene, camera);
    }
    animate();
}
