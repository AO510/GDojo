/*const axios = require('axios');

// Zoom APIトークン情報 (JWTの生成が必要)
const ZOOM_API_KEY = "your_api_key"; // 取得したAPIキーを記載
const ZOOM_API_SECRET = "your_api_secret"; // 取得したシークレットを記載
const jwt = require('jsonwebtoken');

// JWTトークンを生成する関数
const generateZoomJWT = () => {
    const payload = {
        iss: ZOOM_API_KEY,
        exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1時間有効
    };
    return jwt.sign(payload, ZOOM_API_SECRET);
};

const createMeeting = async (req, res) => {
    const { topic, duration, startTime } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required.' });
    }

    try {
        const zoomToken = generateZoomJWT();
        const response = await axios.post(
            "https://api.zoom.us/v2/users/me/meetings",
            {
                topic,
                type: 2, // スケジュールされたミーティング
                start_time: startTime || new Date().toISOString(),
                duration: duration || 30,
                settings: {
                    join_before_host: true,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${zoomToken}`,
                    "Content-Type": "application/json",
                },
            }
        );

        res.json({ join_url: response.data.join_url });
    } catch (error) {
        console.error('Error creating Zoom meeting:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to create Zoom meeting.' });
    }
};

module.exports = {
    createMeeting,
};*/
