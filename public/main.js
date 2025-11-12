import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {STLLoader} from 'three/examples/jsm/loaders/STLLoader.js';

//기본 scene 설정 

const scene = new THREE.Scene();
const background = new THREE.color("grey");

//camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth/ window.innerHeight, 0.1, 1000);
camera.position.set(0,1,5);

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: document.getElementById('webgl-canvas'),
    antialias: true 
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);



//은은한 조명
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);    

//그림자
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(5, 5,5);

scene.add(directionalLight);

//마우스 컨트롤 
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

//STL 모델 로딩
//STL 색상/ 재질 
const stlMaterial = new THREE.MeshStandardMaterial({
    color: 0x606060,
    metalness: 0.2, 
    roughness: 0.4
});

//안경의 모든 부품을 담은 그룹을 만들기
const glasses =new THREE.Group();
glasses.visible =false; //리모컨 1번을 누르기 전까지 보이지 않음 
scene.add(glasses);

const parts ={}//부품들을 담을 객체
const loader = new THREE.STLLoader(); //stl 로더 생성

//모델 로드 함수
function loadModel(name,path){
    loader.load(path,(geometry) => {
        const mesh = new THREE.Mesh(geometry, stlMaterial);
        parts[name]=mesh;
        glasses.add(mesh);

    },
    (xhr) => {
        console.log(`${(xhr.loaded / xhr.total * 100)} % loaded`);  
    },
    (error) => {
        console.error('error ${name} :', error);
    }
);
}

//각 부품 로드
loadModel('frame', 'models/frame.stl');
loadModel('camera_front', 'models/camera.stl');
loadModel('camera_back', 'models/camera.stl');
loadModel('nano', 'models/nano.stl');
loadModel('glasses', 'models/glasses_total.stl');

//리모컨 버튼 예시 
document.querySelector('.remote-btn').forEach(btn => {
    btn.addEventListener('click',(e) => {
        const id = e.target.dataset.id;
          switch (id) {
      case '1':
        // 착용 모드: 전체 등장
        glasses.visible = true;
        console.log('Mode 1: 착용 모드 실행');
        break;
      case '2':
        // 부품 분리 모드
        console.log('Mode 2: 부품 분리 실행');
        break;
      default:
        console.log('기능 준비 중');
    }
    });
});

//렌더 루프
function animate(){
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene,camera);


}
animate();

//창 크기 변경 대응
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});