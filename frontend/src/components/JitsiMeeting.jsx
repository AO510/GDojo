import React, { useEffect, useRef, useState } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null); // ストリームを保存
  const [isRecording, setIsRecording] = useState(false);

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

      api.addEventListener("videoConferenceJoined", () => {
        console.log("[INFO] 会議に参加しました。");
        if (!isRecording) startScreenRecording();
      });

      api.addEventListener("videoConferenceLeft", () => {
        console.log("[INFO] 会議を退出しました。録画を停止します。");
        stopScreenRecording();
      });
    };

    loadJitsiScript(initJitsi);

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
      stopScreenRecording();
    };
  }, [roomName]);

  const startScreenRecording = async () => {
    if (isRecording) return; // 録画が既に開始されている場合は何もしない

    try {
      console.log("[INFO] 画面録画を開始します...");
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: false,
      });

      streamRef.current = stream; // ストリームを保存
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "video/webm" });
          const url = URL.createObjectURL(blob);

          const a = document.createElement("a");
          a.href = url;
          a.download = `recording_${new Date().toISOString()}.webm`;
          a.click();

          URL.revokeObjectURL(url);
          chunksRef.current = [];
          console.log("[INFO] 録画が保存されました。");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("[INFO] 録画が開始されました。");
    } catch (error) {
      console.error("[ERROR] 画面録画の開始中にエラーが発生しました:", error);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("[INFO] 録画を停止しました。");
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop()); // ストリームを解放
      streamRef.current = null;
      console.log("[INFO] ストリームを解放しました。");
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
