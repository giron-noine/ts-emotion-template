import { Link } from "react-router-dom";
import styled from "@emotion/styled";
import { useEffect, useState } from "react";
import CanvasPolygon from "../components/canvasPolygon";

const Canvas = () => {
  let canvas: HTMLCanvasElement | null, ctx;

  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d");

    const roi_polygon = new CanvasPolygon(canvas, ctx);

    const onMove = (e: MouseEvent) => {
      let offsetX = e.offsetX; // =>要素左上からのx座標
      let offsetY = e.offsetY; // =>要素左上からのy座標
      roi_polygon.clearCanvas();
      roi_polygon.drawPolygon(offsetX, offsetY);
      roi_polygon.drawPoints(offsetX, offsetY);
    };

    canvas.onclick = (e) => {
      setMouseX(e.offsetX);
      setMouseY(e.offsetY);
      roi_polygon.onLeftClick(e); // クラスで定義するため
      onMove(e);
    };
    canvas.oncontextmenu = (e) => {
      roi_polygon.onRightClick(e);
      onMove(e);
      return false;
    };
    canvas.onmousemove = onMove;
  }, []);

  return (
    <>
      <CanvasWrap>
        <CanvasStyle id="canvas" width={600} height={600} />
      </CanvasWrap>

      <p>{mouseX}</p>
      <p>{mouseY}</p>

      <Link to="/">
        <p>To TOP page</p>
      </Link>
    </>
  );
};

const CanvasWrap = styled("div")`
  margin: 30px;
`;

const CanvasStyle = styled("canvas")`
  width: 600px;
  height: 600px;
  background-color: #ffffff;
`;

export default Canvas;
