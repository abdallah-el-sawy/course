const express = require('express');
const store = require('../store');
const { hasErrors, validateAppointment } = require('../validation');
const { sanitizeText, sanitizeEmail, sanitizePhone } = require('../sanitize');
const { getAvailableSlots, isValidSlotTime, isWorkingDay } = require('../availability');
const requireAdmin = require('../middleware/requireAdmin');
const createRateLimiter = require('../middleware/rateLimit');

const router = express.Router();
const bookingLimiter = createRateLimiter({ windowMs: 60_000, max: 15 });

// GET /api/appointments/availability?doctorId=1&date=2026-09-10
// IMPORTANT: this route must be registered before "/:id" to avoid
// being shadowed by the id route.
router.get('/availability', (req, res) => {
  const { doctorId, date } = req.query;

  if (!doctorId || !date) {
    return res.status(400).json({ success: false, error: { message: 'doctorId and date are required.' } });
  }

  const doctor = store.getDoctorById(doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }

  if (!isWorkingDay(date)) {
    return res.json({ success: true, data: { date, availableSlots: [] } });
  }

  const bookedTimes = store
    .getAppointments({ doctorId, date })
    .filter((a) => a.status !== 'cancelled')
    .map((a) => a.time);

  const availableSlots = getAvailableSlots(date, bookedTimes);
  res.json({ success: true, data: { date, availableSlots } });
});

router.get('/', (req, res) => {
  const { doctorId, date } = req.query;
  const appointments = store.getAppointments({ doctorId, date });
  res.json({ success: true, data: appointments });
});

router.get('/:id', (req, res) => {
  const appt = store.getAppointmentById(req.params.id);
  if (!appt) {
    return res.status(404).json({ success: false, error: { message: 'Appointment not found' } });
  }
  res.json({ success: true, data: appt });
});

router.post('/', bookingLimiter, (req, res) => {
  const body = req.body || {};

  const data = {
    doctorId: body.doctorId,
    patientName: sanitizeText(body.patientName, 100),
    patientPhone: sanitizePhone(body.patientPhone),
    patientEmail: body.patientEmail ? sanitizeEmail(body.patientEmail) : undefined,
    date: body.date,
    time: body.time,
    notes: body.notes ? sanitizeText(body.notes, 1000) : ''
  };

  const errors = validateAppointment(data);
  if (hasErrors(errors)) {
    return res.status(400).json({ success: false, error: { message: 'Validation failed', fields: errors } });
  }

  const doctor = store.getDoctorById(data.doctorId);
  if (!doctor) {
    return res.status(404).json({ success: false, error: { message: 'Doctor not found' } });
  }

  if (!isWorkingDay(data.date)) {
    return res.status(400).json({ success: false, error: { message: 'Clinic is closed on the selected date.' } });
  }

  if (!isValidSlotTime(data.time)) {
    return res.status(400).json({ success: false, error: { message: 'Selected time is outside working hours or falls in a break.' } });
  }

  // Server is the single source of truth for double-booking prevention.
  if (store.isSlotTaken(data.doctorId, data.date, data.time)) {
    return res.status(409).json({ success: false, error: { message: 'Appointment time is already booked.' } });
  }

  const patient = store.findOrCreatePatient({
    name: data.patientName,
    phone: data.patientPhone,
    email: data.patientEmail
  });

  const appointment = store.createAppointment({
    doctorId: Number(data.doctorId),
    patientId: patient.id,
    patientName: data.patientName,
    patientPhone: data.patientPhone,
    patientEmail: data.patientEmail || null,
    date: data.date,
    time: data.time,
    notes: data.notes
  });

  res.status(201).json({ success: true, data: appointment });
});

router.put('/:id', requireAdmin, (req, res) => {
  const allowedStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  const patch = {};

  if (req.body.status) {
    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({ success: false, error: { message: 'Invalid status value.' } });
    }
    patch.status = req.body.status;
  }
  if (req.body.notes !== undefined) {
    patch.notes = sanitizeText(req.body.notes, 1000);
  }

  const updated = store.updateAppointment(req.params.id, patch);
  if (!updated) {
    return res.status(404).json({ success: false, error: { message: 'Appointment not found' } });
  }
  res.json({ success: true, data: updated });
});

router.delete('/:id', requireAdmin, (req, res) => {
  const ok = store.deleteAppointment(req.params.id);
  if (!ok) {
    return res.status(404).json({ success: false, error: { message: 'Appointment not found' } });
  }
  res.status(200).json({ success: true, data: { id: Number(req.params.id) } });
});

module.exports = router;
