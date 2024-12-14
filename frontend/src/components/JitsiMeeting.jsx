import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName }) => {
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const iframeRef = useRef(null);

  useEffect(() => {
    // 会議のURLをiframeに設定
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.src = `https://meet.jit.si/${roomName || `Room_${Math.random().toString(36).substr(2, 9)}`}`;
    }

    // 録画を開始
    const startLocalRecording = async () => {
      try {
        console.log("[INFO] 録画を開始します...");
        const iframeDocument = iframeRef.current?.contentDocument || iframeRef.current?.contentWindow?.document;
        const videoElement = iframeDocument?.querySelector("video");

        if (!videoElement) {
          console.error("[ERROR] Jitsi iframe内のvideo要素が見つかりません。");
          return;
        }

        const stream = videoElement.captureStream();
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
            console.log("[INFO] 録画データが保存されました。");
          }
        };

        mediaRecorder.start();
        console.log("[INFO] 録画を開始しました。");
      } catch (error) {
        console.error("[ERROR] 録画の開始中にエラーが発生しました:", error);
      }
    };

    // 録画を停止
    const stopLocalRecording = () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
        console.log("[INFO] 録画を停止しました。");
      }
    };

    // 録画のライフサイクルを制御
    const handleRecordingLifecycle = async () => {
      await startLocalRecording();

      return () => {
        stopLocalRecording();
      };
    };

    handleRecordingLifecycle();

    return () => {
      stopLocalRecording(); // コンポーネントのアンマウント時に録画を停止
    };
  }, [roomName]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      {/* Jitsi iframe */}
      <iframe
        ref={iframeRef}
        allow="camera; microphone; fullscreen; display-capture"
        style={{ width: "100%", height: "100%", border: "none" }}
        title="Jitsi Meeting"
      ></iframe>
    </div>
  );
};

export default JitsiMeeting;
