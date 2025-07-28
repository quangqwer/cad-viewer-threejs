import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useDrag } from '@use-gesture/react';
import * as THREE from 'three';

function DraggableMesh({ originalMesh, camera, size, onSelect, isSelected }) {
  const meshRef = useRef();
  const circleRef = useRef();

  const initialPos = useMemo(() => {
    const pos = new THREE.Vector3();
    originalMesh.getWorldPosition(pos);
    return pos;
  }, [originalMesh]);

  const initialRot = useMemo(() => {
    const quaternion = new THREE.Quaternion();
    originalMesh.getWorldQuaternion(quaternion);
    return new THREE.Euler().setFromQuaternion(quaternion);
  }, [originalMesh]);

  const [scale] = useState(() => {
    const s = new THREE.Vector3();
    originalMesh.getWorldScale(s);
    return s;
  });
  const [isDragging, setIsDragging] = useState(false);

  const instance = useMemo(() => originalMesh.clone(), [originalMesh]);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);

  const dragOffset = useMemo(() => new THREE.Vector3(), []);
  const dragStart = useMemo(() => new THREE.Vector3(), []);

  const targetPosition = useRef(initialPos.clone());
  const currentPosition = useRef(initialPos.clone());
  const targetRotationZ = useRef(initialRot.z);
  const currentRotationZ = useRef(initialRot.z);

  const bind = useDrag(
    ({ first, last, down, movement: [mx, my], xy: [x, y], dragging }) => {
      if (!isSelected) return;
  
      setIsDragging(dragging); // ✅ luôn cập nhật trạng thái kéo
  
      const ndc = new THREE.Vector2(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1
      );
  
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.ray.intersectPlane(plane, intersection);
      if (!hit) return;
  
      if (first) {
        dragStart.copy(currentPosition.current);
        dragOffset.subVectors(intersection, currentPosition.current);
      }
  
      const newPos = new THREE.Vector3().subVectors(intersection, dragOffset);
      targetPosition.current.set(newPos.x, dragStart.y, newPos.z);
    },
    { pointerEvents: true }
  );

  const bindRotate = useDrag(
    ({ movement: [mx] }) => {
      if (!isSelected) return;
      targetRotationZ.current += mx * 0.0001; // tăng tốc độ xoay chút để rõ hơn
    },
    { pointerEvents: true }
  );

  useFrame(() => {
    // Nội suy vị trí và xoay
    currentPosition.current.lerp(targetPosition.current, 0.1);
    currentRotationZ.current += (targetRotationZ.current - currentRotationZ.current) * 0.1;
  
    if (meshRef.current) {
      meshRef.current.position.copy(currentPosition.current);
      meshRef.current.rotation.set(initialRot.x, initialRot.y, currentRotationZ.current);
    }
  
    if (circleRef.current) {
      circleRef.current.position.set(
        currentPosition.current.x,
        0.01,
        currentPosition.current.z
      );
      circleRef.current.rotation.set(-Math.PI / 2, 0, currentRotationZ.current);
    }
  });

  const radius = useMemo(() => {
    const box = new THREE.Box3().setFromObject(originalMesh);
    const size = new THREE.Vector3();
    box.getSize(size);
    return Math.sqrt(size.x ** 2 + size.z ** 2) / 2 + 0.1;
  }, [originalMesh]);

  return (
    <group>
    {isSelected && (
      <mesh
        ref={circleRef}
        {...bindRotate()}
        onClick={(e) => e.stopPropagation()}
        renderOrder={999}
      >
        <ringGeometry args={[radius - 0.1, radius + 0.5, 64]} />
        <meshBasicMaterial
          color="gray"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          depthTest={false}
        />
      </mesh>
    )}
  
    <primitive
      ref={meshRef}
      object={instance}
      position={currentPosition.current}
      rotation={[initialRot.x, initialRot.y, currentRotationZ.current]}
      scale={scale}
      {...bind()}
      onClick={(e) => {
        if (isDragging) {
          e.stopPropagation();
          console.log('🟢 Selected:', originalMesh.name); // ✅ Log tên khi chọn
          return;
        }
        e.stopPropagation();
        onSelect(originalMesh);
      }}
    />
  </group>
  );
}

export default function InteractiveModel({ model, rotationX, rotationY, rotationZ }) {
  const { scene } = useGLTF(model);
  const [selected, setSelected] = useState(null);
  const { camera, size } = useThree();

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.userData.materialCloned) {
          child.material = child.material.clone();
          child.userData = {
            name: child.name,
            materialCloned: true,
            originalEmissive: child.material.emissive?.getHex() || 0x000000,
          };
        }
      }
    });
  }, [scene]);

  // bao quát mô hình đối với mo hình quá to sẽ phóng to camera tầm nhìn
  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);
    console.log('📦 Center of model:', center);
    console.log('Scene size:', size);

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));
  
    // Căn vị trí camera sao cho mô hình vừa khung hình
    camera.position.set(center.x, center.y + maxDim / 2, center.z + distance * 1.2);
    camera.lookAt(center);
  
    // Nếu có OrbitControls
    if (camera?.controls) {
      camera.controls.target.copy(center);
      camera.controls.update();
    }
  }, [scene, camera]);

  const meshes = useMemo(() => {
    const list = [];
    scene.traverse((child) => {
      if (child.isMesh) {
        list.push(child);
      }
    });
    return list;
  }, [scene]);

  return (
    <group rotation={[rotationX, rotationY, rotationZ]} >
      {meshes.map((mesh) => (
        <DraggableMesh
          key={mesh.uuid}
          originalMesh={mesh}
          camera={camera}
          size={size}
          onSelect={setSelected}
          isSelected={selected === mesh}
        />
      ))}
    </group>
  );
}
