require("dotenv").config(); // 環境変数を読み込む
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express(); // `app` を初期化
const matchRouter = require("./controllers/matchController");

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000";
const PORT = process.env.PORT || 5000;

// 許可するオリジンをリスト化
const allowedOrigins = [
  "http://localhost:3000", // ローカル開発用
  "https://gdojo-frontend.onrender.com" // 本番用フロントエンド
];

// ミドルウェア設定
app.use(bodyParser.json());

// 動的CORS設定
app.use(
  cors({
    origin: (origin, callback) => {
      // originが許可リストに含まれている場合のみ許可
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS policy not allowed for this origin"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    allowedHeaders: ["Content-Type"],
  })
);

// デフォルトルート
app.get("/", (req, res) => {
  res.send("Welcome to the API! The server is running.");
});

// マッチング機能のルートを追加
app.use("/api", matchRouter); // `/api` パスでマッチング機能を提供

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on ${API_BASE_URL}:${PORT}`);
});
