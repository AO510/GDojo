const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController'); // コントローラのインポート

// POSTエンドポイントを定義
router.post('/', matchController.createMatch);

// 必要に応じて他のルートを定義
// router.get('/someRoute', matchController.someFunction); // 定義済み関数をコールバックとして渡す

module.exports = router;
