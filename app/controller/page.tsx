"use client";
import { useEffect, useRef, useState } from "react";

export default function ControllerPage() {
  const ws = useRef<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; password: string }[]>([]);
  const [selecting, setSelecting] = useState(true);
  const [inputPassword, setInputPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; password: string } | null>(null);
  const [error, setError] = useState("");

  // Firestore初期化
  useEffect(() => {
    let ignore = false;
    async function fetchUsers() {
      // 動的importでfirebase関連を読み込む
      const { initializeApp } = await import("firebase/app");
      const { getFirestore, collection, getDocs } = await import("firebase/firestore");
      // firebaseConfigも動的import
      const { firebaseConfig } = await import("../firebaseConfig");
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, "users"));
      const userList: { id: string; name: string; password: string }[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        userList.push({ id: doc.id, name: data.name || doc.id, password: data.password || "" });
      });
      if (!ignore) setUsers(userList);
    }
    fetchUsers();
    return () => { ignore = true; };
  }, []);

  // WebSocket接続
  useEffect(() => {
    if (!userId) return;
    ws.current = new WebSocket("wss://greendme-websocket.onrender.com");
    ws.current.onopen = () => {
      ws.current?.send(JSON.stringify({ type: "register", role: "controller", userId }));
    };
    ws.current.onmessage = (event) => {
      // サーバーやゲーム画面からの応答を受信
      console.log("受信:", event.data);
    };
    return () => {
      if (ws.current) ws.current.close();
    };
  }, [userId]);

  const sendInput = (input: string) => {
    if (ws.current && ws.current.readyState === 1 && userId) {
      ws.current.send(JSON.stringify({ type: "input", data: input, userId }));
    }
  };

  // ユーザー選択・認証UI
  if (selecting) {
    return (
      <div style={{ padding: 32, background: "#222", minHeight: "100vh", color: "#fff" }}>
        <h2>ユーザーを選択してください</h2>
        {users.map((u) => (
          <div key={u.id} style={{ margin: "12px 0" }}>
            <button
              style={{ fontSize: 20, padding: "8px 24px", borderRadius: 8, marginRight: 16 }}
              onClick={() => { setSelectedUser(u); setError(""); }}
            >
              {u.name} (ID: {u.id})
            </button>
          </div>
        ))}
        {selectedUser && (
          <div style={{ marginTop: 24 }}>
            <div>合言葉を入力してください（{selectedUser.name}）</div>
            <input
              type="text"
              value={inputPassword}
              onChange={(e) => setInputPassword(e.target.value)}
              style={{ fontSize: 18, marginRight: 12, padding: 4, borderRadius: 6 }}
            />
            <button
              style={{ fontSize: 18, padding: "4px 18px", borderRadius: 8 }}
              onClick={() => {
                if (inputPassword === selectedUser.password) {
                  setUserId(selectedUser.id);
                  setSelecting(false);
                } else {
                  setError("合言葉が一致しません");
                }
              }}
            >
              OK
            </button>
            {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
          </div>
        )}
      </div>
    );
  }

  // レスポンシブ用のスタイル
  const isMobile = typeof window !== "undefined" && window.innerWidth < 700;
  const controllerContainerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: isMobile ? "column" : "row",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    background: "#222",
    boxSizing: "border-box",
    padding: isMobile ? "16px 0" : 0,
    gap: isMobile ? 40 : 0,
  };

  const dpadMargin = isMobile ? 0 : 60;
  const abMargin = isMobile ? 0 : 60;
  const buttonSize = isMobile
    ? Math.max(Math.min(window.innerWidth * 0.18, 90), 60)
    : 90;
  const abButtonSize = isMobile
    ? Math.max(Math.min(window.innerWidth * 0.22, 110), 70)
    : 110;
  const dpadGap = isMobile ? 24 : 40;

  return (
    <div style={controllerContainerStyle}>
      {/* 十字キー */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginRight: isMobile ? 0 : dpadMargin,
          marginBottom: isMobile ? 32 : 0,
        }}
      >
        <button
          style={{
            width: buttonSize,
            height: buttonSize,
            marginBottom: 12,
            fontSize: buttonSize * 0.45,
            borderRadius: buttonSize * 0.2,
            background: "#444",
            color: "#fff",
            border: "none",
            touchAction: "manipulation",
          }}
          onClick={() => sendInput("up")}
        >
          ↑
        </button>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            style={{
              width: buttonSize,
              height: buttonSize,
              marginRight: dpadGap,
              fontSize: buttonSize * 0.45,
              borderRadius: buttonSize * 0.2,
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
              width: buttonSize,
              height: buttonSize,
              marginLeft: dpadGap,
              fontSize: buttonSize * 0.45,
              borderRadius: buttonSize * 0.2,
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
            width: buttonSize,
            height: buttonSize,
            marginTop: 12,
            fontSize: buttonSize * 0.45,
            borderRadius: buttonSize * 0.2,
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          marginLeft: isMobile ? 0 : abMargin,
        }}
      >
        <button
          style={{
            width: abButtonSize,
            height: abButtonSize,
            marginBottom: isMobile ? 24 : 36,
            fontSize: abButtonSize * 0.4,
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
            width: abButtonSize,
            height: abButtonSize,
            fontSize: abButtonSize * 0.4,
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
