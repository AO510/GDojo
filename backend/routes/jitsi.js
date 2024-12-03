const express = require('express');
const router = express.Router();

// 会議リンク生成API
router.post('/create', (req, res) => {
    try {
        const roomName = req.body.roomName || `Room_${Math.random().toString(36).substring(7)}`;
        const jitsiURL = `https://meet.jit.si/${roomName}`;

        res.json({
            status: true,
            join_url: jitsiURL,
            roomName: roomName,
        });
    } catch (error) {
        console.error('Error generating Jitsi Meet URL:', error);
        res.status(500).json({
            status: false,
            error: 'Failed to generate Jitsi Meet URL',
        });
    }
});

module.exports = router;
