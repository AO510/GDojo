const express = require("express");
const router = express.Router();

const meetings = {}; // 部屋を管理するオブジェクト

// 部屋名を生成する関数
const generateRoomName = (prefix = "Room") => {
  const timestamp = Date.now(); // 現在時刻
  const randomString = Math.random().toString(36).substr(2, 12); // ランダムな12文字
  const hash = require('crypto').createHash('md5').update(`${prefix}${timestamp}${randomString}`).digest('hex'); // MD5ハッシュを生成
  return `${prefix}_${hash}`;
};


// 部屋を作成または参加させるエンドポイント
router.post("/createOrJoinRoom", (req, res) => {
  const { category = "general", recording = false } = req.body;
  console.log("マッチングリクエスト受信:", { category, recording });

  let meeting = Object.values(meetings).find(
    (m) => m.category === category && m.recording === recording
  );

  if (!meeting) {
    const roomName = generateRoomName(category); // 部屋名を生成
    meeting = {
      roomName,
      category,
      recording,
      participants: 0,
      maxParticipants: 2,
      topic: null,
      timer: null,
    };
    meetings[roomName] = meeting;
    console.log(`新しい部屋を作成: ${roomName}`);
  }

  meeting.participants++;
  console.log(`現在の参加者数: ${meeting.participants}/${meeting.maxParticipants}`);

  if (meeting.participants === meeting.maxParticipants && !meeting.topic) {
    const { topic, timer } = generateRandomTopicWithTimer(category);
    meeting.topic = topic;
    meeting.timer = timer;
    console.log(`お題が設定されました: ${topic}, タイマー: ${timer}秒`);
    startMeetingTimer(meeting);
  }

  res.json({
    roomName: meeting.roomName,
    join_url: `https://meet.jit.si/${meeting.roomName}`,
    participants: meeting.participants,
    topic: meeting.topic,
    timer: meeting.timer,
  });
});

// 部屋を削除するエンドポイント
router.post("/deleteRoom", (req, res) => {
  const { roomName } = req.body;

  if (!roomName || !meetings[roomName]) {
    return res.status(404).json({ error: "部屋が見つかりません。" });
  }

  delete meetings[roomName];
  console.log(`部屋 "${roomName}" が削除されました。`);
  res.status(200).json({ message: `部屋 "${roomName}" を削除しました。` });
});

// すべての部屋を一覧表示するエンドポイント
router.get("/listAllRooms", (req, res) => {
  res.status(200).json({ meetings });
});

// 特定の部屋の詳細情報を取得するエンドポイント
router.post("/getRoomDetails", (req, res) => {
  const { roomName } = req.body;

  if (!roomName || !meetings[roomName]) {
    return res.status(404).json({ error: "部屋が見つかりません。" });
  }

  res.status(200).json(meetings[roomName]);
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
