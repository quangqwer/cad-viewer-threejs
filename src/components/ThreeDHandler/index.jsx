import { useGLTF } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useRef, useState, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import CameraKeyboardControls from "./CameraGroundPlaneControls";
import DraggableModelWrapper from "./DraggableModelWrapper";
import DropHandler from "./DropHandler";
import { Environment } from "@react-three/drei";
import { Suspense } from "react";

const ThreeDHandler = ({ model }) => {
  const controlsRef = useRef();
  const [droppedModels, setDroppedModels] = useState([]);

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (controlsRef.current) {
      const controls = controlsRef.current;
      const currentTarget = controls.target.clone();
      const currentPosition = controls.object.position.clone();

      setTimeout(() => {
        controls.object.position.copy(currentPosition);
        controls.target.copy(currentTarget);
        controls.update();
      }, 10);
    }
  }, [droppedModels]);

  return (
    <Canvas
      shadows
      camera={{ position: [5, 5, 5], fov: 50, near: 0.1, far: 10000 }}
      onPointerMissed={() => setSelectedId(null)}
      // frameloop="demand" // 👈 Optional: bật nếu muốn tối ưu
    >
      <color attach="background" args={["#f2f2f2"]} />
      <ambientLight intensity={3} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <Environment preset="city" />
      <axesHelper args={[10]} />
      <OrbitControls
        ref={controlsRef}
        enabled={!selectedId}
        mouseButtons={{ LEFT: 0, RIGHT: 2 }}
        makeDefault
      />
      <CameraKeyboardControls moveSpeed={0.2} />
      <Suspense fallback={null}>
        <DraggableModelWrapper
          model={model}
          initialPosition={[0, 0, 0]}
          onChangePosition={(data) => console.log("onChangePosition", data)}
          isSelected={selectedId === "main-model"}
          onSelect={() => setSelectedId("main-model")}
        />
        {droppedModels.map((item) => (
          <DraggableModelWrapper
            key={item.id}
            model={item.path}
            initialPosition={item.position}
            rotationX={item.rotation.x}
            rotationY={item.rotation.y}
            rotationZ={item.rotation.z}
            autoFocus={false}
            onSelect={() => setSelectedId(item.id)}
            onChangePosition={(data) => {
              // cập nhật lại vị trí / rotation khi drag
              console.log("onChangePosition", data);
              setDroppedModels((prev) =>
                prev.map((m) =>
                  m.id === item.id
                    ? {
                        ...m,
                        position: data.position,
                        rotation: { ...m.rotation, y: data.rotationY },
                      }
                    : m
                )
              );
            }}
            isSelected={selectedId === item.id}
          />
        ))}
      </Suspense>
      <DropHandler setDroppedModels={setDroppedModels} />
    </Canvas>
  );
};

export default ThreeDHandler;
