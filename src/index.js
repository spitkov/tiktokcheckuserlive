const express = require('express');
const cors = require('cors');
const { WebcastPushConnection } = require('tiktok-live-connector');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Set up middleware
app.use(cors());
app.use(express.static('public'));

// Set up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

// Check if users are live
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

// OBS Browser Source page to automatically control OBS based on TikTok live status
app.get('/obs', async (req, res) => {
  const { users, mode = 'stream', reloadInterval } = req.query;
  
  if (!users) {
    return res.status(400).send('Missing users parameter. Use ?users=user1,user2,user3');
  }
  
  // Parse reloadInterval or use null if not provided
  let interval = null;
  if (reloadInterval) {
    const parsed = parseInt(reloadInterval, 10);
    if (!isNaN(parsed) && parsed > 0) {
      interval = parsed;
    }
  }
  
  res.render('obs', { 
    users, 
    mode,
    reloadInterval: interval,
    checkInterval: interval || 10, // Default to 10 seconds for the check interval
    autoReload: interval !== null
  });
});

// Home route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'TikTok Live Checker'
  });
});

// Start server
app.listen(port, () => {
  console.log(`TikTok Live Check API running on port ${port}`);
}); 