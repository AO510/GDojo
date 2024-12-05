const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const matchRoutes = require('./routes/match');
const problemRoutes = require('./routes/problems');
const zoomRoutes = require('./routes/zoomMeeting');
const chatGPTRoutes = require('./routes/chatGPT');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.use('/api/match', matchRoutes);
app.use('/api/problems', problemRoutes);
app.use('/functions', zoomRoutes);
app.use('/integrations/chat-gpt', chatGPTRoutes);

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
