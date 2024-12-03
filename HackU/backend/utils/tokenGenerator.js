const axios = require("axios");

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const ACCOUNT_ID = process.env.ACCOUNT_ID;

const getAccessToken = async () => {
    try {
        const response = await axios.post(
            `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
            null,
            {
                headers: {
                    Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
                },
            }
        );
        return response.data.access_token;
    } catch (error) {
        console.error("Error fetching access token:", error.response ? error.response.data : error.message);
        throw new Error("Failed to fetch access token");
    }
};

module.exports = getAccessToken;
