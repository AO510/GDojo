const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const meetings = {}; // 部屋を管理するオブジェクト

// 部屋名を生成する関数
const generateRoomName = (prefix = "Room") => {
  const timestamp = Date.now(); // 現在時刻
  const randomString = Math.random().toString(36).substr(2, 12); // ランダムな12文字
  const hash = crypto.createHash("md5").update(`${prefix}${timestamp}${randomString}`).digest("hex"); // MD5ハッシュを生成
  return `${prefix}_${hash}`;
};

// 部屋を作成または参加させるエンドポイント
router.post("/createOrJoinRoom", (req, res) => {
  try {
    const { category = "general", recording = false } = req.body;
    console.log("マッチングリクエスト受信:", { category, recording });

    // カテゴリごとに部屋を検索
    let meeting = Object.values(meetings).find(
      (m) => m.category === category && m.recording === recording
    );

    // 部屋がない場合、新規作成
    if (!meeting) {
      const roomName = generateRoomName(category);
      meeting = {
        roomName,
        category,
        recording,
        participants: 0,
        maxParticipants: 2, // ここで2人マッチングに固定
        topic: null,
        timer: null,
      };
      meetings[roomName] = meeting;
      console.log(`新しい部屋を作成: ${roomName}`);
    }

    // 部屋に参加
    meeting.participants++;
    console.log(
      `部屋: ${meeting.roomName} | 現在の参加者: ${meeting.participants}/${meeting.maxParticipants}`
    );
    res.json({
      roomName: meeting.roomName,
      join_url: `https://meet.jit.si/${meeting.roomName}`,
      participants: meeting.participants,
      topic: meeting.topic, // お題
      timer: meeting.timer, // タイマー
    });
    

    // 全員揃ったらお題を設定
    if (meeting.participants === meeting.maxParticipants && !meeting.topic) {
      const { topic, timer } = generateRandomTopicWithTimer(category);
      meeting.topic = topic;
      meeting.timer = timer;
      console.log(`お題設定: ${topic}, タイマー: ${timer}秒`);
      startMeetingTimer(meeting);
    }

    // フロントエンドに返却
    res.status(200).json({
      roomName: meeting.roomName,
      join_url: `https://meet.jit.si/${meeting.roomName}`,
      participants: meeting.participants,
      topic: meeting.topic || "参加者を待っています...",
      timer: meeting.timer || 0,
    });
  } catch (error) {
    console.error("部屋作成または参加中にエラー:", error);
    res.status(500).json({ error: "部屋の作成または参加に失敗しました。" });
  }
});

// 部屋を削除するエンドポイント
router.post("/deleteRoom", (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName || !meetings[roomName]) {
      return res.status(404).json({ error: "部屋が見つかりません。" });
    }

    delete meetings[roomName];
    console.log(`部屋 "${roomName}" が削除されました。`);
    res.status(200).json({ message: `部屋 "${roomName}" を削除しました。` });
  } catch (error) {
    console.error("部屋の削除時にエラーが発生しました:", error);
    res.status(500).json({ error: "部屋の削除に失敗しました。" });
  }
});

// すべての部屋を一覧表示するエンドポイント
router.get("/listAllRooms", (req, res) => {
  res.status(200).json({ meetings });
});

// 特定の部屋の詳細情報を取得するエンドポイント
router.post("/getRoomDetails", (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName || !meetings[roomName]) {
      return res.status(404).json({ error: "部屋が見つかりません。" });
    }

    res.status(200).json(meetings[roomName]);
  } catch (error) {
    console.error("部屋詳細取得時にエラーが発生しました:", error);
    res.status(500).json({ error: "部屋の詳細情報の取得に失敗しました。" });
  }
});

// お題生成関数
const generateRandomTopicWithTimer = (category) => {
  const topics = {
    general: [{ topic: "働き方改革について", timer: 300 }],
    情報系: [{ topic: "AIの課題", timer: 300 }],
    メーカー系: [{ topic: "環境に優しい製品設計", timer: 300 }],
    金融系: [{ topic: "キャッシュレス社会", timer: 300 }],
  };
  const topicList = topics[category] || topics["general"];
  const selectedTopic = topicList[Math.floor(Math.random() * topicList.length)];

  console.log("生成されたお題:", selectedTopic); // デバッグ用
  return selectedTopic;
};

// タイマー処理
const startMeetingTimer = (meeting) => {
  meeting.timerInterval = setInterval(() => {
    if (meeting.timer <= 0) {
      clearInterval(meeting.timerInterval);
      setTimeout(() => {
        console.log(`会議終了: ${meeting.roomName}`);
        delete meetings[meeting.roomName];
      }, 30000);
    } else {
      meeting.timer -= 1;
    }
  }, 1000);
};

module.exports = router;
