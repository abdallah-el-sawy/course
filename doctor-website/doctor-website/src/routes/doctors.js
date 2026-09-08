const express = require('express');
const store = require('../store');
const { calculateRating, calculateDistribution } = require('../rating');
const { sanitizeText } = require('../sanitize');
const requireAdmin = require('../middleware/requireAdmin');

const router = express.Router();

function serializeDoctor(doctor) {
  const reviews = store.getReviews(doctor.id);
  const rating = calculateRating(reviews);
  return {
    ...doctor,
    rating: rating.average,
    reviewCount: rating.count,
    ratingDistribution: calculateDistribution(reviews)
  };
}

// GET /api/doctors?specialty=&minRating=
router.get('/', (req, res) => {
  const { specialty, minRating } = req.query;
  let doctors = store.getDoctors().map(serializeDoctor);

  if (specialty) {
    const needle = String(specialty).toLowerCase();
    doctors = doctors.filter((d) => d.specialty.toLowerCase().includes(needle));
  }
  if (minRating) {
    const min = Number(minRating);
    if (Number.isFinite(min)) {
      doctors = doctors.filter((d) => d.rating >= min);
    }
  }

  res.json({ success: true, data: doctors });
});

router.get('/:id', (req, res) => {
  const doctor = store.getDoctorById(req.params.id);
  if (!doctor) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }
  res.json({ success: true, data: serializeDoctor(doctor) });
});

// Admin-only management endpoints (dev-only placeholder auth)
router.post('/', requireAdmin, (req, res) => {
  const { name, title, specialty, photo, bio, skills, experienceYears } = req.body || {};
  if (!name || !title || !specialty) {
    return res.status(400).json({ success: false, error: { message: 'name, title and specialty are required.' } });
  }
  const doctor = store.createDoctor({
    name: sanitizeText(name, 100),
    title: sanitizeText(title, 150),
    specialty: sanitizeText(specialty, 100),
    photo: photo || '/assets/placeholder.jpg',
    bio: sanitizeText(bio || '', 1000),
    skills: Array.isArray(skills) ? skills.map((s) => sanitizeText(s, 60)) : [],
    experienceYears: Number(experienceYears) || 0
  });
  res.status(201).json({ success: true, data: serializeDoctor(doctor) });
});

router.put('/:id', requireAdmin, (req, res) => {
  const updated = store.updateDoctor(req.params.id, req.body || {});
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }
  res.json({ success: true, data: serializeDoctor(updated) });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const ok = store.deleteDoctor(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }
  res.status(200).json({ success: true, data: { id: Number(req.params.id) } });
});

module.exports = router;
