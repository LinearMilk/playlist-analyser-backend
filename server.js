import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const SPOTIFY_API_BASE = "https://api.spotify.com/v1";

// Route to get Spotify access token
app.post("/auth/token", async (req, res) => {
  try {
    const { code } = req.body;
    const response = await axios.post("https://accounts.spotify.com/api/token", new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      redirect_uri: process.env.SPOTIFY_REDIRECT_URI,
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch playlist data
app.get("/playlist", async (req, res) => {
  try {
    const { playlistId, accessToken } = req.query;
    const response = await axios.get(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
