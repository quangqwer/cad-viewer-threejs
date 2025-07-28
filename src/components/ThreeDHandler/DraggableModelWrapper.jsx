import { useGLTF } from "@react-three/drei";
import { useEffect, useRef, useState, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useDrag } from "@use-gesture/react";
import * as THREE from "three";
import debounce from 'lodash/debounce';

function normalizeAngleDifference(angle) {
  while (angle > Math.PI) angle -= 2 * Math.PI;
  while (angle < -Math.PI) angle += 2 * Math.PI;
  return angle;
}

export default function DraggableModelWrapper({
  model,
  initialPosition = [0, 0, 0],
  rotationX = 0,
  rotationY = 0,
  rotationZ = 0,
  onChangePosition,
  isSelected,
  onSelect,
}) {
  const { scene: originalScene } = useGLTF(model ?? ""); // gọi hook luôn, tránh condition
  const scene = useMemo(() => originalScene.clone(true), [originalScene]);
  const { camera, size } = useThree();

  const groupRef = useRef();
  const ringRef = useRef();
  const lastAngleRef = useRef(null);
  const lastReported = useRef({ position: new THREE.Vector3(), rotationY: null });

  const debouncedReport = useRef(
    debounce((position, rotationY) => {
      onChangePosition?.({ position, rotationY });
    }, 100)
  ).current;

  const [isDragging, setIsDragging] = useState(false);

  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const intersection = useMemo(() => new THREE.Vector3(), []);
  const dragOffset = useRef(new THREE.Vector3());
  const dragStart = useRef(new THREE.Vector3());

  const currentPosition = useRef(new THREE.Vector3(...initialPosition));
  const targetPosition = useRef(new THREE.Vector3(...initialPosition));

  const currentRotationY = useRef(rotationY ?? 0);
  const targetRotationY = useRef(rotationY ?? 0);

  useEffect(() => {
    if (!scene) return;

    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (!child.userData.materialCloned) {
          child.material = child.material.clone();
          child.userData.materialCloned = true;
        }
      }
    });
  }, [scene]);

  const bindMove = useDrag(
    ({ first, dragging, xy: [x, y] }) => {
      if (!isSelected) return;
      setIsDragging(dragging);

      const ndc = new THREE.Vector2(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1
      );

      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, intersection)) return;

      if (first) {
        dragStart.current.copy(currentPosition.current);
        dragOffset.current.subVectors(intersection, currentPosition.current);
      }

      const newPos = new THREE.Vector3().subVectors(
        intersection,
        dragOffset.current
      );
      targetPosition.current.set(newPos.x, dragStart.current.y, newPos.z);
    },
    { pointerEvents: true }
  );

  const bindRotate = useDrag(
    ({ xy: [x, y], first, last }) => {
      if (!isSelected) return;

      const ndc = new THREE.Vector2(
        (x / size.width) * 2 - 1,
        -(y / size.height) * 2 + 1
      );

      raycaster.setFromCamera(ndc, camera);
      if (!raycaster.ray.intersectPlane(plane, intersection)) return;

      const center = currentPosition.current.clone();
      const direction = new THREE.Vector2(
        intersection.x - center.x,
        intersection.z - center.z
      );

      const angle = Math.atan2(direction.y, direction.x);

      if (first) {
        lastAngleRef.current = angle;
      } else {
        let deltaAngle = angle - lastAngleRef.current;
        deltaAngle = normalizeAngleDifference(deltaAngle);
        lastAngleRef.current = angle;
        targetRotationY.current -= deltaAngle;
      }

      if (last) {
        lastAngleRef.current = null;
      }
    },
    { pointerEvents: true }
  );

  useFrame(() => {
    currentPosition.current.lerp(targetPosition.current, 0.1);
    currentRotationY.current +=
      (targetRotationY.current - currentRotationY.current) * 0.1;

    if (groupRef.current) {
      groupRef.current.position.copy(currentPosition.current);
      groupRef.current.rotation.set(
        rotationX ?? 0,
        currentRotationY.current ?? 0,
        rotationZ ?? 0
      );
    }

    if (ringRef.current) {
      ringRef.current.position.set(
        currentPosition.current.x,
        0.01,
        currentPosition.current.z
      );
      ringRef.current.rotation.set(-Math.PI / 2, 0, 0);
    }

    const pos = currentPosition.current;
    const rot = currentRotationY.current;
    const last = lastReported.current;

    const positionChanged = !pos.equals(last.position);
    const rotationChanged = Math.abs(rot - last.rotationY) > 0.001;

    if (positionChanged || rotationChanged) {
      debouncedReport(pos.clone(), rot);
      last.position.copy(pos);
      last.rotationY = rot;
    }
  });

  const { radius, thickness } = useMemo(() => {
    if (!scene) return { radius: 1, thickness: 0.1 };
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxSize = Math.max(size.x, size.z);
    return {
      radius: maxSize / 1.5,
      thickness: maxSize / 6,
    };
  }, [scene]);

  if (!scene) return null;

  return (
    <>
      {isSelected && (
        <mesh
          ref={ringRef}
          {...bindRotate()}
          onClick={(e) => e.stopPropagation()}
          renderOrder={999}
        >
          <ringGeometry args={[radius - thickness / 2, radius + thickness / 2, 64]} />
          <meshBasicMaterial
            color="gray"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            depthTest={false}
          />
        </mesh>
      )}

      <group
        ref={groupRef}
        {...bindMove()}
        onClick={(e) => {
          e.stopPropagation();
          if (!isDragging) onSelect();
        }}
      >
        <primitive object={scene} />
      </group>
    </>
  );
}
