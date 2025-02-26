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
    console.error("Error fetching Spotify token:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data || "Internal server error" });
  }
});

// Route to fetch user's playlists
app.get("/playlists", async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split("Bearer ")[1];
    
    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" });
    }

    const response = await axios.get(`${SPOTIFY_API_BASE}/me/playlists`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching user playlists:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Failed to fetch playlists" });
  }
});

// Route to fetch specific playlist data
app.get("/playlist", async (req, res) => {
  try {
    const { playlistId } = req.query;
    const accessToken = req.headers.authorization?.split("Bearer ")[1];

    if (!accessToken) {
      return res.status(401).json({ error: "No access token provided" });
    }

    const response = await axios.get(`${SPOTIFY_API_BASE}/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    res.json(response.data);
  } catch (error) {
    console.error("Error fetching playlist:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ error: error.response?.data || "Failed to fetch playlist data" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
