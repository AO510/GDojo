import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName, onRecordingStop }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    // JitsiMeetExternalAPI の初期化を一度だけ行う
    if (apiRef.current) {
      console.log("[INFO] JitsiMeetExternalAPI はすでに初期化されています。");
      return;
    }

    const loadJitsiScript = (callback) => {
      if (typeof window.JitsiMeetExternalAPI !== "undefined") {
        callback();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://meet.jit.si/external_api.js";
      script.async = true;
      script.onload = callback;
      script.onerror = () => console.error("[ERROR] Jitsi APIスクリプトのロードに失敗しました");
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("[ERROR] JitsiMeetExternalAPIが利用できません");
        return;
      }

      const domain = "meet.jit.si";
      const options = {
        roomName: roomName || `Room_${Math.random().toString(36).substr(2, 9)}`,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: "100%",
        configOverwrite: { prejoinPageEnabled: false },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
      };

      try {
        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          console.log("[INFO] 会議に参加しました。録画を開始します...");
        });

        api.addEventListener("videoConferenceLeft", () => {
          console.log("[INFO] 会議を退出しました。録画を停止します...");
          stopLocalRecording();
        });
      } catch (error) {
        console.error("[ERROR] JitsiMeetExternalAPIの初期化に失敗しました:", error);
      }
    };

    loadJitsiScript(initJitsi);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      stopLocalRecording(); // アンマウント時に録画を停止
    };
  }, [roomName]);

  const stopLocalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      console.log("[INFO] 録画を停止しました");
    }
  };

  return (
    <div
      ref={jitsiContainerRef}
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        position: "relative",
      }}
    ></div>
  );
};

export default JitsiMeeting;
