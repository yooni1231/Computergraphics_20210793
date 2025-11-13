// disassembleMode.js
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import TWEEN from '@tweenjs/tween.js';

export function initDisassembleMode(containerId) {
    const container = document.getElementById(containerId);

    // ----- 기본 세팅 -----
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // ----- 조명 -----
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(5, 5, 5);
    scene.add(ambientLight, dirLight);

    // ----- 카메라 컨트롤 -----
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // ----- 재질 -----
    const baseMaterial = new THREE.MeshStandardMaterial({
        color: 0x666666,
        metalness: 0.3,
        roughness: 0.6,
    });

    // ----- OBJ 로드 -----
    const loader = new OBJLoader();
    loader.load(
        'models/glasses_total.obj',
        (object) => {
            const parts = [];

            // 각 부품 탐색
            object.traverse((child) => {
                if (child.isMesh) {
                    child.material = baseMaterial.clone();
                    child.material.color.setHSL(Math.random(), 0.4, 0.6); // 각 부품 색 다르게
                    child.scale.set(0.01, 0.01, 0.01);

                    // 초기 위치 중심
                    child.position.set(0, 0, 0);
                    scene.add(child);
                    parts.push(child);
                }
            });

            // 각 부품에 분리 애니메이션 적용
            parts.forEach((part, i) => {
                // 분리 방향 (랜덤 or 균일한 방향 벡터)
                const angle = (i / parts.length) * Math.PI * 2;
                const distance = 2.0 + Math.random() * 0.5;
                const targetPos = {
                    x: Math.cos(angle) * distance,
                    y: (Math.random() - 0.5) * 2.0,
                    z: Math.sin(angle) * distance,
                };

                // 이동 애니메이션
                new TWEEN.Tween(part.position)
                    .to(targetPos, 2500)
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .delay(i * 150) // 약간씩 시차를 줌
                    .start();

                // 회전 애니메이션
                new TWEEN.Tween(part.rotation)
                    .to(
                        {
                            x: Math.random() * Math.PI,
                            y: Math.random() * Math.PI,
                            z: Math.random() * Math.PI,
                        },
                        3000
                    )
                    .easing(TWEEN.Easing.Quadratic.Out)
                    .delay(i * 150)
                    .start();

                // 라벨 추가
                createLabel(part.name || `part_${i + 1}`, part);
            });
        },
        (xhr) => {
            console.log(`Loading: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
            console.error('OBJ 로드 실패:', error);
        }
    );

    // ----- 라벨 생성 함수 -----
    function createLabel(text, mesh) {
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = text;
        div.style.position = 'absolute';
        div.style.color = '#111';
        div.style.fontWeight = 'bold';
        div.style.background = 'rgba(255,255,255,0.8)';
        div.style.padding = '3px 8px';
        div.style.borderRadius = '6px';
        div.style.fontSize = '13px';
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

    // ----- 애니메이션 루프 -----
    function animate() {
        requestAnimationFrame(animate);
        TWEEN.update();
        controls.update();
        renderer.render(scene, camera);
    }
    animate();

    // ----- 반응형 -----
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
