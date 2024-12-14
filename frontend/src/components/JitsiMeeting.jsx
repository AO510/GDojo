import React, { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName, isRecording }) => {
  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

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
        configOverwrite: { prejoinPageEnabled: false },
        interfaceConfigOverwrite: { SHOW_JITSI_WATERMARK: false },
      };

      try {
        const api = new window.JitsiMeetExternalAPI(domain, options);
        apiRef.current = api;

        api.addEventListener("videoConferenceJoined", () => {
          console.log("会議に参加しました");

          // 録画オプションが有効なら録画開始
          if (isRecording) {
            startLocalRecording();
          }
        });

        api.addEventListener("videoConferenceLeft", () => {
          console.log("会議を退出しました");

          // 録画オプションが有効なら録画停止
          if (isRecording) {
            stopLocalRecording();
          }
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
  }, [roomName, isRecording]);

  const startLocalRecording = async () => {
    if (!jitsiContainerRef.current) {
      console.error("Jitsi container not found");
      return;
    }

    try {
      const iframe = jitsiContainerRef.current.querySelector("iframe");
      const iframeDocument = iframe.contentDocument || iframe.contentWindow?.document;
      const videoElement = iframeDocument.querySelector("video");

      if (!videoElement) {
        console.error("Video element not found in Jitsi iframe");
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
          console.log("Recording saved.");
        }
      };

      mediaRecorder.start();
      console.log("録画を開始しました");
    } catch (error) {
      console.error("Error starting local recording:", error);
    }
  };

  const stopLocalRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      console.log("録画を停止しました");
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
