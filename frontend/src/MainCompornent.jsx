"use client";
import React, { useState, useEffect, useCallback, useRef} from "react";
import JitsiMeeting from './components/JitsiMeeting';
//import { useNavigate } from "react-router-dom";


import {
  useUpload,
  useHandleStreamResponse,
} from "./utilities/runtime-helpers";


//バックアップ
function MainComponent() {
 
  const [isLoading, setIsLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState(""); // 会議URL
  const [errorMessage, setErrorMessage] = useState(""); // エラーメッセージ
  const [timeLeft, setTimeLeft] = useState(null);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [calendarReservations, setCalendarReservations] = useState([]); // 予約データ
  const [matchData, setMatchData] = useState(null); // マッチングデータを管理する状態
  const [additionalUIVisible, setAdditionalUIVisible] = useState(false);
  const roomName = "Room_情報系_12345"; // 任意の部屋名
  const isHost = true; // ホストで開始する場合は true
  const [showJitsiMeeting, setShowJitsiMeeting] = useState(false); // 状態を初期化
  const [timer, setTimer] = useState(); // 初期値300秒（5分）
  const [topic, setTopic] = useState(null);
  const [minimized, setMinimized] = useState(false); // minimized状態を追加
  //const navigate = useNavigate();
  const [ready, setReady] = useState(false); // 状態を初期化
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null); // ここでmediaStreamRefを初期化
  const videoContainerRef = useRef(null); // フルスクリーン対象の参照
  const [recordingStarted, setRecordingStarted] = useState(false); // 録画開始状態を管理
  const streamRef = useRef(null); // useRefでstreamRefを初期化

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showTimeSlots, setShowTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [reservations, setReservations] = useState([]);
  const [showReservations, setShowReservations] = useState(false);
  const [showMatchingModal, setShowMatchingModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [matchingCategory, setMatchingCategory] = useState("");
  const [waitingParticipants, setWaitingParticipants] = useState(0);
  const [showDiscussionTopic, setShowDiscussionTopic] = useState(false);
  const [discussionTopic, setDiscussionTopic] = useState("");
  const [zoomUrl, setZoomUrl] = useState("");
  const [isGeneratingUrl, setIsGeneratingUrl] = useState(false);
  const [username, setUsername] = useState("");
  const [department, setDepartment] = useState("");
  const [grade, setGrade] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [upload, { loading }] = useUpload();
  const [showChatModal, setShowChatModal] = useState(false);
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [streamingMessage, setStreamingMessage] = useState("");
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setStreamingMessage("");
    },
  });

  

  
   
  // 修正箇所: fetchData 関数の新規追加
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL ; //process.env.REACT_APP_API_BASE_URL ;

// API呼び出し例
const fetchData = useCallback(async () => {
  try {
    setIsLoading(true);
    const response = await fetchWithFallback(`${API_BASE_URL}/api/getMatchData`);
    const data = await response.json();
    setMatchData(data);
  } catch (error) {
    setErrorMessage("データ取得に失敗しました。");
  } finally {
    setIsLoading(false);
  }
}, []);


  useEffect(() => {
    fetchData();
  }, [fetchData]);
