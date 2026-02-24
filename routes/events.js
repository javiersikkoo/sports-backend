import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../services/cache.js';

const router = express.Router();

/**
 * HOME – Eventos destacados (máx 10)
 * Versión segura para plan gratuito
 */
router.get('/events', async (req, res) => {
  const cacheKey = 'home_events_safe';
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports/soccer/odds',
      {
        params: {
          apiKey: process.env.SPORTS_API_KEY,
          regions: 'eu',
          markets: 'h2h'
        }
      }
    );

    const events = response.data.slice(0, 10).map(event => ({
      id: event.id,
      sport: 'Football',
      home: event.home_team,
      away: event.away_team,
      commence_time: event.commence_time
    }));

    setCache(cacheKey, events, 600); // 10 min
    res.json(events);

  } catch (error) {
    if (cached) return res.json(cached);
    res.status(500).json({
      error: 'No se pudieron cargar los eventos'
    });
  }
});

export default router;
