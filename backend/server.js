require("dotenv").config(); // 環境変数を読み込む
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express(); // `app` を初期化
const matchRouter = require("./controllers/matchController");


const PORT = process.env.PORT || 5000;

// ミドルウェア設定
app.use(cors());
app.use(bodyParser.json());

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000", // 環境変数で切り替え
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: ["Content-Type"],
};
app.use(cors(corsOptions));


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