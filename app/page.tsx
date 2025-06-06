"use client";
import { useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse("送信中...");
    try {
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResponse(`エラー: ${data.error}\n詳細: ${data.detail || ""}`);
      } else {
        setResponse(data.result);
      }
    } catch (err: unknown) {
      let message = "不明なエラー";
      if (err instanceof Error) {
        message = err.message;
      }
      setResponse(`エラーが発生しました: ${message}`);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h1>ユーザー削除コマンド送信</h1>
      <form onSubmit={handleSubmit} style={{ margin: "20px" }}>
        <label>
          ユーザーID:
          <input
            type="text"
            value={userId}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUserId(e.target.value)}
            style={{ marginLeft: "8px" }}
            required
          />
        </label>
        <button type="submit" style={{ marginLeft: "8px" }}>
          削除コマンド送信
        </button>
      </form>
      {response && <div style={{ marginTop: "10px" }}>{response}</div>}
    </div>
  );
}
