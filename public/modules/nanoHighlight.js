// /modules/highlightMode.js


let highlightContainer = null; // HTML DOM: 부품 선택 버튼들이 들어갈 사이드 패널 컨테이너
let currentHighlightMesh = null; // THREE.Mesh: 현재 중앙에서 강조되고 있는 3D 부품 객체
let allHighlightParts = []; // Array<THREE.Mesh>: 로드된 모든 부품 3D 메쉬를 저장하는 배열

// 부품 데이터 목록 (부품 이름, 3D 파일 경로, 설명, 색상, 씬 내에서의 초기 위치, 초기 강조 여부)
const partData = [
    // position은 부품이 중앙에서 돌아갈 배경 위치로 사용됩니다.
    { name: "Front Camera", file: "/models/camera.stl", desc: "그림 인식, 사물 식별", color: 0x3366ff, position: new THREE.Vector3(0, 0.5, 0), isInitial: true },
    { name: "Rear Camera", file: "/models/camera.stl", desc: "눈동자 시선 추적", color: 0x33aaff, position: new THREE.Vector3(1.0, 0.5, 0), isInitial: false },
    { name: "Jetson Nano", file: "/models/jetsonnano.stl", desc: "소형 컴퓨터, AI 모델 작동", color: 0x00aa88, position: new THREE.Vector3(-1.0, 0.5, 0), isInitial: false },
    { name: "3D Printed Frame", file: "/models/frame.stl", desc: "3D 프린터로 디자인하여 출력", color: 0xffffff, position: new THREE.Vector3(0, 0.5, 1.0), isInitial: false },
];

// 1. 컴퓨터 그래픽스 기능: 씬 정리,  정리 함수 (window.clearHighlightAssets)
//    - 다른 모드로 전환 시 호출되어 강조 모드의 DOM 및 3D 자산을 완전히 제거
window.clearHighlightAssets = function() {
    // 1. DOM 컨테이너(버튼 패널) 제거
    if (highlightContainer && highlightContainer.parentNode) {
        highlightContainer.parentNode.removeChild(highlightContainer);
        highlightContainer = null;
    }
    // 2. 부품 설명 패널 숨김
    const panel = document.getElementById("info-panel");
    if (panel) panel.style.display = 'none';
    
    // 3. 씬에서 3D 메쉬 제거 (isHighlightPart 플래그를 가진 모든 메쉬)
    if (window.scene) { 
        const meshesToRemove = [];
        window.scene.traverse((obj) => {
            if (obj.userData.isHighlightPart) {
                meshesToRemove.push(obj);
            }
        });
        meshesToRemove.forEach(obj => window.scene.remove(obj));
    }
    
    // 4. 전역 변수 초기화
    allHighlightParts = [];
    currentHighlightMesh = null;
    console.log(" Highlight Assets 정리 완료");
};

// 2. [DOM 로직] 설명 패널 표시 함수
function showPanel(title, desc) {
    let panel = document.getElementById("info-panel");
    if (!panel) return;
    
    panel.innerHTML = `<h3>${title}</h3><p>${desc}</p>`;
    panel.style.display = 'block'; 
}

// 3. 컴퓨터 그래픽스 기능: 애니메이션 로직 & 시각 효과, 부품 강조 애니메이션 및 등장 처리
//    - TWEEN을 사용한 위치 이동 및 색상/투명도 변화를 구현하여 부품 전환 효과
//    - 로직: 이전 부품을 배경으로 밀어내고, 새 부품을 중앙으로 불러와 멈춤

function animateHighlight(scene, part) {
    if (!window.TWEEN) return;
    
    // 1. 기존 강조 메쉬 처리: 중앙에서 밀어내고 배경으로 남김
    if (currentHighlightMesh) {
        const prevPartData = partData.find(p => p.name === currentHighlightMesh.userData.name);
        
        // 애니메이션: 위치 이전 부품을 중앙에서 원래 위치(배경 위치)로 이동시켜 중앙을 비움
        if (prevPartData) {
            new window.TWEEN.Tween(currentHighlightMesh.position)
                .to(prevPartData.position, 1500) // 1500ms 동안 원래 위치로 이동
                .easing(window.TWEEN.Easing.Cubic.Out)
                .start();
        }

        // 시각 효과: 흐려짐 이전 부품을 배경색(0x555555) 및 흐리게(opacity: 0.3) 처리하여 사라지지 않고 멈춰있게 함
        new window.TWEEN.Tween(currentHighlightMesh.material.color)
            .to(new THREE.Color(0x555555), 300) 
            .start();
        new window.TWEEN.Tween(currentHighlightMesh.material)
            .to({ opacity: 0.3 }, 300) 
            .start();
    }
    
    // 2. 새로운 부품 찾기 및 설정
    const mesh = allHighlightParts.find(m => m.userData.name === part.name);
    if (!mesh) return;

    currentHighlightMesh = mesh;
    mesh.visible = true;
    
    // 3. 애니메이션: 위치 강조 효과: 새로운 부품을 중앙(0, 0.5, 0)으로 이동 후 멈춤
    const endPos = new THREE.Vector3(0, 0.5, 0); 
    
    new window.TWEEN.Tween(mesh.position)
        .to(endPos, 800)
        .easing(window.TWEEN.Easing.Cubic.Out)
        .start();

    // 4. 시각 효과: 선명해짐 강조 효과: 페이드 인 (투명도 1) 및 원래 색상 복원
    mesh.material.opacity = 0;
    new window.TWEEN.Tween(mesh.material)
        .to({ opacity: 1 }, 800)
        .start();
        
    new window.TWEEN.Tween(mesh.material.color)
        .to(new THREE.Color(part.color), 800)
        .start();

    // 5. DOM 설명 표시
    showPanel(part.name, part.desc);
}

