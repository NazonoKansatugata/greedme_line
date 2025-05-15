import { NextRequest, NextResponse } from "next/server";

const CHANNEL_ACCESS_TOKEN = 'cyJYRqE074IVdTQVEnFdLMIa2ZoxP67FrPMQBEgfR0yvg4OSbND+95kp14tQsg77qZajSxXNBy1Of1Y1b5k3fQu8qTaB/B1ydMhsVqxao25fd7TAC90w3zc81RpqmjjaNIocnupjUMXeNcXnd4oR1gdB04t89/1O/w1cDnyilFU=';
const FIREBASE_PROJECT_ID = 'greendme-8e44c';
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents`;

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    // Firestoreのユーザーデータ削除
    const deleteUrl = `${FIRESTORE_BASE_URL}/users/${userId}`;
    const firestoreRes = await fetch(deleteUrl, {
      method: "DELETE",
    });

    // LINEに「データが消えました」を送信
    const lineRes = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        to: userId,
        messages: [{ type: "text", text: "データが消えました" }],
      }),
    });

    if (!firestoreRes.ok) {
      const errText = await firestoreRes.text();
      return NextResponse.json({ error: "Firestore削除失敗", detail: errText }, { status: 500 });
    }
    if (!lineRes.ok) {
      const errText = await lineRes.text();
      return NextResponse.json({ error: "LINE送信失敗", detail: errText }, { status: 500 });
    }

    return NextResponse.json({ result: "削除＆LINE通知完了" });
  } catch (err: unknown) {
    let message = "不明なエラー";
    if (err instanceof Error) {
      message = err.message;
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
