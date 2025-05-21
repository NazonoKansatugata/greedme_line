// Next.jsのページやコンポーネント内で利用できます
import { useEffect, useRef } from 'react';

export default function Controller() {
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8080');
    ws.current.onopen = () => {
      // コントローラーとして登録
      ws.current.send(JSON.stringify({ type: 'register', role: 'controller' }));
    };
    ws.current.onmessage = (event) => {
      // サーバーやゲーム画面からの応答を受信
      console.log('受信:', event.data);
    };
    return () => {
      ws.current && ws.current.close();
    };
  }, []);

  const sendInput = (input) => {
    if (ws.current && ws.current.readyState === 1) {
      ws.current.send(JSON.stringify({ type: 'input', data: input }));
    }
  };

  return (
    <div>
      <h1>コントローラー</h1>
      <button onClick={() => sendInput('left')}>左</button>
      <button onClick={() => sendInput('right')}>右</button>
      <button onClick={() => sendInput('jump')}>ジャンプ</button>
    </div>
  );
}
