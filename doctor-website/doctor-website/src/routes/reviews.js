const express = require('express');
const store = require('../store');
const { hasErrors, validateReview } = require('../validation');
const { sanitizeText } = require('../sanitize');
const { calculateRating } = require('../rating');
const requireAdmin = require('../middleware/requireAdmin');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const reviewLimiter = createRateLimiter({ windowMs: 60_000, max: 10 });

router.get('/', (req, res) => {
  const { doctorId } = req.query;
  const reviews = store.getReviews(doctorId);
  res.json({ success: true, data: reviews });
});

router.get('/:id', (req, res) => {
  const review = store.getReviewById(req.params.id);
  if (!review) {
    return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  }
  res.json({ success: true, data: review });
});

router.post('/', reviewLimiter, (req, res) => {
  const body = req.body || {};

  const data = {
    doctorId: body.doctorId,
    patientName: sanitizeText(body.patientName, 100),
    rating: body.rating,
    comment: sanitizeText(body.comment, 1000)
  };

  const errors = validateReview(data);
  if (hasErrors(errors)) {
    return res.status(400).json({ success: false, error: { message: 'Validation failed', fields: errors } });
  }

  const doctor = store.getDoctorById(data.doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }

  // Client can never set "verified" — only demo seed data / admin can.
  const review = store.createReview({
    doctorId: Number(data.doctorId),
    patientName: data.patientName,
    rating: Number(data.rating),
    comment: data.comment,
    createdAt: new Date().toISOString(),
    verified: false
  });

  const rating = calculateRating(store.getReviews(data.doctorId));

  res.status(201).json({ success: true, data: { review, rating } });
});

router.put('/:id', requireAdmin, (req, res) => {
  const patch = {};
  if (req.body.verified !== undefined) patch.verified = Boolean(req.body.verified);
  if (req.body.comment !== undefined) patch.comment = sanitizeText(req.body.comment, 1000);

  const updated = store.updateReview(req.params.id, patch);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const ok = store.deleteReview(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: { message: 'Review not found' } });
  }
  res.status(200).json({ success: true, data: { id: Number(req.params.id) } });
});

module.exports = router;
