import house from "./models/house.glb";
import witchs_house from "./models/witchs_house.glb";
import basic_house_map from "./models/basic_house_map.glb";
import { OrbitControls, useGLTF } from "@react-three/drei";
import ThreeDHandler from "./components/ThreeDHandler";
import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import Floor3D from "./components/ThreeDHandler/Floor3D";
import FloorDragRoomEditor from "./components/TwoDHandler/FloorDragRoomEditor";

export default function App() {
  useGLTF.preload(house);
  useGLTF.preload(witchs_house);
  useGLTF.preload(basic_house_map);
  const modelOptions = [
    { name: "House", path: house },
    { name: "Witch House", path: witchs_house },
    { name: "Basic Map", path: basic_house_map },
  ];

  const [viewMode, setViewMode] = useState("3D");
  const [floorData, setFloorData] = useState(null);
  const handleFinish = (points) => {
    console.log('points', points);
    setFloorData(points);
  }
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      {/* {viewMode === "3D" && <ThreeDHandler model={house} />} */}
      <div style={{ display: "flex" }}>
        <div style={{ width: "50%" }}>
          <FloorDragRoomEditor  onCreateRoom={handleFinish} />
        </div>
        <div style={{ width: "50%", height: "600px" }}>
          <Canvas   camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 10000 }}>
            <color attach="background" args={["#f2f2f2"]} />
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls />
            <axesHelper args={[10]} />
            {floorData && <Floor3D points2D={floorData} />}
          </Canvas>
        </div>
      </div>
      {/* UI bên ngoài */}
      
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          color: "white",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 15px",
          borderRadius: 5,
          fontFamily: "monospace",
          fontSize: 14,
        }}
      >
        <div>Camera Controls:</div>
        <div>W/S - Tiến/Lùi</div>
        <div>A/D - Trái/Phải</div>
        <div>Q/E - Xuống/Lên</div>
        <div>Chuột phải - Xoay camera</div>
        <div>Scroll - Zoom</div>

        {modelOptions.map((model, i) => (
          <div
            key={i}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("model", model.path.toString())
            }
            style={{
              margin: "10px 0",
              cursor: "grab",
              padding: "5px",
              background: "#444",
              borderRadius: "4px",
            }}
          >
            {model.name}
          </div>
        ))}
      </div>
      <div
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          color: "white",
          background: "rgba(0,0,0,0.7)",
          padding: "10px 15px",
          borderRadius: 5,
          fontFamily: "monospace",
          fontSize: 14,
        }}
      >
        <div>
          <button onClick={() => setViewMode("2D")}>2D</button>
          <button onClick={() => setViewMode("3D")}>3D</button>
        </div>
      </div>
    </div>
  );
}
