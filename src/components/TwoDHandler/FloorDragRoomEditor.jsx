import { Stage, Layer, Rect, Line } from "react-konva";
import { useState } from "react";

const width = 600;
const height = 600;

export default function FloorDragRoomEditor({ onCreateRoom }) {
  const [start, setStart] = useState(null);
  const [currentRect, setCurrentRect] = useState(null);
  const [rooms, setRooms] = useState([]); // ✅ danh sách phòng đã vẽ

  const toLogical = (x, y) => ({
    x: x - width / 2,
    y: y - height / 2,
  });

  const handleMouseDown = (e) => {
    const { x, y } = e.target.getStage().getPointerPosition();
    setStart(toLogical(x, y));
  };

  const handleMouseMove = (e) => {
    if (!start) return;
    const { x, y } = e.target.getStage().getPointerPosition();
    const pos = toLogical(x, y);

    const rect = {
      x: Math.min(start.x, pos.x),
      y: Math.min(start.y, pos.y),
      width: Math.abs(pos.x - start.x),
      height: Math.abs(pos.y - start.y),
    };
    setCurrentRect(rect);
  };

  const handleMouseUp = () => {
    if (currentRect && currentRect.width > 5 && currentRect.height > 5) {
      const points = [
        { x: currentRect.x, y: currentRect.y },
        { x: currentRect.x + currentRect.width, y: currentRect.y },
        { x: currentRect.x + currentRect.width, y: currentRect.y + currentRect.height },
        { x: currentRect.x, y: currentRect.y + currentRect.height },
      ];

      // ✅ Lưu vào danh sách phòng
      setRooms((prev) => [...prev, { ...currentRect }]);

      // ✅ Truyền về component 3D
      onCreateRoom(points);
    }
    setStart(null);
    setCurrentRect(null);
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{ border: "1px solid #ccc", background: "#f9f9f9" }}
    >
      <Layer position={{ x: width / 2, y: height / 2 }}>
        {/* Trục X, Y */}
        <Line points={[-width / 2, 0, width / 2, 0]} stroke="red" dash={[4, 4]} />
        <Line points={[0, -height / 2, 0, height / 2]} stroke="green" dash={[4, 4]} />

        {/* ✅ Render tất cả các phòng đã lưu */}
        {rooms.map((room, idx) => (
          <Rect
            key={idx}
            x={room.x}
            y={room.y}
            width={room.width}
            height={room.height}
            stroke="#333"
            strokeWidth={1}
            fill="rgba(0,0,0,0.05)"
          />
        ))}

        {/* Hình chữ nhật khi đang kéo */}
        {currentRect && (
          <Rect
            x={currentRect.x}
            y={currentRect.y}
            width={currentRect.width}
            height={currentRect.height}
            stroke="blue"
            dash={[5, 5]}
          />
        )}
      </Layer>
    </Stage>
  );
}
