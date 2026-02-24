import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../services/cache.js';

const router = express.Router();

/**
 * HOME – Eventos destacados del día (máx 10)
 */
router.get('/events', async (req, res) => {
  const cacheKey = 'home_featured_events';
  const cached = getCache(cacheKey);
  if (cached) return res.json(cached);

  try {
    // 1️⃣ Obtener todos los deportes
    const sportsResponse = await axios.get(
      'https://api.the-odds-api.com/v4/sports',
      { params: { apiKey: process.env.SPORTS_API_KEY } }
    );

    // 2️⃣ Filtrar solo deportes activos
    const activeSports = sportsResponse.data
      .filter(sport => sport.active)
      .slice(0, 3); // limitamos deportes para no gastar peticiones

    let events = [];

    // 3️⃣ Obtener eventos por deporte
    for (const sport of activeSports) {
      if (events.length >= 10) break;

      const oddsResponse = await axios.get(
        `https://api.the-odds-api.com/v4/sports/${sport.key}/odds`,
        {
          params: {
            apiKey: process.env.SPORTS_API_KEY,
            regions: 'eu',
            markets: 'h2h'
          }
        }
      );

      for (const event of oddsResponse.data) {
        if (events.length >= 10) break;

        events.push({
          id: event.id,
          sport: sport.title,
          home: event.home_team,
          away: event.away_team,
          commence_time: event.commence_time,
          bookmakers: event.bookmakers
        });
      }
    }

    setCache(cacheKey, events, 600); // 10 minutos
    res.json(events);

  } catch (error) {
    if (cached) return res.json(cached);
    res.status(500).json({ error: 'No se pudieron cargar los eventos' });
  }
});

export default router;
