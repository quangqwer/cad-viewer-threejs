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
    let moved = false;
    
    // Lấy hướng từ camera đến target (điểm camera đang nhìn)
    const lookDirection = new THREE.Vector3();
    if (controls && controls.target) {
      // Tính vector từ camera đến target
      lookDirection.subVectors(controls.target, camera.position);
      lookDirection.normalize();
    } else {
      // Nếu không có controls, dùng hướng camera
      camera.getWorldDirection(lookDirection);
    }
    
    // Tạo vector forward trên mặt phẳng XZ
    const forward = new THREE.Vector3(lookDirection.x, 0, lookDirection.z);
    forward.normalize();
    
    // Tạo vector right - vuông góc với forward
    const right = new THREE.Vector3(-forward.z, 0, forward.x);
    
    // W - Tiến theo hướng đang nhìn
    if (keys.current['w']) {
      camera.position.x += forward.x * moveSpeed;
      camera.position.z += forward.z * moveSpeed;
      if (controls && controls.target) {
        controls.target.x += forward.x * moveSpeed;
        controls.target.z += forward.z * moveSpeed;
      }
      moved = true;
    }
    
    // S - Lùi ngược hướng đang nhìn
    if (keys.current['s']) {
      camera.position.x -= forward.x * moveSpeed;
      camera.position.z -= forward.z * moveSpeed;
      if (controls && controls.target) {
        controls.target.x -= forward.x * moveSpeed;
        controls.target.z -= forward.z * moveSpeed;
      }
      moved = true;
    }
    
    // A - Sang trái
    if (keys.current['a']) {
      camera.position.x -= right.x * moveSpeed;
      camera.position.z -= right.z * moveSpeed;
      if (controls && controls.target) {
        controls.target.x -= right.x * moveSpeed;
        controls.target.z -= right.z * moveSpeed;
      }
      moved = true;
    }
    
    // D - Sang phải
    if (keys.current['d']) {
      camera.position.x += right.x * moveSpeed;
      camera.position.z += right.z * moveSpeed;
      if (controls && controls.target) {
        controls.target.x += right.x * moveSpeed;
        controls.target.z += right.z * moveSpeed;
      }
      moved = true;
    }
    
    // Q/E - Thay đổi độ cao
    if (keys.current['q']) {
      camera.position.y -= moveSpeed;
      if (controls && controls.target) {
        controls.target.y -= moveSpeed;
      }
      moved = true;
    }
    if (keys.current['e']) {
      camera.position.y += moveSpeed;
      if (controls && controls.target) {
        controls.target.y += moveSpeed;
      }
      moved = true;
    }
    
    // Update OrbitControls
    if (controls && moved) {
      controls.update();
    }
  });

  return null;
}