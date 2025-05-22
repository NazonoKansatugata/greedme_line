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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#222",
      }}
    >
      {/* 十字キー */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 60 }}>
        <button
          style={{
            width: 90,
            height: 90,
            marginBottom: 16,
            fontSize: 40,
            borderRadius: 18,
            background: "#444",
            color: "#fff",
            border: "none",
            touchAction: "manipulation",
          }}
          onClick={() => sendInput("up")}
        >
          ↑
        </button>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
          <button
            style={{
              width: 90,
              height: 90,
              marginRight: 40, // ここを広げる
              fontSize: 40,
              borderRadius: 18,
              background: "#444",
              color: "#fff",
              border: "none",
              touchAction: "manipulation",
            }}
            onClick={() => sendInput("left")}
          >
            ←
          </button>
          <button
            style={{
              width: 90,
              height: 90,
              marginLeft: 40, // ここを広げる
              fontSize: 40,
              borderRadius: 18,
              background: "#444",
              color: "#fff",
              border: "none",
              touchAction: "manipulation",
            }}
            onClick={() => sendInput("right")}
          >
            →
          </button>
        </div>
        <button
          style={{
            width: 90,
            height: 90,
            marginTop: 16,
            fontSize: 40,
            borderRadius: 18,
            background: "#444",
            color: "#fff",
            border: "none",
            touchAction: "manipulation",
          }}
          onClick={() => sendInput("down")}
        >
          ↓
        </button>
      </div>
      {/* A/Bボタン */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 60 }}>
        <button
          style={{
            width: 110,
            height: 110,
            marginBottom: 36,
            fontSize: 44,
            borderRadius: "50%",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px #0006",
            touchAction: "manipulation",
          }}
          onClick={() => sendInput("A")}
        >
          A
        </button>
        <button
          style={{
            width: 110,
            height: 110,
            fontSize: 44,
            borderRadius: "50%",
            background: "#3498db",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px #0006",
            touchAction: "manipulation",
          }}
          onClick={() => sendInput("B")}
        >
          B
        </button>
      </div>
    </div>
  );
}