/*
  // useEffectで呼び出し
  useEffect(() => {
    if (showDiscussionTopic) {
      return startTimer();
    }
  }, [showDiscussionTopic]);
*/
  
  

  const handleLogin = useCallback(() => {
    if (!email.endsWith("@ccmailg.meijo-u.ac.jp")) {
      setEmailError(
        "メールアドレスは@ccmailg.meijo-u.ac.jp のドメインのみ使用可能です"
      );
      return;
    }
    setIsLoggedIn(true);
    setShowLoginModal(false);
  }, [email]);
  const handleProfileUpdate = useCallback(async () => {
    if (profileImage) {
      const { url } = await upload({ file: profileImage });
    }
    setShowProfileModal(false);
  }, [profileImage, username, department, grade]);
  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newMessage]);
    setUserInput("");

  
  };
  const getReservationCount = (date, category) => {
    return reservations.filter(
      (r) =>
        r.date === date &&
        r.month === currentMonth &&
        r.year === currentYear &&
        (!category || r.category === category)
    ).length;
  };
  const getCategoryReservations = (date) => {
    const categories = {
      情報系: getReservationCount(date, "情報系"),
      メーカー系: getReservationCount(date, "メーカー系"),
      金融系: getReservationCount(date, "金融系"),
    };
    return Object.entries(categories).filter(([_, count]) => count > 0);
  };
  const isTimeSlotReserved = (date, time) => {
    return reservations.some(
      (r) =>
        r.date === date &&
        r.month === currentMonth &&
        r.year === currentYear &&
        r.time === time
    );
  };
  const handleMonthChange = useCallback((newMonth, newYear) => {
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDate(null);
    setShowTimeSlots(false);
  }, []);
  
 /* const fetchWithFallback = async (url, options) => {
    try {
      const response = await fetch(url, options);
      if (response.ok) {
        return response;
      } else {
        throw new Error("Response not OK");
      }
    } catch (error) {
      console.warn("Primary API base URL failed, falling back to localhost:", error);
      const fallbackUrl = url.replace(process.env.REACT_APP_API_BASE_URL, "http://localhost:5000");
      return await fetch(fallbackUrl, options);
    }
  };*/
  
  
   // マッチング処理
   // 会議URL生成処理
   const handleMatchingStart = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/createOrJoinRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: matchingCategory, recording: isRecording }),
      });
  
      if (!response.ok) {
        throw new Error("バックエンドから部屋名を取得できませんでした");
      }
  
      const data = await response.json();
      console.log("取得したデータ:", data);
  
      setMeetingUrl(data.join_url);
      setTopic(data.topic); // お題を設定
      setTimer(data.timer); // タイマーを設定
      setReady(data.ready); // 準備完了状態を設定
      setShowMatchingModal(false);
      setShowDiscussionTopic(true);
    } catch (error) {
      console.error("会議URLの取得に失敗しました:", error);
      alert("会議の開始に失敗しました。再試行してください。");
    }
  };

  useEffect(() => {
    if (!meetingUrl) return;
  
    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/getRoomDetails`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName: meetingUrl.split("/").pop() }),
        });
  
        if (!response.ok) {
          throw new Error("部屋の状態を取得できませんでした");
        }
  
        const data = await response.json();
        console.log("バックエンドからのデータ:", { topic: data.topic, timer: data.timer, ready: data.ready });
  
        setTopic(data.topic); // お題を更新
        setTimer(data.timer); // 残り制限時間を更新
        setReady(data.ready); // 準備完了状態を更新
      } catch (error) {
        console.error("リアルタイム更新失敗:", error);
      }
    }, 1000); // 1秒ごとにバックエンドと同期
  
    return () => clearInterval(intervalId); // クリーンアップ
  }, [meetingUrl]);
  
  
  // リアルタイムで準備完了状態を確認
 /* useEffect(() => {
    if (timer === 0) {
      alert("会議が終了しました！");
      // 録画を停止
      if (isRecording && mediaRecorder) {
        mediaRecorder.stop();
        setIsRecording(false);
      }
      // 元の画面に戻るロジックを実行
      setShowDiscussionTopic(false);
      setMeetingUrl(null);
    }
  }, [timer]);*/
  
  useEffect(() => {
    if (timer === 0) {
      alert("会議が終了しました！");
      // 録画を停止
      if (isRecording && mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        //setIsRecording(false);
      }
      // 元の画面に戻るロジックを実行
      setShowDiscussionTopic(false);
      setMeetingUrl(null);
    }
  }, [timer]);
  
  
  
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // 部屋から退出したことを通知
      fetch(`${API_BASE_URL}/api/leaveRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName: meetingUrl.split("/").pop() }),
      });
  
      // 影響を残さないようにする
      setShowDiscussionTopic(false);
      setMeetingUrl(null);
    };
  
    window.addEventListener("beforeunload", handleBeforeUnload);
  
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [meetingUrl]);
  
   
  

 
 // 録画の開始と停止
