import express from 'express';
import axios from 'axios';
import { getCache, setCache } from '../services/cache.js';

const router = express.Router();

router.get('/events', async (req, res) => {
  const cached = getCache('events_today');
  if (cached) {
    return res.json(cached);
  }

  try {
    const response = await axios.get(
      'https://api.the-odds-api.com/v4/sports',
      {
        params: {
          apiKey: process.env.SPORTS_API_KEY
        }
      }
    );

    setCache('events_today', response.data, 600);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({
      error: 'No se pudo conectar con la API externa'
    });
  }
});

export default router;
