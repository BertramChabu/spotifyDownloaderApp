const express = require('express');
const axios = require('axios');
const queryString = require('querystring');
const router = express.Router();
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;

router.get('/login', (req, res) => {
  const scope = 'user-read-private user-read-email';
  res.redirect('https://accounts.spotify.com/authorize?' + queryString.stringify({
    response_type: 'code',
    client_id,
    scope,
    redirect_uri,
  }));
});

router.get('/callback', async (req, res) => {
  const code = req.query.code || null;

  try {
    const tokenRes = await axios.post('https://accounts.spotify.com/api/token',
      queryString.stringify({
        code,
        redirect_uri,
        grant_type: 'authorization_code',
      }), {
        headers: {
          'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

    const { access_token, refresh_token } = tokenRes.data;
    res.json({ access_token, refresh_token });

  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Token exchange failed' });
  }
});

module.exports = router;
