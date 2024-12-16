import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName, isRecording, onStartRecording, onStopRecording }) => {
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
      script.onerror = () => console.error("[ERROR] Jitsi APIのロードに失敗しました。");
      document.body.appendChild(script);
    };

    const initJitsi = () => {
      if (!window.JitsiMeetExternalAPI) {
        console.error("[ERROR] JitsiMeetExternalAPIが利用できません。");
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

      const api = new window.JitsiMeetExternalAPI(domain, options);
      apiRef.current = api;

      api.addEventListener("videoConferenceJoined", async () => {
        console.log("[INFO] 会議に参加しました。");

        // 録画開始アラートと画面選択
        const userConfirmed = window.confirm(
          "録画を開始します。録画したい画面やウィンドウを選択してください。"
        );

        if (userConfirmed && onStartRecording) {
          try {
            console.log("[INFO] ユーザーが録画を承認しました。画面選択を要求中...");
            await onStartRecording(); // 録画を開始
            console.log("[INFO] 録画が正常に開始されました。");
          } catch (error) {
            console.error("[ERROR] 録画の開始中にエラーが発生しました:", error);
          }
        } else {
          console.log("[INFO] ユーザーが録画をキャンセルしました。");
        }
      });

      api.addEventListener("videoConferenceLeft", () => {
        console.log("[INFO] 会議を退出しました。録画を停止します。");
        if (onStopRecording) {
          onStopRecording(); // 録画を停止
        }
      });
    };

    loadJitsiScript(initJitsi);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [roomName, onStartRecording, onStopRecording]);

  return (
    <div
      ref={jitsiContainerRef}
      style={{
        width: "100%",
        height: "100vh",
        backgroundColor: "black",
        position: "relative",
      }}
    >
      {isRecording && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            color: "white",
            backgroundColor: "red",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
        >
          録画中...
        </div>
      )}
    </div>
  );
};

export default JitsiMeeting;
