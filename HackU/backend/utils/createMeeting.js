const axios = require("axios");
const getAccessToken = require("./tokenGenerator");

const createMeeting = async () => {
    try {
        const accessToken = await getAccessToken();

        const meetingResponse = await axios.post(
            "https://api.zoom.us/v2/users/me/meetings",
            {
                topic: "Test Meeting",
                type: 2, // Scheduled meeting
                start_time: new Date().toISOString(),
                duration: 30, // ミーティング時間（分）
            },
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        console.log("Meeting Created:", meetingResponse.data.join_url);
        return meetingResponse.data;
    } catch (error) {
        console.error("Error creating meeting:", error.response ? error.response.data : error.message);
    }
};

createMeeting();
