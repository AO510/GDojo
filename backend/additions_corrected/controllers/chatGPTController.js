const handleChat = async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'Invalid request body. Expected messages array.' });
    }

    try {
        const responseMessage = 'Simulated response from ChatGPT';
        res.json({ message: responseMessage });
    } catch (error) {
        console.error('Error in ChatGPT conversation:', error);
        res.status(500).json({ error: 'Failed to process conversation.' });
    }
};

module.exports = { handleChat };
