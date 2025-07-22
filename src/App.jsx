import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useRef, useState } from 'react';
import InteractiveModel from './components/InteractiveModel';
import CameraKeyboardControls from './components/CameraGroundPlaneControls';

export default function App() {
  const controlsRef = useRef();
  const [modelName, setModelName] = useState('house');

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas
        camera={{ position: [5, 5, 5], fov: 50 }}
        shadows
        onCreated={({ gl, camera, scene, raycaster, mouse, set }) => {
          // Gắn OrbitControls vào context
          set({ controls: controlsRef.current });
        }}
      >
         <color attach="background" args={['#f2f2f2']} />  {/* Nền trắng */}
        <ambientLight intensity={3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        <InteractiveModel modelName={modelName} />
        d<CameraKeyboardControls moveSpeed={0.2} />
        <OrbitControls 
          ref={controlsRef}
          // Cấu hình mouse buttons
          mouseButtons={{
            LEFT: null,           // Tắt rotate khi nhấn chuột trái
            MIDDLE: 2,           // Chuột giữa để zoom (THREE.MOUSE.DOLLY)
            RIGHT: 0             // Chuột phải để rotate (THREE.MOUSE.ROTATE)
          }}
          // // Hoặc có thể dùng các props riêng lẻ
          // enableRotate={true}    // Bật/tắt rotate
          // enablePan={true}       // Bật/tắt pan
          // enableZoom={true}      // Bật/tắt zoom
        />
      </Canvas>
      
      {/* Hướng dẫn sử dụng */}
      <div style={{
        position: 'absolute',
        top: 20,
        left: 20,
        color: 'white',
        background: 'rgba(0,0,0,0.7)',
        padding: '10px 15px',
        borderRadius: 5,
        fontFamily: 'monospace',
        fontSize: 14
      }}>
        <div>🎮 Camera Controls:</div>
        <div>W/S - Tiến/Lùi</div>
        <div>A/D - Trái/Phải</div>
        <div>Q/E - Xuống/Lên</div>
        <div>Chuột phải - Xoay camera</div>
        <div>Scroll - Zoom</div>
        <div>
          <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} />
          <button onClick={() => setModelName('house')}>House</button>
          <button onClick={() => setModelName('witchs_house')}>Witch's House</button>
        </div>
      </div>
    </div>
  );
}