const createZoomMeeting = async (req, res) => {
    const { topic, category } = req.body;

    if (!topic || !category) {
        return res.status(400).json({ error: 'Topic and category are required.' });
    }

    try {
        const zoomUrl = `https://zoom.us/j/${Math.random().toString().slice(2, 11)}`;
        res.json({ join_url: zoomUrl });
    } catch (error) {
        console.error('Error creating Zoom meeting:', error);
        res.status(500).json({ error: 'Failed to create Zoom meeting.' });
    }
};

module.exports = { createZoomMeeting };
