//3번 버튼: 잿슨 나노 강조 

import * as THREE from 'three';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

export function initNanoHighlight(scene,camera, renderer){
    const loader = new STLLoader();
    const highlightMaterial = new THREE.MeshStandardMaterial({
        color: 0xff0000,
        emissive: 0x00ffff,
        emissiveIntensity: 0.5,
        transplarent:true,
        opacity:0.8
    });

    loader.load('public/models/nano_case.stl', (geometry) => {
        const nanoHighlight = new THREE.Mesh(geometry, highlightMaterial);
        nanoHighlight.scale.set(0.01, 0.01, 0.01);
        scene.add(nanoHighlight);
    
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera); 
    const intersects = raycaster.intersectObjects(scene.children);

    for ( let obj of scene.childeren){
        if (obj.material) obj.material.emissiveIntensity = 0.2;

    }

    if (intersects.length > 0) {
        const intersected = intersects[0].object;
        if (intersected.material) hovered.material.emissiveIntensity = 0.8;

}
}
window.addEventListener('mousemove', onMouseMove, false);
}