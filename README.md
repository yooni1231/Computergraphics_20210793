## 프로젝트 소개
이 프로젝트는 스마트 아이웨어의 내부 구조 및 작동 원리를 효과적으로 설명하기 위한 웹 기반 인터랙티브 3D 시각화 도구입니다. 단순한 3D 모델 뷰어를 넘어, 사용자가 직접 부품을 분해/조립하고 특정 구성 요소의 기능을 강조하여 볼 수 있는 멀티 모드 구조를 구현하여 기술 이해도와 사용자 몰입도를 극대화했습니다.

## 주제 선정 계기
스마트 아이웨어에 AI 모델이 결합되면서 복잡해진 내부 구성(카메라 모듈, Jetson Nano 등)을 비전공자에게 기존의 문서나 구두 설명 방식으로는 직관적으로 전달하기 어렵다는 문제를 해결하고자 했습니다.

## 목표	배경
인터랙티브 설명 도구 개발	3D 기반 몰입형 시각화를 통해 제품 구조 및 작동 원리에 대한 설명 효율성 극대화
핵심 설계 의도	직관성 (부품 분리/조립 애니메이션) 및 몰입도 (HDRI 렌더링)

## 사용 기술 스택 (Tech Stack)
구분	기술 / 라이브러리	역할
3D 프레임워크	Three.js (WebGL 렌더링)	3D 씬 구성 및 렌더링 엔진
애니메이션	Tween.js	카메라 보간, 부품 분리/강조/복귀 등 부드러운 상태 전환
물리 엔진	Cannon.js	분해 모드에서 부품의 낙하 및 충돌 시뮬레이션 구현
데이터 형식	STL / OBJ, EXR (HDRI 환경 맵)	3D 모델 및 Image Based Lighting(IBL) 환경 조명

## 핵심 기능: 멀티 모드 인터페이스
사용자에게 깊이 있는 정보를 제공하기 위해 4가지 인터랙티브 모드를 구현했습니다.

모드 이름	기능	핵심 구현 로직
착용 모드 (Assemble)	전체 외관 확인 및 360도 회전	Three.js OrbitControls, TWEEN을 이용한 부품 통합 복귀 애니메이션
분해 모드 (Diassemble)	각 부품 위치 및 결합 상태 시각화	TWEEN.js (분리 애니메이션) 완료 후 Cannon.js (물리 시뮬레이션) 전환 및 Raycasting
강조 모드 (Highlight)	특정 부품의 기능 및 작동 원리 집중 설명	TWEEN을 이용한 선택 부품 중앙 이동/투명도 강조, 나머지 부품 흐리게 처리
전시 모드 (Exhibition)	제품의 외부 환경 반사 확인	EXRLoader를 사용한 HDRI 기반 IBL 환경 구현, 톤 매핑 Exposure 조절

## 파일 구조 및 개발 과정
## 파일 구조
project-root/
├── public/
│   ├── index.html          # 메인 HTML 파일 (캔버스 및 UI 정의)
│   ├── js/
│   │   ├── main.js         # 메인 3D 씬 구성, 렌더링 루프, 모드 전환 로직
│   │   └── loaders.js      # 모델 및 텍스처 로딩 관리
│   └── models/
│       ├── art_studio.exr  # HDRI 환경 맵 (전시 모드 배경 및 IBL)
│       ├── frame.stl, camera.stl, jetsonnano.stl # 개별 부품 STL 파일
│       └── glasses_total.obj # 통합 모델
└── package.json            # 프로젝트 메타데이터 및 의존성 정의
## 주요 트러블 슈팅 (Trouble Shooting)
문제	해결	배운 점
개별 애니메이션 불가 (STL/OBJ)	부품별 개별 STL 파일로 분할 로드하여 물리적 좌표를 계산해 애니메이션에 활용.	glTF/FBX와 같은 계층 구조 포맷의 필요성 인지.
UMD 라이브러리 통합	UMD 기반 라이브러리(TWEEN.js, Cannon.js)를 window 객체를 통해 접근하도록 명확히 설정.	UMD와 ES Module의 로드 방식 차이 이해.
모드 전환 시 객체 중복	모드 전환 로직에 이전 모드의 부품 객체 및 물리 엔진 바디를 제거하고 상태를 초기화하는 cleanup 루틴 구현.	복잡한 상태 관리에서 cleanup 함수의 중요성 체감.

## 결과물 및 시연
🔗 GitHub Repository
https://github.com/yooni1231/computergraphics_20210793

## 시연 영상 (YouTube)
https://youtu.be/Scf4R2qSGmg

## 성과 및 향후 계획
구분	내용
주요 성과	Three.js 기반으로 TWEEN을 활용한 복잡한 상태 관리 및 CANNON을 활용한 역동적인 물리 시뮬레이션을 구현하여, 단순 뷰어를 넘어서는 기능 확장성을 직접 경험.
배운 점	Raycasting, IBL, 톤 매핑 등 컴퓨터 그래픽스 기본 원리 실습, 라이브러리별 역할 이해, 3D 데이터 형식의 중요성 인지.
향후 계획	Shader 기반 시각 효과 (발광 효과 등) 구현, 복잡한 시퀀스를 관리하는 인터랙티브 스토리텔링 타임라인 도입, WebXR/AR 기능 통합을 통한 실감나는 경험 제공.

## 프로젝트 확장 
https://github.com/2025-DSWU-CS-FP
