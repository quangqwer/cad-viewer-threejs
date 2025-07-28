import { useMemo } from "react";
import * as THREE from "three";

export default function Room3D({ points2D }) {
  const wallThickness = 1.5;
  const wallHeight = 30;

  const floorShape = useMemo(() => {
    return new THREE.Shape(points2D.map((p) => new THREE.Vector2(p.x, -p.y)));
  }, [points2D]);

  const wallMeshes = useMemo(() => {
    const meshes = [];

    for (let i = 0; i < points2D.length; i++) {
        const a = points2D[i];
        const b = points2D[(i + 1) % points2D.length];
      
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const length = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
      
        const geometry = new THREE.BoxGeometry(length, wallHeight, wallThickness);
        const material = new THREE.MeshStandardMaterial({ color: "black" });
        const wall = new THREE.Mesh(geometry, material);
      
        // Tính trung điểm
        const centerX = (a.x + b.x) / 2;
        const centerY = -((a.y + b.y) / 2);
      
        // 👉 Offset vị trí wall vào phía trong góc
        // vector pháp tuyến (vuông góc với cạnh)
        const normalX = -dy / length;
        const normalY = dx / length;
      
        // Di chuyển wall vào trong nửa độ dày
        const offsetX = (wallThickness / 2) * normalX;
        const offsetY = (wallThickness / 2) * normalY;
      
        wall.position.set(centerX + offsetX, centerY - offsetY, wallHeight / 2);
      
        // 👉 Xoay đúng hướng
        wall.rotation.z = -angle;
      
        // Xử lý dựng đứng (cũ)
        if (i === 1 || i === 3) {
          wall.rotation.y = -Math.PI / 2;
        } else {
          wall.rotation.x = Math.PI / 2;
        }
      
        meshes.push(wall);
      }

    return meshes;
  }, [points2D]);

  return (
    <group>
      {/* Sàn nhà */}
      <mesh>
        <extrudeGeometry
          args={[floorShape, { depth: 1, bevelEnabled: false }]}
        />
        <meshStandardMaterial color="gold" />
      </mesh>

      {/* Tường dựng đứng đúng hướng từng cạnh */}
      {wallMeshes.map((wall, idx) => (
        <primitive key={idx} object={wall} />
      ))}
    </group>
  );
}
