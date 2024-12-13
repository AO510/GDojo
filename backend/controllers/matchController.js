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


// 部屋作成または参加処理
router.post("/createOrJoinRoom", (req, res) => {
  try {
    const { category = "general", recording = false } = req.body;
    let meeting = Object.values(meetings).find(
      (m) => m.category === category && m.recording === recording
    );

    if (!meeting) {
      const roomName = generateRoomName(category);
      const { topic, timer } = generateRandomTopicWithTimer(category);
      meeting = {
        roomName,
        category,
        recording,
        participants: 0,
        maxParticipants: 4,//最大人数
        topic,
        timer,
        originalTimer: timer,
        startTime: null,
        ready: false,
        timerInterval: null,
      };
      meetings[roomName] = meeting;
      console.log(`新しい部屋を作成: ${roomName}, お題: ${topic}, 制限時間: ${timer}`);
    }

    meeting.participants++;

    if (meeting.participants === meeting.maxParticipants) {
      meeting.ready = true;
      startMeetingTimer(meeting); // タイマーを開始
    }

    const remainingTime = meeting.ready
      ? Math.max(meeting.originalTimer - Math.floor((Date.now() - meeting.startTime) / 1000), 0)
      : null;

    res.status(200).json({
      roomName: meeting.roomName,
      join_url: `https://meet.jit.si/${meeting.roomName}`,
      participants: meeting.participants,
      topic: meeting.ready ? meeting.topic : null,
      timer: remainingTime,
      ready: meeting.ready,
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

router.post("/getRoomDetails", (req, res) => {
  const { roomName } = req.body;

  if (!roomName || !meetings[roomName]) {
    return res.status(404).json({ error: "部屋が見つかりません。" });
  }

  const meeting = meetings[roomName];

  // 残り時間を計算
  const remainingTime = meeting.ready
    ? Math.max(meeting.originalTimer - Math.floor((Date.now() - meeting.startTime) / 1000), 0)
    : null;

  console.log({
    roomName: meeting.roomName,
    topic: meeting.ready ? meeting.topic : null,
    timer: remainingTime, // 残り時間を計算して返す
    ready: meeting.ready,
  });

  res.status(200).json({
    roomName: meeting.roomName,
    topic: meeting.ready ? meeting.topic : null,
    timer: remainingTime,
    ready: meeting.ready,
  });
});







// お題生成関数
const generateRandomTopicWithTimer = (category) => {
  const topics = {
    general: [{ topic: "働き方改革について", timer: 300 }],
    情報系: [{ topic: "AIの課題", timer: 10 }],
    メーカー系: [{ topic: "環境に優しい製品設計", timer: 300 }],
    金融系: [{ topic: "キャッシュレス社会", timer: 300 }],
  };
  const topicList = topics[category] || topics["general"];
  const selectedTopic = topicList[Math.floor(Math.random() * topicList.length)];

  console.log("生成されたお題:", selectedTopic); // デバッグ用
  return selectedTopic;
};

// タイマー開始関数
const startMeetingTimer = (meeting) => {
  if (!meeting.startTime) {
    meeting.startTime = Date.now(); // タイマーの開始時間を記録
  }

  if (!meeting.timerInterval) {
    meeting.timerInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - meeting.startTime) / 1000);
      meeting.timer = Math.max(meeting.originalTimer - elapsed, 0);

      // タイマー終了時
      if (meeting.timer <= 0) {
        clearInterval(meeting.timerInterval);
        meeting.timerInterval = null;
        console.log(`タイマー終了: 部屋 ${meeting.roomName}`);
      }
    }, 1000); // 1秒ごとにタイマーを更新
  }
};



// 会議終了処理
router.post("/meetingEnd", (req, res) => {
  const { roomName } = req.body;

  if (meetings[roomName]) {
    delete meetings[roomName];
    return res.json({ message: "会議終了処理が完了しました。" });
  }

  res.status(404).json({ error: "部屋が見つかりません。" });
});


module.exports = router;
