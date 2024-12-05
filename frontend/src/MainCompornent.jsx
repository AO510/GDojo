"use client";
import React, { useState, useEffect, useCallback } from "react";
import JitsiMeeting from './components/JitsiMeeting';



import {
  useUpload,
  useHandleStreamResponse,
} from "./utilities/runtime-helpers";



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
  const handleStreamResponse = useHandleStreamResponse({
    onChunk: setStreamingMessage,
    onFinish: (message) => {
      setMessages((prev) => [...prev, { role: "assistant", content: message }]);
      setStreamingMessage("");
    },
  });
  useEffect(() => {
    if (showDiscussionTopic && timer > 0) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => {
          if (prevTimer <= 1) {
            clearInterval(intervalId);
            alert("時間が終了しました！");
            // 必要であればバックエンドに終了を通知
            return 0;
          }
          return prevTimer - 1;
        });
      }, 1000);
  
      return () => clearInterval(intervalId); // クリーンアップ
    }
  }, [showDiscussionTopic, timer]);
  
    // カウントダウン処理を分離
  const startTimer = () => {
    const interval = setInterval(() => {
      setTimer((prevTimer) => {
        if (prevTimer <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prevTimer - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // クリーンアップ
  };

  /*const handleStartMeeting = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/createOrJoinRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: "general", recording: false }),
      });
  
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
  
      const data = await response.json();
      console.log("API Response:", data);
  
      setMeetingUrl(data.join_url);
      setShowDiscussionTopic(true);
  
      // Jitsi Meetの埋め込み
      const domain = "meet.jit.si";
      const options = {
        roomName: data.roomName,
        width: "100%",
        height: 500,
        parentNode: document.getElementById("jitsi-container"),
        configOverwrite: {
          prejoinPageEnabled: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: ["microphone", "camera", "chat", "hangup"],
        },
      };
  
      const api = new JitsiMeetExternalAPI(domain, options);
      api.addEventListener("readyToClose", () => {
        console.log("Meeting closed");
      });
    } catch (error) {
      console.error("会議URLの取得に失敗しました:", error);
      alert("会議の開始に失敗しました。詳細はコンソールを確認してください。");
    }
  };*/
  
  
  // 修正箇所: fetchData 関数の新規追加
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";

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

  // useEffectで呼び出し
  useEffect(() => {
    if (showDiscussionTopic) {
      return startTimer();
    }
  }, [showDiscussionTopic]);

  // MeetingLink コンポーネントを定義
/*const MeetingLink = ({ roomName }) => {
  const handleJoinMeeting = async (roomName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/joinMeeting`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomName }),
      });

      if (!response.ok) {
        console.error("部屋への参加通知に失敗しました。");
      } else {
        console.log("部屋への参加が記録されました。");
      }
    } catch (error) {
      console.error("エラー:", error);
    }
  };

  return (
    <a
      href={`https://meet.jit.si/${roomName}`}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => handleJoinMeeting(roomName)}
      className="hover:underline text-blue-500"
    >
      Jitsiミーティングに参加
    </a>
  );
};*/


    /*<div>
      <h1>Jitsiミーティングアプリ</h1>
      <JitsiMeeting roomName={roomName} isHost={isHost} />
    </div>*/
  

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

   /* const response = await fetch("/integrations/chat-gpt/conversationgpt4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "あなたは就活のグループディスカッションの練習相手です。学生の意見に対して建設的なフィードバックを提供してください。",
          },
          ...messages,
          newMessage,
        ],
        stream: true,
      }),
    });

    handleStreamResponse(response);*/
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
  
  const fetchWithFallback = async (url, options) => {
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
  };
  
  
   // マッチング処理
   // 会議URL生成処理
   const handleMatchingStart = async () => {
    
  
    try {
      const response = await fetchWithFallback(`${API_BASE_URL}/api/createOrJoinRoom`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: matchingCategory, recording: isRecording }),
      });
  
      if (!response.ok) {
        throw new Error("バックエンドから部屋名を取得できませんでした");
      }
  
      const data = await response.json();
      console.log("取得したデータ:", data);
  
      if (!data.topic || !data.timer) {
        alert("お題の取得に失敗しました。もう一度試してください。");
        return;
      }
  
      setMeetingUrl(data.join_url);
      setTopic(data.topic); // お題を設定
      setTimer(data.timer); // タイマーを設定
      setShowMatchingModal(false);
      setShowDiscussionTopic(true);
    } catch (error) {
      console.error("会議URLの取得に失敗しました:", error);
      alert("会議の開始に失敗しました。再試行してください。");
    }
  };
  
  
  
  
 /*const startMeetingTimer = (meeting) => {
    meeting.timerInterval = setInterval(() => {
      if (meeting.timer <= 0) {
        clearInterval(meeting.timerInterval);
        console.log(`会議終了: ${meeting.roomName}`);
        delete meetings[meeting.roomName]; // 部屋を削除
      } else {
        meeting.timer -= 1;
        console.log(`残り時間: ${meeting.timer}秒`);
      }
    }, 1000);
  };
  
  
  
  

useEffect(() => {
  const fetchCalendarReservations = async () => {
      try {
          const response = await fetch("${API_BASE_URL}/api/calendar", {
              method: "GET",
              headers: { "Content-Type": "application/json" },
          });

          if (!response.ok) throw new Error("カレンダー予約データの取得に失敗しました");

          const data = await response.json();
          setCalendarReservations(data); // 予約データを状態に保存
      } catch (error) {
          console.error("カレンダー予約データ取得エラー:", error);
      }
  };

  fetchCalendarReservations();
}, []);*/
/*
const handleAddReservation = async (date, timeSlot, category) => {
  try {
      const response = await fetch(`${API_BASE_URL}/api/calendar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
              date,
              timeSlot,
              category,
              userId: "current_user_id", // ユーザーIDを適切に設定
          }),
      });

      if (!response.ok) throw new Error("予約の作成に失敗しました");

      const newReservation = await response.json();
      setCalendarReservations((prev) => [...prev, newReservation]); // 状態を更新
  } catch (error) {
      console.error("予約作成エラー:", error);
  }
};

// 予約をサーバーから削除する関数
const handleCancelReservation = async (reservationId) => {
  try {
      const response = await fetch(
          `${API_BASE_URL}/api/calendar/${reservationId}`,
          { method: "DELETE" }
      );

      if (!response.ok) throw new Error("予約のキャンセルに失敗しました");
      setReservations((prev) =>
          prev.filter((reservation) => reservation.id !== reservationId)
      );
  } catch (error) {
      console.error("予約キャンセルエラー:", error);
  }
};*/

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
              <i className="fas fa-microphone mr-2 text-[#722F37]"></i>
              録音データ
            </div>
            <p className="text-gray-600 font-noto-sans">
              過去の練習の録音をダウンロード
            </p>
            <button className="mt-4 w-full bg-[#722F37] text-white px-4 py-2 rounded-md hover:bg-[#5a252c] font-noto-sans">
              録音を確認
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
            録音設定
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
              録音なし
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="recording"
                checked={isRecording}
                onChange={() => setIsRecording(true)}
                className="mr-2"
              />
              録音あり
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
        <div
          className="bg-white w-full max-w-screen-lg p-4 rounded-t-lg"
          style={{ position: "absolute", top: "2%", left: "50%", transform: "translateX(-50%)" }}
        >
          <h2 className="text-xl font-bold font-noto-sans">ディスカッションお題</h2>
          <p className="mt-2 text-gray-600 font-noto-sans">{topic || "お題を生成中..."}</p>
          <p className="mt-1">制限時間: {Math.floor(timer / 60)}分 {timer % 60}秒</p>
        </div>
        <div className="w-full h-full bg-black">
          <JitsiMeeting roomName={meetingUrl.split("/").pop()} />
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