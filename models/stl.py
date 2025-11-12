import trimesh

glasses = trimesh.load('models\glasses.stl')
camera = trimesh.load('models\camera.stl')

# 카메라를 약간 위쪽으로 이동
camera.apply_translation([0, 0, 20])

# 두 mesh 합치기
merged = trimesh.util.concatenate([glasses, camera])
merged.export('glasses_with_camera.stl')
