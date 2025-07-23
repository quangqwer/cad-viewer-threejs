import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CameraGroundPlaneControls({ moveSpeed = 0.1 }) {
  const { camera, controls } = useThree();
  const keys = useRef({});

  useEffect(() => {
    const handleKeyDown = (event) => {
      keys.current[event.key.toLowerCase()] = true;
    };

    const handleKeyUp = (event) => {
      keys.current[event.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useFrame(() => {
    if (!controls || !controls.target) return;

    const lookDirection = new THREE.Vector3();
    lookDirection.subVectors(controls.target, camera.position).normalize();

    const forward = new THREE.Vector3(lookDirection.x, 0, lookDirection.z).normalize();
    const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();

    if (keys.current['w']) {
      camera.position.addScaledVector(forward, moveSpeed);
      controls.target.addScaledVector(forward, moveSpeed);
    }
    if (keys.current['s']) {
      camera.position.addScaledVector(forward, -moveSpeed);
      controls.target.addScaledVector(forward, -moveSpeed);
    }
    if (keys.current['a']) {
      camera.position.addScaledVector(right, -moveSpeed);
      controls.target.addScaledVector(right, -moveSpeed);
    }
    if (keys.current['d']) {
      camera.position.addScaledVector(right, moveSpeed);
      controls.target.addScaledVector(right, moveSpeed);
    }

    if (keys.current['q']) {
      camera.position.y -= moveSpeed;
      controls.target.y -= moveSpeed;
    }
    if (keys.current['e']) {
      camera.position.y += moveSpeed;
      controls.target.y += moveSpeed;
    }

    controls.update();
  });

  return null;
}