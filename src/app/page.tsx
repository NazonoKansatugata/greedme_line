"use client";
import { useState } from "react";

export default function Home() {
  const [userId, setUserId] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResponse("送信中...");
    try {
      const res = await fetch(
        "https://script.google.com/macros/s/AKfycbxsKQZ8EnBCZdvWS_pzmqYjOXfA3mQEVhOff3MZB2mvdbJqoaZev7kDUqySBJIwffcPbQ/exec",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            command: "delete",
            userId: userId,
            secret: "greendme-8e44c",
          }),
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`HTTPエラー: ${res.status} ${res.statusText}\n${text}`);
      }
      const data = await res.text();
      setResponse(data);
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
            onChange={(e) => setUserId(e.target.value)}
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
