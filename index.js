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
        error: "SPORTS_API_KEY not defined in environment variables"
      });
    }

    const baseUrl = "https://api.the-odds-api.com/v4";

    // 1️⃣ Fetch all available sports (no limit)
    const sportsResponse = await axios.get(`${baseUrl}/sports`, {
      params: { apiKey }
    });

    const activeSports = sportsResponse.data
      .filter(sport => sport.active && !sport.has_outrights);

    let events = [];

    // 2️⃣ Loop through all active sports
    for (const sport of activeSports) {
      try {
        const oddsResponse = await axios.get(
          `${baseUrl}/sports/${sport.key}/odds`,
          {
            params: {
              apiKey,
              regions: "eu,us,uk,au",
              markets: "h2h",
              oddsFormat: "decimal"
            }
          }
        );

        events.push(...oddsResponse.data);

      } catch (sportError) {
        console.error(
          `Error fetching odds for ${sport.key}:`,
          sportError.response?.data || sportError.message
        );
        continue;
      }
    }

    res.json({
      success: true,
      sportsFetched: activeSports.length,
      eventsFetched: events.length,
      data: events
    });

  } catch (err) {
    console.error(
      "SYNC ERROR:",
      err.response?.data || err.message
    );

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
