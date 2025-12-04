// /modules/highlightMode.js

let highlightContainer = null;
let currentHighlightMesh = null;
let allHighlightParts = []; 
const partData = [
    { name: "Front Camera", file: "/models/camera.stl", desc: "그림 인식, 사물 식별", color: 0x3366ff, position: new THREE.Vector3(0, 0.5, 0), isInitial: true },
    { name: "Rear Camera", file: "/models/camera.stl", desc: "눈동자 시선 추적", color: 0x33aaff, position: new THREE.Vector3(1.0, 0.5, 0), isInitial: false },
    { name: "Jetson Nano", file: "/models/jetsonnano.stl", desc: "소형 컴퓨터, AI 모델 작동", color: 0x00aa88, position: new THREE.Vector3(-1.0, 0.5, 0), isInitial: false },
    { name: "3D Printed Frame", file: "/models/frame.stl", desc: "3D 프린터로 디자인하여 출력", color: 0xffffff, position: new THREE.Vector3(0, 0.5, 1.0), isInitial: false },
];



function createHighlightMenu(scene, camera, controls) {
    //  기존 메뉴 정리
    window.clearHighlightAssets(); 

    highlightContainer = document.createElement("div");
    highlightContainer.id = "highlight-menu";
    highlightContainer.style.position = "absolute";
    highlightContainer.style.top = "20px";
    highlightContainer.style.left = "20px";
    highlightContainer.style.padding = "10px";
    highlightContainer.style.background = "rgba(0, 0, 0, 0.7)";
    highlightContainer.style.borderRadius = "8px";
    highlightContainer.style.zIndex = "10";
    document.body.appendChild(highlightContainer);

    // 메뉴 제목
    const title = document.createElement("h3");
    title.textContent = "🔍 부품 강조 선택";
    title.style.color = "white";
    title.style.margin = "0 0 10px 0";
    title.style.fontSize = "16px";
    highlightContainer.appendChild(title);

    // 각 부품별 버튼 생성
    partData.forEach(part => {
        const button = document.createElement("button");
        button.textContent = part.name;
        button.style.display = "block";
        button.style.margin = "5px 0";
        button.style.padding = "8px";
        button.style.border = "none";
        button.style.borderRadius = "5px";
        button.style.background = part.isInitial ? "#4CAF50" : "#6c757d"; 
        button.style.color = "white";
        button.style.cursor = "pointer";
        
        button.addEventListener("click", () => {
            animateHighlight(scene, part);
            // 버튼 색상 업데이트
            highlightContainer.querySelectorAll('button').forEach(btn => {
                btn.style.background = "#6c757d";
            });
            button.style.background = "#4CAF50";
        });
        
        highlightContainer.appendChild(button);
    });
    
    console.log("✅ Highlight 메뉴 생성 완료");
}

// 강조 모드 메인 함수 (비동기 로드 관리)
window.highlightMode = function (scene, renderer, camera, controls) {
    console.log("💡 Highlight Mode 활성화");
    
    window.clearHighlightAssets();
    allHighlightParts = []; // 로드 시작 전 초기화
    
    // 조명 설정 (로직 동일)
    scene.traverse(obj => {
        if (obj.isLight && obj.userData.isMainLight) {
            obj.visible = true;
        }
    });

    const stlLoader = new THREE.STLLoader();
    let loadedCount = 0;

    partData.forEach((part) => {
        stlLoader.load(part.file, (geometry) => {
            // ... (Mesh 및 Material 생성 로직은 동일) ...
            const mat = new THREE.MeshStandardMaterial({ 
                color: part.color, 
                roughness: 0.4, 
                metalness: 0.3,
                transparent: true, 
                opacity: 0
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

            //  모든 부품 로드 완료 시점 확인
            if (loadedCount === partData.length) {
                // 1. DOM 메뉴 생성
                createHighlightMenu(scene, camera, controls);
                
                // 2. Front Camera 초기 표시
                const initialPartData = partData.find(p => p.isInitial);
                if (initialPartData) {
                    // Mesh를 찾아서 animateHighlight 실행
                    const initialMesh = allHighlightParts.find(m => m.userData.name === initialPartData.name);
                    if (initialMesh) {
                        currentHighlightMesh = initialMesh;
                        initialMesh.visible = true;
                        initialMesh.material.opacity = 1;
                        showPanel(initialPartData.name, initialPartData.desc);
                    }
                }
            }
        });
    });
};