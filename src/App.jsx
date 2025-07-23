import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { useRef, useState, useEffect } from 'react';
import InteractiveModel from './components/InteractiveModel';
import CameraKeyboardControls from './components/CameraGroundPlaneControls';
import house from './models/house.glb';
import witchs_house from './models/witchs_house.glb';
import basic_house_map from './models/basic_house_map.glb';

function ControlsWrapper({ controlsRef }) {
  const { set } = useThree();

  useEffect(() => {
    if (controlsRef.current) {
      set({ controls: controlsRef.current }); // ✅ Gán controls sau khi mount
    }
  }, [controlsRef.current]);

  return (
    <OrbitControls
      ref={controlsRef}
      mouseButtons={{
        LEFT: null,
        MIDDLE: 2,
        RIGHT: 0,
      }}
    />
  );
}

export default function App() {
  const controlsRef = useRef();
  const [model, setModel] = useState(house);

   // 👉 Các state xoay mô hình
   const [rotationX, setRotationX] = useState(0);
   const [rotationY, setRotationY] = useState(0);
   const [rotationZ, setRotationZ] = useState(0);

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 10000 }} shadows>
        <color attach="background" args={['#f2f2f2']} />
        <ambientLight intensity={3} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
        <Environment preset="city" />
        <axesHelper args={[10]} /> 
        <ControlsWrapper controlsRef={controlsRef} /> {/* 👈 wrap OrbitControls */}
        <CameraKeyboardControls moveSpeed={0.2} />
        <InteractiveModel 
          model={model}
          rotationX={rotationX}
          rotationY={rotationY}
          rotationZ={rotationZ}
        />
      </Canvas>

      {/* UI bên ngoài */}
      <div style={{ position: 'absolute', top: 20, left: 20, color: 'white', background: 'rgba(0,0,0,0.7)', padding: '10px 15px', borderRadius: 5, fontFamily: 'monospace', fontSize: 14 }}>
        <div>Camera Controls:</div>
        <div>W/S - Tiến/Lùi</div>
        <div>A/D - Trái/Phải</div>
        <div>Q/E - Xuống/Lên</div>
        <div>Chuột phải - Xoay camera</div>
        <div>Scroll - Zoom</div>
        <div>
          <select value={model} onChange={(e) => setModel(e.target.value)}>
            <option value={house}>House</option>
            <option value={witchs_house}>Witch's House</option>
            <option value={basic_house_map}>Basic House Map</option>
          </select>
        </div>
        <div><strong>🧭 Xoay mô hình:</strong></div>
        <div>
          X:
          <select value={rotationX} onChange={(e) => setRotationX(Number(e.target.value))}>
            <option value={0}>0°</option>
            <option value={Math.PI / 2}>90°</option>
            <option value={Math.PI}>180°</option>
            <option value={(3 * Math.PI) / 2}>270°</option>
          </select>
        </div>
        <div>
          Y:
          <select value={rotationY} onChange={(e) => setRotationY(Number(e.target.value))}>
            <option value={0}>0°</option>
            <option value={Math.PI / 2}>90°</option>
            <option value={Math.PI}>180°</option>
            <option value={(3 * Math.PI) / 2}>270°</option>
          </select>
        </div>
        <div>
          Z:
          <select value={rotationZ} onChange={(e) => setRotationZ(Number(e.target.value))}>
            <option value={0}>0°</option>
            <option value={Math.PI / 2}>90°</option>
            <option value={Math.PI}>180°</option>
            <option value={(3 * Math.PI) / 2}>270°</option>
          </select>
        </div>
      </div>
    </div>
  );
}