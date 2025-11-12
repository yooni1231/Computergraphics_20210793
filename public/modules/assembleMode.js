//1번 버튼: 착용 모드

import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';  

export function initAssembleMode(containerId)
{
    const container = document.getElementById(containerId);

    //basic setting
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xdddddd);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 1, 5);   
    container.appendChild(Renderer.doElement);

    //조명
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);        
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    //모델 로드
    const loadeer = new STLLoader();
    loadeer.load('models/glasses_total.stl', (geometry) => {
        const glasses = new THREE.Mesh(geometry,material);
        glasses.scale.set(0.01, 0.01, 0.01);
        scene.add(glasses);
    });


    //컨트롤 
    const controls = new OrbitControls(camera, Renderer.doElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;

    //반응형
    window.addEventListener('resize', () => {
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        Renderer.setSize(container.clientWidth, container.clientHeight);
    });

    //렌더링
    function animate() {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera); 
    }
    animate();
    
}