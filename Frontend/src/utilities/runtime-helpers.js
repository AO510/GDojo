import { useState } from "react";

// useUpload: ファイルアップロード用のカスタムフック
export const useUpload = () => {
  const upload = async ({ file }) => {
    console.log("Uploading file:", file);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("File upload failed");
    }

    return await response.json(); // { url: "uploaded-file-url" }
  };

  const loading = false; // ローディング状態を制御したい場合に利用
  return [upload, { loading }];
};

// useHandleStreamResponse: ストリーミングデータ処理用のカスタムフック
export const useHandleStreamResponse = ({ onChunk, onFinish }) => {
  return async (response) => {
    const reader = response.body.getReader();
    let accumulatedResult = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = new TextDecoder("utf-8").decode(value);
      accumulatedResult += chunk;
      onChunk(chunk); // 部分的なデータを処理
    }

    onFinish(accumulatedResult); // 全体のデータを処理
  };
};
