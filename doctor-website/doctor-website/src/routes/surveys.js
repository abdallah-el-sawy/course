const express = require('express');
const store = require('../store');
const { hasErrors, validateSurvey } = require('../validation');
const { sanitizeText } = require('../sanitize');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const surveyLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

router.get('/', (req, res) => {
  res.json({ success: true, data: store.getSurveys() });
});

router.get('/:id', (req, res) => {
  const survey = store.getSurveyById(req.params.id);
  if (!survey) {
    return res.status(404).json({ success: false, error: { message: 'Survey not found' } });
  }
  res.json({ success: true, data: survey });
});

router.post('/', surveyLimiter, (req, res) => {
  const body = req.body || {};

  const data = {
    appointmentId: body.appointmentId,
    patientName: sanitizeText(body.patientName, 100),
    satisfaction: body.satisfaction,
    communication: body.communication,
    waitingTime: body.waitingTime,
    wouldRecommend: typeof body.wouldRecommend === 'boolean' ? body.wouldRecommend : body.wouldRecommend === 'true',
    comments: body.comments ? sanitizeText(body.comments, 1000) : ''
  };

  const errors = validateSurvey(data);
  if (hasErrors(errors)) {
    return res.status(400).json({ success: false, error: { message: 'Validation failed', fields: errors } });
  }

  const appointment = store.getAppointmentById(data.appointmentId);
  if (!appointment) {
    return res.status(404).json({ success: false, error: { message: 'Appointment not found' } });
  }

  const survey = store.createSurvey({
    appointmentId: Number(data.appointmentId),
    patientName: data.patientName,
    satisfaction: Number(data.satisfaction),
    communication: Number(data.communication),
    waitingTime: Number(data.waitingTime),
    wouldRecommend: data.wouldRecommend,
    comments: data.comments
  });

  res.status(201).json({ success: true, data: survey });
});

module.exports = router;
