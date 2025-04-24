const express = require('express');
const cors = require('cors');
const { WebcastPushConnection } = require('tiktok-live-connector');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

app.get('/check', async (req, res) => {
  const { users } = req.query;
  
  if (!users) {
    return res.status(400).json({ 
      error: 'Missing users parameter. Use ?users=user1,user2,user3' 
    });
  }
  
  const userList = users.split(',').map(user => user.trim());
  
  if (userList.length === 0) {
    return res.status(400).json({ 
      error: 'No valid users provided' 
    });
  }
  
  const results = [];
  const errors = [];
  
  await Promise.all(
    userList.map(async (username) => {
      try {
        const cleanUsername = username.startsWith('@') ? username.substring(1) : username;
        
        const tiktokLiveConnection = new WebcastPushConnection(cleanUsername);
        
        const roomInfo = await tiktokLiveConnection.getRoomInfo();
        
        if (roomInfo.status === 2) {
          results.push(cleanUsername);
        }
      } catch (error) {
        errors.push({
          username,
          error: error.message || 'Unknown error'
        });
      }
    })
  );
  
  res.setHeader('Content-Type', 'text/plain');
  return res.send(results.join(','));
});

app.get('/', (req, res) => {
  res.send(`
    <h1>TikTok Live Check API</h1>
    <p>Use the /check endpoint with the users parameter to check if users are live.</p>
    <p>Example: <a href="/check?users=user1,user2">/check?users=user1,user2</a></p>
  `);
});

app.listen(port, () => {
  console.log(`TikTok Live Check API running on port ${port}`);
}); 