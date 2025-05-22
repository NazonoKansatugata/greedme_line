"use client";
import { useEffect, useRef } from "react";

export default function ControllerPage() {
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("wss://greendme-websocket.onrender.com");
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "register", role: "controller" }));
    };
    ws.current.onmessage = (event) => {
      // サーバーやゲーム画面からの応答を受信
      console.log("受信:", event.data);
    };
    return () => {
      if (ws.current) ws.current.close();
    };
  }, []);

  const sendInput = (input: string) => {
    if (ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify({ type: "input", data: input }));
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>テトリス コントローラー</h1>
      <div style={{ margin: "24px 0" }}>
        <button style={{ fontSize: 24, margin: 8 }} onClick={() => sendInput("left")}>
          ← 左
        </button>
        <button style={{ fontSize: 24, margin: 8 }} onClick={() => sendInput("right")}>
          右 →
        </button>
        <button style={{ fontSize: 24, margin: 8 }} onClick={() => sendInput("rotate")}>
          ⟳ 回転
        </button>
      </div>
      <div style={{ margin: "24px 0" }}>
        <button style={{ fontSize: 24, margin: 8 }} onClick={() => sendInput("soft_drop")}>
          ↓ ソフトドロップ
        </button>
        <button style={{ fontSize: 24, margin: 8 }} onClick={() => sendInput("hard_drop")}>
          ⏬ ハードドロップ
        </button>
      </div>
    </div>
  );
}
