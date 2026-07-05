const express = require('express');
const pool = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');

const app = express();
const cors = require('cors');
app.use(express.json());
app.use(cors());
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Ghost Kitchen API is alive!');
});
app.use('/api', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', searchRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});