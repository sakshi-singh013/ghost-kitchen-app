const express = require('express');
const pool = require('./config/db');
const dashboardRoutes = require('./routes/dashboardRoutes');
const authRoutes = require('./routes/authRoutes');
const searchRoutes = require('./routes/searchRoutes');
const aiRoutes = require('./routes/aiRoutes');
const adminRoutes = require('./routes/adminRoutes');
const metaRoutes = require('./routes/metaRoutes');
const recommendRoutes = require('./routes/recommendRoutes');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
  res.send('Ghost Kitchen API is alive!');
});
app.use('/api', dashboardRoutes);
app.use('/api/auth', authRoutes);
app.use('/api', searchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', metaRoutes);
app.use('/api', recommendRoutes);
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});