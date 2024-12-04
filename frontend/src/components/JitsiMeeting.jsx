import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("Jitsi Meet API is not available.");
        return;
      }

      const domain = "meet.jit.si"; // 公式サーバー
      const options = {
        roomName: roomName, // ランダムに生成された部屋名
        parentNode: jitsiContainerRef.current, // DOMに埋め込む
        width: "100%",
        height: "100%",
        configOverwrite: {
          enableLobby: false, // ロビーモード無効
          startAudioMuted: 1, // 初期状態で音声をミュート
          disableDeepLinking: true, // モバイルアプリへの遷移を無効化
          prejoinPageEnabled: false, // 事前参加画面をスキップ
          startWithAudioMuted: false, // 音声をミュート
          startWithVideoMuted: false, // ビデオをオフ
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false, // ウォーターマークを非表示
          SHOW_BRAND_WATERMARK: false,
          TOOLBAR_BUTTONS: [
            "microphone", 
            "camera",
            "desktop", 
            "fullscreen",
            "hangup",
            "chat", 
            "raisehand",
            "participants-pane", 
            "videoquality",
            "tileview", 
            "select-background" // 必要なツールバーを追加
          ],
        },
        userInfo: {
          displayName: "ゲストユーザー", // ユーザー名
        },
      };

      try {
        const api = new window.JitsiMeetExternalAPI(domain, options);

        // イベントリスナーを設定
        api.addEventListener("videoConferenceJoined", () => {
          console.log("会議に参加しました");
        });

        // コンポーネントがアンマウントされたときにAPIを破棄
        return () => api.dispose();
      } catch (error) {
        console.error("Failed to create JitsiMeetExternalAPI instance", error);
      }
    };

    // JitsiMeetExternalAPIが利用可能か確認
    if (typeof window.JitsiMeetExternalAPI === "undefined") {
      console.warn("Jitsi API not available. Retrying...");
      const interval = setInterval(() => {
        if (typeof window.JitsiMeetExternalAPI !== "undefined") {
          clearInterval(interval);
          initJitsi();
        }
      }, 500); // 500msごとにスクリプトロード確認
    } else {
      initJitsi();
    }
  }, [roomName]);

  return (
    <div
      ref={jitsiContainerRef}
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
      }}
    ></div>
  );
};

export default JitsiMeeting;
