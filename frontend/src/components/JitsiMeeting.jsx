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
        roomName: roomName || `Room_${Math.random().toString(36).substr(2, 9)}`,
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

        // フルスクリーンの初期化
        api.executeCommand("toggleVideo");

        api.addEventListener("videoConferenceJoined", () => {
          console.log("会議に参加しました");
        });

        api.addEventListener("recordingStatusChanged", (event) => {
          console.log("録画ステータス: ", event.status);
        });
      } catch (error) {
        console.error("Failed to create JitsiMeetExternalAPI instance", error);
      }
    };

    loadJitsiScript(initJitsi);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName]);

  const startRecording = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("startRecording", {
        mode: "file", // サーバー設定に依存
      });
    }
  };

  const stopRecording = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand("stopRecording", {
        mode: "file",
      });
    }
  };

  const toggleFullScreen = () => {
    if (jitsiContainerRef.current) {
      if (!document.fullscreenElement) {
        jitsiContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div>
      <div
        ref={jitsiContainerRef}
        style={{
          width: "100%",
          height: "100vh",
          backgroundColor: "black",
          position: "relative",
        }}
      ></div>
      <div
        style={{
          marginTop: "20px",
          textAlign: "center",
          position: "absolute",
          bottom: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
        }}
      >
        
      </div>
    </div>
  );
};

export default JitsiMeeting;
