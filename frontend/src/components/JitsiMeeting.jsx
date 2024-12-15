import React, { useEffect, useRef, useState } from "react";

const JitsiMeeting = ({ roomName }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [isRecording, setIsRecording] = useState(false); // 録画中かどうかを管理

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

        api.addEventListener("videoConferenceJoined", async () => {
          console.log("[INFO] 会議に参加しました。");
          if (!isRecording) {
            console.log("[INFO] 録画を開始します...");
            await startScreenRecording();
          }
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
      stopLocalRecording();
    };
  }, [roomName, isRecording]);

  const startScreenRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always", // マウスカーソルを含める
        },
        audio: true,
      });

      console.log("[INFO] 画面録画用のストリームを取得しました:", stream);

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
          console.log("[INFO] 録画データが保存されました");
        }
      };

      mediaRecorder.start();
      setIsRecording(true); // 録画中の状態を更新
      console.log("[INFO] 録画を開始しました");
    } catch (error) {
      if (error.name === "NotAllowedError") {
        alert("[ERROR] 画面録画の権限が拒否されました。再試行してください。");
      } else {
        console.error("[ERROR] 録画の開始中にエラーが発生しました:", error);
      }
    }
  };

  const stopLocalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false); // 録画中の状態を更新
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
