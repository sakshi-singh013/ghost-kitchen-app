const express = require('express');
const pool = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
const PORT = 5000;

app.get('/', (req, res) => {
  res.send('Ghost Kitchen API is alive!');
});
app.use('/api', dashboardRoutes);
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});