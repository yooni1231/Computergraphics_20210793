//2번 버튼: 부품 분리 
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';
import TWEEN from "@tweenjs/tween.js";

export function initDisassembleMode(containerId){
    const container = document.getElementById(containerId);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 2,7);   
    const renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize(window.clientWidth, window.clientHeight);
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);        
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;


    const loader = new STLLoader();
    const material = new THREE.MeshStandardMaterial({color: 0x606060, metalness: 0.2, roughness: 0.4 });

    const parts = {};

    const loadPart = (name,path, position) => {
        loader.load(path, (geometry) => {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set(0.01, 0.01, 0.01);
            mesh.position.set(0,0,0);
            scene.add(mesh);
            parts[name] = {mesh: mesh, targetPosition: position};
        
            new TWEEN.Tween(mesh.position)
            .to(position,2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start();

            new TWEEN.Tween(mesh.rotation)
            .to({x: Math.random() * Math.PI, y: Math.random() * Math.PI, z: Math.random() * Math.PI}, 25000) 
            .eassing(TWEEN.Easing.Quadratic.Out)
            .start();

            //라벨  
            createLabel(name,mesh);
        });
    };

    //부품 로드
    loadPart('frame', 'public/models/frame.stl', { x: -1.5, y: 0, z: 0 });
    loadPart('camera_front', 'public/models/camera.stl', { x: 0, y: 1.5, z: 0 });
    loadPart('camera_back', 'public/models/camera.stl', { x: 1.5, y: 0, z: 0 });
    loadPart('nano', 'public/models/nano.stl', { x: 0, y: -1.5, z: 0 });

    //부품 라벨
    function createLable(text,mesh){
        const div = document.createElement('div');
        div.className = 'label';
        div.textContent = text;
        div.style.position = 'absolute';
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        div.style.padding = '2px 5px';
        div.style.borderRadius = '4px';
        document.body.appendChild(div);
    }

    }
}
