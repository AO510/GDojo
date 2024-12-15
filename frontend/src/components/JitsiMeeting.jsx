import React, { useEffect, useRef, useState } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false); // 録画中かどうかの状態管理

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

      // 会議参加時に録画を開始
      api.addEventListener("videoConferenceJoined", () => {
        console.log("[INFO] 会議に参加しました。");
        if (!isRecording) {
          startScreenRecording();
        }
      });

      // 会議退出時に録画を停止
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
    try {
      if (isRecording) return; // 既に録画中なら何もしない
      console.log("[INFO] 画面録画を開始します...");

      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { cursor: "always" },
        audio: true,
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `recording_${new Date().toISOString()}.webm`;
        a.click();

        URL.revokeObjectURL(url);
        chunksRef.current = [];
        console.log("[INFO] 録画が保存されました。");
      };

      mediaRecorder.start();
      setIsRecording(true);
      console.log("[INFO] 録画中です。");
    } catch (error) {
      console.error("[ERROR] 画面録画の開始に失敗しました:", error);
    }
  };

  const stopScreenRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log("[INFO] 録画を停止しました。");
    }
  };

  return (
    <div
      ref={jitsiContainerRef}
      style={{ width: "100%", height: "100vh", backgroundColor: "black" }}
    ></div>
  );
};

export default JitsiMeeting;
