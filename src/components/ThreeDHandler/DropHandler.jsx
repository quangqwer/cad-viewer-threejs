import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import { v4 as uuidv4 } from 'uuid';

export default function DropHandler({ setDroppedModels }) {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleDrop = (e) => {
      e.preventDefault();
      let modelPath = e.dataTransfer.getData('model');

      if (!modelPath || typeof modelPath !== 'string') return;

      const bounds = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - bounds.left) / bounds.width) * 2 - 1;
      const y = -((e.clientY - bounds.top) / bounds.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const point = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, point);

      if (!isFinite(point.x) || !isFinite(point.y) || !isFinite(point.z)) return;

      setDroppedModels(prev => [
        ...prev,
        {
          id: uuidv4(),
          path: modelPath,
          position: point.toArray(),
          rotation: { x: 0, y: 0, z: 0 }, // ✅ lưu rotation riêng
        }
      ]);
    };

    const canvas = gl.domElement;
    canvas.addEventListener('drop', handleDrop);
    canvas.addEventListener('dragover', (e) => e.preventDefault());

    return () => {
      canvas.removeEventListener('drop', handleDrop);
      canvas.removeEventListener('dragover', (e) => e.preventDefault());
    };
  }, [camera, gl, setDroppedModels]);

  return null;
}