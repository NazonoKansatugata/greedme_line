"use client";
import { useEffect, useRef, useState, useCallback } from "react";

export default function ControllerPage() {
  const ws = useRef<WebSocket | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; password: string }[]>([]);
  const [selecting, setSelecting] = useState(true);
  const [inputPassword, setInputPassword] = useState("");
  const [selectedUser, setSelectedUser] = useState<{ id: string; name: string; password: string } | null>(null);
  const [error, setError] = useState("");
  const [accel, setAccel] = useState<{ x: number | null, y: number | null, z: number | null }>({ x: null, y: null, z: null });
  const [sensorEnabled, setSensorEnabled] = useState(false);

  // iOS判定
  const isIOS = typeof window !== "undefined" &&
    /iP(hone|od|ad)/.test(window.navigator.userAgent);

  // iOS: センサー許可ボタン
  useEffect(() => {
    if (!isIOS) {
      setSensorEnabled(true);
    }
  }, [isIOS]);

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

  // sendInputをobject対応に
  const sendInput = useCallback((input: string | { accelY: number }) => {
    if (ws.current && ws.current.readyState === 1 && userId) {
      ws.current.send(JSON.stringify({ type: "input", data: input, userId }));
    }
  }, [userId]);

  // 加速度センサーによる操作
  useEffect(() => {
    if (!userId || !sensorEnabled) return;
    let lastSentTime = 0;
    const interval = 50; // msごとに送信

    function handleMotion(e: DeviceMotionEvent) {
      if (!e.accelerationIncludingGravity) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      setAccel({ x, y, z });
      const now = Date.now();
      if (typeof y === "number" && now - lastSentTime > interval) {
        sendInput({ accelY: y });
        lastSentTime = now;
      }
    }

    window.addEventListener("devicemotion", handleMotion);
    return () => {
      window.removeEventListener("devicemotion", handleMotion);
    };
  }, [userId, sendInput, sensorEnabled]);

  // ユーザー選択・認証UI
  if (selecting) {
    return (
      <div style={{ padding: 32, background: "#222", minHeight: "100vh", color: "#fff", position: "relative" }}>
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
        {/* ポップアップ式合言葉入力 */}
        {selectedUser && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.5)",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            onClick={() => { setSelectedUser(null); setInputPassword(""); setError(""); }}
          >
            <div
              style={{
                background: "#333",
                padding: "32px 24px",
                borderRadius: 16,
                minWidth: 280,
                boxShadow: "0 4px 24px #000a",
                color: "#fff",
                position: "relative",
              }}
              onClick={e => e.stopPropagation()}
            >
              <div style={{ marginBottom: 16, fontSize: 18 }}>
                合言葉を入力してください（{selectedUser.name}）
              </div>
              <input
                type="text"
                value={inputPassword}
                onChange={(e) => setInputPassword(e.target.value)}
                style={{ fontSize: 18, marginRight: 12, padding: 4, borderRadius: 6, width: "70%" }}
                autoFocus
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
              <button
                style={{
                  position: "absolute",
                  top: 8,
                  right: 12,
                  background: "transparent",
                  color: "#fff",
                  border: "none",
                  fontSize: 22,
                  cursor: "pointer",
                }}
                onClick={() => { setSelectedUser(null); setInputPassword(""); setError(""); }}
                aria-label="閉じる"
              >
                ×
              </button>
              {error && <div style={{ color: "red", marginTop: 12 }}>{error}</div>}
            </div>
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

  // iOS用センサー許可ボタン
  if (!sensorEnabled && isIOS && !selecting) {
    return (
      <div style={{ background: "#222", color: "#fff", minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontSize: 20, marginBottom: 24 }}>加速度センサーの利用を許可してください</div>
        <button
          style={{ fontSize: 22, padding: "12px 32px", borderRadius: 12, background: "#3498db", color: "#fff", border: "none" }}
          onClick={async () => {
            // iOS 13+ の場合
            if (
              typeof DeviceMotionEvent !== "undefined" &&
              typeof (DeviceMotionEvent as { requestPermission?: () => Promise<PermissionState> }).requestPermission === "function"
            ) {
              try {
                const res = await (DeviceMotionEvent as unknown as { requestPermission: () => Promise<PermissionState> }).requestPermission();
                if (res === "granted") {
                  setSensorEnabled(true);
                } else {
                  alert("センサー利用が許可されませんでした");
                }
              } catch {
                alert("センサー利用の許可リクエストに失敗しました");
              }
            } else {
              // 古いiOSやその他
              setSensorEnabled(true);
            }
          }}
        >
          センサー許可
        </button>
      </div>
    );
  }

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
          onClick={() => sendInput("left")}
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
            onClick={() => sendInput("down")}
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
            onClick={() => sendInput("up")}
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
          onClick={() => sendInput("right")}
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
      {/* 画面右下に加速度センサーの値を表示 */}
      <div style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        background: "#222c",
        color: "#fff",
        fontSize: 16,
        borderRadius: 8,
        padding: "8px 16px",
        zIndex: 2000,
        pointerEvents: "none",
        minWidth: 120,
        textAlign: "right"
      }}>
        <div>accel.x: {accel.x !== null ? accel.x.toFixed(2) : "--"}</div>
        <div>accel.y: {accel.y !== null ? accel.y.toFixed(2) : "--"}</div>
        <div>accel.z: {accel.z !== null ? accel.z.toFixed(2) : "--"}</div>
      </div>
    </div>
  );
}
