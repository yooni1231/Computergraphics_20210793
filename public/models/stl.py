import trimesh
import numpy as np
import trimesh.transformations as tf

# 1. Load meshes
glasses = trimesh.load('models/glasses.stl')
camera = trimesh.load('models/camera.stl')

# 2. Move camera center to origin
camera_center = camera.bounds.mean(axis=0)
camera.apply_translation(-camera_center)

# 3. 코 브리지 좌표
target_point = np.array([-3.09586334, -24.48522949, 0.75559235])
camera.apply_translation(target_point)

# 4. 필요 시 회전 (예: 카메라 방향 맞춤)
# angle = np.radians(90)
# R = tf.rotation_matrix(angle, [0,0,1])
# camera.apply_transform(R)

# 5. Merge meshes and export
merged = trimesh.util.concatenate([glasses, camera])
merged.export('models/glasses_with_camera_on_nosebridge.stl')
print("STL export 완료")
