import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ success: true, message: "Backend OK" });
});

app.get("/sync", async (req, res) => {
  try {
    const apiKey = process.env.SPORTS_API_KEY;

    if (!apiKey) {
      return res.status(500).json({
        success: false,
        error: "SPORTS_API_KEY not defined"
      });
    }

    const baseUrl = "https://api.the-odds-api.com/v4";

    // 🔥 SOLO FUTBOL (soccer)
    const sportKey = "soccer_epl"; // Premier League ejemplo

    const oddsResponse = await axios.get(
      `${baseUrl}/sports/${sportKey}/odds`,
      {
        params: {
          apiKey,
          regions: "eu",
          markets: "h2h",
          oddsFormat: "decimal"
        }
      }
    );

    res.json({
      success: true,
      sport: sportKey,
      eventsFetched: oddsResponse.data.length,
      data: oddsResponse.data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.response?.data || err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