function createHighlightMenu(scene, camera, controls) {
    highlightContainer = document.createElement("div");
    highlightContainer.id = "highlight-menu";
    highlightContainer.style.position = "absolute";
    highlightContainer.style.top = "20px";
    highlightContainer.style.left = "20px";
    
    // 사이드 패널 크기 및 스타일 조정 (사이드바 크기 확보)
    highlightContainer.style.width = "300px"; 
    highlightContainer.style.padding = "30px"; 
    highlightContainer.style.background = "rgba(0, 0, 0, 0.9)"; 
    highlightContainer.style.borderRadius = "15px"; 
    highlightContainer.style.zIndex = "10";
    document.body.appendChild(highlightContainer);

    // 메뉴 제목 스타일
    const title = document.createElement("h3");
    title.textContent = " 부품 강조"; 
    title.style.color = "white";
    title.style.margin = "0 0 25px 0"; 
    title.style.fontSize = "24px"; 
    highlightContainer.appendChild(title);

    // 각 부품별 버튼 생성 및 스타일 적용
    partData.forEach(part => {
        const button = document.createElement("button");
        button.textContent = part.name;
        button.style.display = "block";
        
       
        button.style.margin = "20px 0";
        button.style.padding = "30px 20px"; 
        button.style.width = "100%";
        button.style.border = "none";
        button.style.borderRadius = "12px"; 
        button.style.fontSize = "22px";
        
        button.style.background = part.isInitial ? "#4CAF50" : "#6c757d"; 
        button.style.color = "white";
        button.style.cursor = "pointer";
        
        button.addEventListener("click", () => {
            animateHighlight(scene, part);
            // 선택된 버튼 색상 강조
            highlightContainer.querySelectorAll('button').forEach(btn => {
                btn.style.background = "#6c757d";
            });
            button.style.background = "#4CAF50";
        });
        
        highlightContainer.appendChild(button);
    });
    
    console.log(" Highlight 메뉴 생성 완료");
}

// 5. 컴퓨터 그래픽스 기능: 씬 초기화 및 로딩] 강조 모드 메인 함수
//    - 모드 진입 시 호출되며, 씬 배경 설정 및 3D 부품을 로드.
window.highlightMode = function (scene, renderer, camera, controls) {
    console.log(" Highlight Mode 활성화");
    
    // 안전한 초기화를 위해 정리 함수 호출
    if (typeof window.clearHighlightAssets === 'function') {
        window.clearHighlightAssets();
    }
    allHighlightParts = []; 
    
    scene.background = new THREE.Color(0x333333); 
    scene.environment = null;
    renderer.toneMappingExposure = 1.0; 
    
    const stlLoader = new THREE.STLLoader();
    let loadedCount = 0;

    partData.forEach((part) => {
        stlLoader.load(part.file, (geometry) => {
            
            // 재질 설정 MeshStandardMaterial (Standard Material)을 사용하여 PBR 렌더링을 가능
            const mat = new THREE.MeshStandardMaterial({ 
                color: part.color, 
                roughness: 0.4, 
                metalness: 0.3,
                transparent: true, // 투명도 애니메이션을 위해 필수
                opacity: 0 // 초기에는 투명하게 설정
            });
            const mesh = new THREE.Mesh(geometry, mat);
            mesh.scale.set(0.01, 0.01, 0.01); 
            
            mesh.userData = {
                isHighlightPart: true,
                name: part.name,
                desc: part.desc,
            };

            mesh.position.copy(part.position); 
            mesh.visible = false; 
            scene.add(mesh);
            allHighlightParts.push(mesh);
            
            loadedCount++;

            // 초기 부품 표시 , 모든 부품 로드가 완료되면 메뉴 생성 및 첫 부품을 중앙에 표시
            if (loadedCount === partData.length) {
                console.log(" 모든 부품 로드 완료! 초기 부품 표시 준비.");
                
                createHighlightMenu(scene, camera, controls);
                
                const initialPartData = partData.find(p => p.isInitial);
                if (initialPartData) {
                    const initialMesh = allHighlightParts.find(m => m.userData.name === initialPartData.name);
                    
                    if (initialMesh) {
                        currentHighlightMesh = initialMesh;
                        
                        initialMesh.visible = true; 
                        initialMesh.material.opacity = 1; 
                        initialMesh.position.set(0, 0.5, 0); // 중앙 배치
                        
                        // 카메라 시점 조정
                        camera.position.set(0, 0.5, 2.5);
                        controls.target.set(0, 0.5, 0);
                        
                        showPanel(initialPartData.name, initialPartData.desc);
                        console.log(` 초기 부품 (${initialPartData.name}) 표시 완료.`);
                    }
                }
            }
        });
    });
};