// 録画を開始する関数
const startScreenRecording = async () => {
  try {
    console.log("[INFO] 画面録画をリクエスト中...");
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: true, // 音声を有効化
    });

    streamRef.current = stream; // ストリームを保存
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    const chunks = []; // 録画データを保持
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
        console.log("[INFO] 録画データを収集中...");
      }
    };

    mediaRecorder.onstop = () => {
      if (chunks.length > 0) {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const recordingData = {
          url,
          date: new Date().toISOString(),
          email: "user@example.com", // 仮のメールアドレス
          category: "General",
          count: recordings.length + 1,
        };

        setRecordings((prev) => [...prev, recordingData]);
        console.log("[INFO] 録画データを保存しました:", recordingData);
      } else {
        console.log("[WARN] 録画データがありません");
      }

      // ストリームを解放
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        console.log("[INFO] ストリームを解放しました");
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    console.log("[INFO] 録画を開始しました");
  } catch (error) {
    console.error("[ERROR] 録画の開始中にエラーが発生しました:", error);
  }
};

// 録画停止
const stopScreenRecording = () => {
  if (mediaRecorderRef.current?.state === "recording") {
    console.log("[INFO] MediaRecorderを停止します...");
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  }

  if (streamRef.current) {
    console.log("[INFO] ストリームを停止します...");
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
};

useEffect(() => {
  if (ready && !recordingStarted) {
    console.log("[INFO] 録画を開始します");
    startScreenRecording(); // 録画開始
    setRecordingStarted(true);
  }

  if (timer === 0 && recordingStarted) {
    console.log("[INFO] タイマー終了のため録画を停止します");
    stopScreenRecording(); // 録画停止
    setRecordingStarted(false);
  }
/*
  return () => {
    if (recordingStarted && mediaRecorderRef.current?.state === "recording") {
      console.log("[INFO] クリーンアップ時に録画を停止します");
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      console.log("[INFO] クリーンアップ時にストリームを停止します");
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };*/
}, [ready, timer, recordingStarted]);

const handleRecordingStop = (recordingData) => {
  const newRecording = {
    email: "student@ccmailg.meijo-u.ac.jp", // 仮のメールアドレス。動的に取得可能にする場合は適宜変更
    date: recordingData.date,
    category: "", // 固定値または動的に取得
    count: recordings.length + 1, // 現在の録画数に基づいてカウント
    url: recordingData.url,
  };

  // 録画リストに新しいデータを追加
  setRecordings((prev) => [...prev, newRecording]);

  console.log("[INFO] 録画データを追加しました:", newRecording);
};

// 録画データのダウンロード
const handleDownload = (recording) => {
  const a = document.createElement("a");
  a.href = recording.url;
  a.download = `recording_${recording.date}.webm`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  console.log("[INFO] 録画データをダウンロードしました:", recording.url);
};

// 録画データの送信（仮実装）
const handleSend = (recording) => {
  console.log(`[INFO] 録画 ${recording.date} を送信するためのAPIリクエストを作成します`);
  alert(`[INFO] 録画 ${recording.date} を送信しました`);
};

// タイマー終了時の処理
useEffect(() => {
  if (timer === 0) {
    alert("会議が終了しました！");
    setReady(false); // 会議状態を終了
    setShowDiscussionTopic(false);
    setMeetingUrl(null); // 会議のURLをリセット
  }
}, [timer]);

// ページを閉じる際のクリーンアップ
useEffect(() => {
  const handleBeforeUnload = (event) => {
    fetch(`${API_BASE_URL}/api/leaveRoom`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomName: meetingUrl.split("/").pop() }),
    });

    setShowDiscussionTopic(false);
    setMeetingUrl(null);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}, [meetingUrl]);

