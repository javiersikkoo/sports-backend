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
    const baseUrl = "https://api.the-odds-api.com/v4";

    const sportsRes = await axios.get(`${baseUrl}/sports`, {
      params: { apiKey }
    });

    const activeSports = sportsRes.data
      .filter(s => s.active && !s.has_outrights)
      .slice(0, 5);

    let events = [];

    for (const sport of activeSports) {
      try {
        const oddsRes = await axios.get(
          `${baseUrl}/sports/${sport.key}/odds`,
          {
            params: {
              apiKey,
              regions: "eu",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );
        events.push(...oddsRes.data);
      } catch (e) {
        continue;
      }
    }

    res.json({
      success: true,
      sports: activeSports.length,
      events: events.length,
      data: events
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Sync failed"
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on", PORT);
});
