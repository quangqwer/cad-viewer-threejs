import React, { useState, useRef } from "react";
import { Stage, Layer, Line, Circle } from "react-konva";

const width = 600;
const height = 600;

export default function FloorPlanEditor({ onFinish }) {
  const [points, setPoints] = useState([]);
  const [lines, setLines] = useState([]);

  const stageRef = useRef();

  const handleClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const centerX = width / 2;
    const centerY = height / 2;

    // Chuyển từ tọa độ màn hình sang tọa độ gốc giữa
    const logicalX = pos.x - centerX;
    const logicalY = pos.y - centerY;

    const newPoint = { x: logicalX, y: logicalY };
    setPoints((prev) => [...prev, newPoint]);

    if (points.length >= 1) {
      const last = points[points.length - 1];
      setLines((prev) => [...prev, { start: last, end: newPoint }]);
    }
  };

  const handleComplete = () => {
    if (points.length >= 3) {
      onFinish(points);
    }
  };

  return (
    <>
      <Stage
        width={width}
        height={height}
        ref={stageRef}
        onClick={handleClick}
        style={{ border: "1px solid gray", background: "#f9f9f9" }}
      >
        {/* Tất cả đối tượng sẽ dịch sang giữa màn hình */}
        <Layer position={{ x: width / 2, y: height / 2 }}>
          {/* Trục X: ngang từ trái (-300) sang phải (300) */}
          <Line
            points={[-width / 2, 0, width / 2, 0]}
            stroke="red"
            strokeWidth={1}
            dash={[5, 5]}
          />
          {/* Trục Y: dọc từ trên (-300) xuống dưới (300) */}
          <Line
            points={[0, -height / 2, 0, height / 2]}
            stroke="green"
            strokeWidth={1}
            dash={[5, 5]}
          />

          {/* Vẽ các đoạn line */}
          {lines.map((line, i) => (
            <Line
              key={i}
              points={[
                line.start.x,
                line.start.y,
                line.end.x,
                line.end.y,
              ]}
              stroke="black"
              strokeWidth={2}
            />
          ))}

          {/* Vẽ các điểm */}
          {points.map((p, i) => (
            <Circle key={i} x={p.x} y={p.y} radius={4} fill="blue" />
          ))}
        </Layer>
      </Stage>

      <button onClick={handleComplete}>Dựng 3D</button>
    </>
  );
}