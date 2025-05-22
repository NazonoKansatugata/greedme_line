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
            width: 60,
            height: 60,
            marginBottom: 8,
            fontSize: 28,
            borderRadius: 12,
            background: "#444",
            color: "#fff",
            border: "none",
          }}
          onClick={() => sendInput("up")}
        >
          ↑
        </button>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <button
            style={{
              width: 60,
              height: 60,
              marginRight: 8,
              fontSize: 28,
              borderRadius: 12,
              background: "#444",
              color: "#fff",
              border: "none",
            }}
            onClick={() => sendInput("left")}
          >
            ←
          </button>
          <button
            style={{
              width: 60,
              height: 60,
              marginLeft: 8,
              fontSize: 28,
              borderRadius: 12,
              background: "#444",
              color: "#fff",
              border: "none",
            }}
            onClick={() => sendInput("right")}
          >
            →
          </button>
        </div>
        <button
          style={{
            width: 60,
            height: 60,
            marginTop: 8,
            fontSize: 28,
            borderRadius: 12,
            background: "#444",
            color: "#fff",
            border: "none",
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
            width: 80,
            height: 80,
            marginBottom: 24,
            fontSize: 32,
            borderRadius: "50%",
            background: "#e74c3c",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px #0006",
          }}
          onClick={() => sendInput("A")}
        >
          A
        </button>
        <button
          style={{
            width: 80,
            height: 80,
            fontSize: 32,
            borderRadius: "50%",
            background: "#3498db",
            color: "#fff",
            border: "none",
            boxShadow: "0 2px 8px #0006",
          }}
          onClick={() => sendInput("B")}
        >
          B
        </button>
      </div>
    </div>
  );
}
