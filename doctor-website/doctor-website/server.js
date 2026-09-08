const express = require('express');
const path = require('path');
const helmet = require('helmet');
const cors = require('cors');

const config = require('./src/config');
const doctorsRouter = require('./src/routes/doctors');
const appointmentsRouter = require('./src/routes/appointments');
const reviewsRouter = require('./src/routes/reviews');
const surveysRouter = require('./src/routes/surveys');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// ---- Core middleware ----
app.use(
  helmet({
    contentSecurityPolicy: false // relaxed for this educational MVP; tighten for production
  })
);
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// ---- Static frontend ----
app.use(express.static(path.join(__dirname, 'public')));

// ---- Health check ----
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

// ---- API routes ----
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/surveys', surveysRouter);

// ---- 404 for unknown API routes ----
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: { message: 'API route not found' } });
});

// ---- Fallback to index.html for the single-page app ----
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---- Centralized error handler (must be last) ----
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`Server running on http://localhost:${config.PORT}`);
  });
}

module.exports = app;
