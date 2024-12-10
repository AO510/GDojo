require("dotenv").config(); // 環境変数を読み込む
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express(); // `app` を初期化
const matchRouter = require("./controllers/matchController");

const API_BASE_URL = process.env.API_BASE_URL ; 
const PORT = process.env.PORT ;

// CORS設定
const corsOptions = {
  origin: (origin, callback) => {
    // 許可するオリジンのリスト
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      "http://localhost:3000",
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// ミドルウェア設定
app.use(bodyParser.json());

// デフォルトルート
app.get("/", (req, res) => {
  try {
  res.send("Welcome to the API! The server is running.");
  }catch (error) {
    console.error("Error in root endpoint:", error);
    res.status(500).send("Internal Server Error");
  }
});

// マッチング機能のルートを追加
app.use("/api", matchRouter); // `/api` パスでマッチング機能を提供

// サーバー起動
app.listen(PORT, () => {
  console.log(`Server running on ${API_BASE_URL}:${PORT}`);
});
