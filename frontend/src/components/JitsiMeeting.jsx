import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);

  useEffect(() => {
    const loadJitsiScript = (callback) => {
      if (typeof window.JitsiMeetExternalAPI !== "undefined") {
        callback();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = callback;
      script.onerror = () => console.error("Failed to load Jitsi script");
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("Jitsi Meet API is not available.");
        return;
      }

      const domain = "meet.jit.si";
      const options = {
        roomName: roomName || `Room_${Math.random().toString(36).substr(2, 9)}`, // ランダムな部屋名生成
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: {
          enableLobby: false,
          startAudioMuted: 1,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
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
            "select-background",
          ],
        },
        userInfo: {
          displayName: "ゲストユーザー",
        },
      };

      try {
        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          console.log("会議に参加しました");
        });
      } catch (error) {
        console.error("Failed to create JitsiMeetExternalAPI instance", error);
      }
    };

    loadJitsiScript(initJitsi);

    // クリーンアップ処理
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
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
