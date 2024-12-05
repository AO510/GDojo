const express = require('express');
const router = express.Router();
const zoomMeetingController = require('../controllers/zoomMeetingController');

router.post('/create-zoom-meeting', zoomMeetingController.createZoomMeeting);

module.exports = router;