// 初期状態でフルスクリーンにする
useEffect(() => {
  const requestFullScreen = async () => {
    if (videoContainerRef.current) {
      try {
        await videoContainerRef.current.requestFullscreen();
        console.log("[INFO] 初期状態でフルスクリーンにしました");
      } catch (err) {
        console.error("[ERROR] 初期状態でフルスクリーンに失敗しました:", err);
      }
    }
  };

  requestFullScreen();
}, []);






  
  
  
 

return (
 

  <div className="min-h-screen bg-gray-50">
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="font-noto-sans text-xl font-bold text-[#722F37]">
            就活GD練習アプリ
          </div>
          {!isLoggedIn ? (
            <button
              onClick={() => setShowLoginModal(true)}
              className="bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
            >
              ログイン / 登録
            </button>
          ) : (
            <div className="flex items-center space-x-4">
              <button onClick={() => setShowProfileModal(true)}>
                <i className="fas fa-user-circle text-gray-600 text-2xl hover:text-[#722F37]"></i>
              </button>
              <span className="font-noto-sans">{username || "ゲスト"}</span>
            </div>
          )}
        </div>
      </nav>
    </header>

    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-xl font-bold mb-4 font-noto-sans flex items-center">
            <i className="fas fa-calendar-alt mr-2 text-[#722F37]"></i>
            カレンダー予約
          </div>
          <p className="text-gray-600 font-noto-sans">
            グループディスカッションの時間枠を予約
          </p>
          <div className="flex flex-col space-y-2">
            <button
              onClick={() => setShowCalendarModal(true)}
              className="w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
            >
              予約する
            </button>
            <button
              onClick={() => setShowReservations(true)}
              className="w-full bg-white text-[#722F37] border border-[#722F37] px-4 py-2 rounded-md hover:bg-gray-50 font-noto-sans"
            >
              予約確認
            </button>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-xl font-bold mb-4 font-noto-sans flex items-center">
              <i className="fas fa-users mr-2 text-[#722F37]"></i>
              即時マッチング
            </div>
            <p className="text-gray-600 font-noto-sans">
              今すぐディスカッションを開始
            </p>
            <button
              onClick={() => setShowMatchingModal(true)}
              className="mt-4 w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
            >
              マッチング設定
            </button>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-xl font-bold mb-4 font-noto-sans flex items-center">
              <i className="fas fa-video mr-2 text-[#722F37]"></i>
              録画データ
            </div>
            <p className="text-gray-600 font-noto-sans">
              過去の練習の録画をダウンロード
            </p>
            <button
              onClick={() => setShowRecordingModal(true)}
              className="mt-4 w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
            >
              録画を確認
            </button>
          </div>
        </div>

        {showMatchingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg w-full max-w-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-noto-sans">マッチング設定</h2>
        <button
          onClick={() => setShowMatchingModal(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            企業カテゴリー
          </label>
          <select
            value={matchingCategory}
            onChange={(e) => setMatchingCategory(e.target.value)}
            className="w-full p-2 border rounded-md font-noto-sans"
          >
            <option value="">ランダム</option>
            <option value="情報系">情報系</option>
            <option value="メーカー系">メーカー系</option>
            <option value="金融系">金融系</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            録画設定
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="recording"
                checked={!isRecording}
                onChange={() => setIsRecording(false)}
                className="mr-2"
              />
              録画なし
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="recording"
                checked={isRecording}
                onChange={() => setIsRecording(true)}
                className="mr-2"
              />
              録画あり
            </label>
          </div>

         
  
  

        </div>
        <button
          onClick={handleMatchingStart} // ここで直接関数を呼び出す
          className="w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
        >
          マッチング開始
        </button>
      </div>
    </div>
  </div>
)}


{showDiscussionTopic && meetingUrl && (
  <div className="fixed inset-0 bg-black flex flex-col items-center z-50">
    {/* お題の表示部分 */}
    {minimized ? (
      <div
        className="bg-white p-2 rounded-lg shadow-lg"
        style={{
          position: "fixed",
          bottom: "20px", // 画面下部に固定
          right: "20px", // 画面右下に配置
          cursor: "pointer",
          width: "150px", // 小さすぎないよう適切な幅を設定
          height: "50px", // 高さも見やすく設定
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001, // Jitsiコンテナより上に表示
        }}
        onClick={() => setMinimized(false)}
      >
        <h2 className="text-sm font-bold font-noto-sans">お題</h2>
      </div>
    ) : (
      <div
        className="bg-white w-full max-w-screen-lg p-4 rounded-t-lg"
        style={{
          position: "fixed", // 固定配置でスクロールしても常に表示
          top: "0px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000, // Jitsiコンテナより上に配置
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-noto-sans">ディスカッションお題</h2>
          <button
            className="text-blue-500 underline"
            onClick={() => setMinimized(true)}
          >
            最小化
          </button>
        </div>
        {ready && timer ? (
          <>
            <p className="mt-2 text-gray-600 font-noto-sans">
              {topic || "お題を生成中..."}
            </p>
            <p className="mt-1">
              制限時間: {Math.floor(timer / 60)}分 {timer % 60}秒
            </p>
          </>
        ) : (
          <p className="mt-2 text-gray-600 font-noto-sans">
            待機中... 他の参加者を待っています。
          </p>
        )}
      </div>
    )}

    {/* Jitsiコンテナ */}
    <div className="w-full h-full bg-black">
    <JitsiMeeting
  roomName={meetingUrl.split("/").pop()}
  onRecordingStop={handleRecordingStop}
/>
    </div>
  </div>
)}










    




    

      {showCalendarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    if (currentMonth === 0) {
                      handleMonthChange(11, currentYear - 1);
                    } else {
                      handleMonthChange(currentMonth - 1, currentYear);
                    }
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <h2 className="text-xl font-bold font-noto-sans">
                  {currentYear}年{currentMonth + 1}月
                </h2>
                <button
                  onClick={() => {
                    if (currentMonth === 11) {
                      handleMonthChange(0, currentYear + 1);
                    } else {
                      handleMonthChange(currentMonth + 1, currentYear);
                    }
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
              <button
                onClick={() => setShowCalendarModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="mb-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2 border rounded-md font-noto-sans"
              >
                <option value="">企業カテゴリを選択（任意）</option>
                <option value="情報系">情報系</option>
                <option value="メーカー系">メーカー系</option>
                <option value="金融系">金融系</option>
              </select>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {["月", "火", "水", "木", "金", "土", "日"].map((day) => (
                <div key={day} className="text-center font-bold">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {[
                ...Array.from({
                  length: new Date(
                    currentYear,
                    currentMonth + 1,
                    0,
                  ).getDate(),
                }),
              ].map((_, i) => {
                const date = new Date(currentYear, currentMonth, i + 1);
                const today = new Date();
                const currentHour = today.getHours();
                const isPastDate =
                  date <
                  new Date(
                    today.getFullYear(),
                    today.getMonth(),
                    today.getDate(),
                  );
                const isToday =
                  date.getDate() === today.getDate() &&
                  date.getMonth() === today.getMonth() &&
                  date.getFullYear() === today.getFullYear();
                const categoryReservations = getCategoryReservations(i + 1);
                const totalReservations = getReservationCount(i + 1);

                return (
                  <div key={i} className="relative">
                    <button
                      onClick={() => {
                        if (!isPastDate) {
                          setSelectedDate(i + 1);
                          setShowTimeSlots(true);
                        }
                      }}
                      disabled={isPastDate}
                      className={`w-full p-2 border rounded-md ${
                        isPastDate
                          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                          : selectedDate === i + 1
                            ? "selected-date"
                            : totalReservations > 0
                              ? "bg-[#722F37] text-white"
                              : "hover:bg-gray-100"
                      }`}
                    >
                      <div className="text-center">{i + 1}</div>
                      {totalReservations > 0 && (
                        <div className="text-xs mt-1">
                          {categoryReservations.map(
                            ([category, count], idx) => (
                              <div key={category}>
                                {category}: {count}人
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {showTimeSlots && (
              <div className="mt-6 space-y-4">
                <h3 className="font-bold">時間割</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { time: "1限 (9:10-10:40)", value: "1限" },
                    { time: "2限 (10:50-12:20)", value: "2限" },
                    { time: "昼休み (12:30-13:00)", value: "昼休み" },
                    { time: "3限 (13:10-14:40)", value: "3限" },
                    { time: "4限 (14:50-16:20)", value: "4限" },
                    { time: "5限 (16:30-18:00)", value: "5限" },
                    { time: "6限 (18:10-19:40)", value: "6限" },
                    { time: "7限 (19:50-21:20)", value: "7限" },
                  ].map((slot) => {
                    const today = new Date();
                    const currentHour = today.getHours();
                    const isDisabled =
                      (selectedDate === today.getDate() &&
                        currentMonth === today.getMonth() &&
                        currentYear === today.getFullYear() &&
                        ((slot.value === "1限" && currentHour >= 9) ||
                          (slot.value === "2限" && currentHour >= 10) ||
                          (slot.value === "昼休み" && currentHour >= 12) ||
                          (slot.value === "3限" && currentHour >= 13) ||
                          (slot.value === "4限" && currentHour >= 14) ||
                          (slot.value === "5限" && currentHour >= 16) ||
                          (slot.value === "6限" && currentHour >= 18) ||
                          (slot.value === "7限" && currentHour >= 19))) ||
                      isTimeSlotReserved(selectedDate, slot.value);

                    const slotReservations = reservations.filter(
                      (r) =>
                        r.date === selectedDate &&
                        r.month === currentMonth &&
                        r.year === currentYear &&
                        r.time === slot.value,
                    );

                    return (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTimeSlot(slot.value)}
                        disabled={isDisabled}
                        className={`p-2 border rounded-md ${
                          isDisabled
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                            : selectedTimeSlot === slot.value
                              ? "selected-date"
                              : "hover:bg-gray-100"
                        }`}
                      >
                        <div>{slot.time}</div>
                        {slotReservations.length > 0 && (
                          <div className="text-xs mt-1">
                            {slotReservations.length}人参加中
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setReservations((prev) => [
                      ...prev,
                      {
                        date: selectedDate,
                        time: selectedTimeSlot,
                        month: currentMonth,
                        year: currentYear,
                        category: selectedCategory,
                      },
                    ]);
                    setShowCalendarModal(false);
                    setShowTimeSlots(false);
                    setSelectedCategory("");
                  }}
                  className="w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c]"
                >
                  予約を確定
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showReservations && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-noto-sans">予約確認</h2>
              <button
                onClick={() => setShowReservations(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="space-y-4">
              {reservations.map((reservation, index) => (
                <div key={index} className="p-4 border rounded-md">
                  <p className="font-bold">
                    {reservation.year}年{reservation.month + 1}月
                    {reservation.date}日
                  </p>
                  <p>{reservation.time}</p>
                  {reservation.category && (
                    <p className="text-gray-600">
                      企業カテゴリ: {reservation.category}
                    </p>
                  )}
                  <button
                    onClick={() =>
                      setReservations((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="mt-2 text-red-500 hover:text-red-700"
                  >
                    キャンセル
                  </button>
                </div>
              ))}
              {reservations.length === 0 && (
                <p className="text-center text-gray-500">予約はありません</p>
              )}
            </div>
          </div>
        </div>
      )}

      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-noto-sans">ログイン</h2>
              <button
                onClick={() => setShowLoginModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="メールアドレス (@ccmailg.meijo-u.ac.jp)"
                  className="w-full p-2 border rounded-md font-noto-sans"
                />
                {emailError && (
                  <p className="text-red-500 text-sm mt-1">{emailError}</p>
                )}
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="パスワード"
                  className="w-full p-2 border rounded-md font-noto-sans"
                />
              </div>
              <button
                type="button"
                onClick={handleLogin}
                className="w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold font-noto-sans">
                プロフィール編集
              </h2>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  プロフィール画像
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    e.target.files && setProfileImage(e.target.files[0])
                  }
                  className="w-full"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ユーザー名"
                  className="w-full p-2 border rounded-md font-noto-sans"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="department"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="学部"
                  className="w-full p-2 border rounded-md font-noto-sans"
                />
              </div>
              <div>
                <input
                  type="text"
                  name="grade"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  placeholder="学年"
                  className="w-full p-2 border rounded-md font-noto-sans"
                />
              </div>
              <button
                type="button"
                onClick={handleProfileUpdate}
                className="w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans"
              >
                保存
              </button>
            </form>
          </div>
        </div>
      )}

{showRecordingModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-8 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-noto-sans">録画データ</h2>
        <button
          onClick={() => setShowRecordingModal(false)}
          className="text-gray-500 hover:text-gray-700 text-xl"
        >
          <i className="fas fa-times"></i>
        </button>
      </div>
      <div className="space-y-4 overflow-y-auto max-h-[60vh]">
        {recordings.length === 0 ? (
          <div className="text-center py-8">
            <i className="fas fa-video-slash text-gray-400 text-4xl mb-4"></i>
            <p className="text-gray-500 font-noto-sans">録画データはありません</p>
            <p className="text-gray-400 text-sm mt-2">
              マッチング時に録画設定をオンにすると、ここに録画データが表示されます
            </p>
          </div>
        ) : (
          recordings.map((recording, index) => (
            <div key={index} className="p-4 border rounded-md">
              <p className="font-bold">
                {recording.email}_{recording.date}_{recording.category}_
                {recording.count}回目
              </p>
              <div className="flex flex-col space-y-2 mt-2">
                <video
                  controls
                  src={recording.url}
                  className="w-full rounded-md"
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => handleDownload(recording)}
                    className="text-[#722F37] hover:text-[#5a252c] px-4 py-2 rounded-md border border-[#722F37] flex items-center"
                  >
                    <i className="fas fa-download mr-2"></i>
                    ダウンロード
                  </button>
                  <button
                    onClick={() => handleSend(recording)}
                    className="bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] flex items-center"
                  >
                    <i className="fas fa-paper-plane mr-2"></i>
                    送信
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

    </main>
    <style jsx>{`
  .container {
    min-height: 100vh;
    background-color: rgb(249, 250, 251);
  }
  .header {
    background-color: white;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  .nav {
    max-width: 80rem;
    margin: 0 auto;
    padding: 0 1rem;
  }
  .nav-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 4rem;
  }
  .logo {
    font-family: 'Noto Sans JP', sans-serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: #722F37;
  }
  .button {
    background-color: #722F37;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    transition: background-color 0.2s;
  }
  .button:hover {
    background-color: #5a252c;
  }
  .modal {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  }
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    width: 100%;
    max-width: 28rem;
  }
  .form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #e5e7eb;
    border-radius: 0.375rem;
    font-family: 'Noto Sans JP', sans-serif;
  }
  .error-text {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
  }
  .grid-container {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr));
    gap: 1.5rem;
  }
  @media (min-width: 768px) {
    .grid-container {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1024px) {
    .grid-container {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  .card {
    background-color: white;
    padding: 1.5rem;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  }
  .selected-date {
    border: 2px dashed #722F37;
    animation: dash 1s linear infinite;
  }
  @keyframes dash {
    to {
      border-style: solid;
    }
  }
`}</style>


<style jsx global>{`
  .global-style-example {
    font-size: 16px;
    color: blue;
  }
`}</style>
  </div>
);


}




export default MainComponent;