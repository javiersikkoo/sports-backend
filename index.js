import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import eventsRoutes from './routes/events.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/', eventsRoutes);

app.listen(PORT, () => {
  console.log(`Servidor activo en puerto ${PORT}`);
});
