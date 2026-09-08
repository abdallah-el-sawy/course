// Phase 1: simple in-memory data store.
//
// Phase 2 note: replace this module's internals with SQLite-backed
// functions (same exported shape) using `better-sqlite3` and
// parameterized queries. Routes only depend on the functions below,
// not on how data is stored.

let nextDoctorId = 2;
let nextAppointmentId = 1;
let nextReviewId = 6;
let nextSurveyId = 1;
let nextPatientId = 1;

const doctors = [
  {
    id: 1,
    name: 'Dr. Ahmed Mohamed',
    title: 'Consultant Internal Medicine',
    specialty: 'Internal Medicine',
    photo: '/assets/doctor.jpg',
    bio: 'Experienced physician focused on patient-centered, evidence-based care. (Sample/demo profile.)',
    skills: ['Internal Medicine', 'Diabetes Management', 'Hypertension', 'Preventive Care'],
    experienceYears: 12
    // rating/reviewCount are DERIVED from reviews, not stored here.
  }
];

const reviews = [
  { id: 1, doctorId: 1, patientName: 'Sara K. (demo)', rating: 5, comment: 'Very attentive and explained everything clearly. [Sample data]', createdAt: '2026-08-01T10:00:00Z', verified: true },
  { id: 2, doctorId: 1, patientName: 'Mostafa R. (demo)', rating: 5, comment: 'Short wait time and a thorough checkup. [Sample data]', createdAt: '2026-08-04T09:30:00Z', verified: true },
  { id: 3, doctorId: 1, patientName: 'Nourhan A. (demo)', rating: 4, comment: 'Good visit overall, would come back. [Sample data]', createdAt: '2026-08-10T12:00:00Z', verified: true },
  { id: 4, doctorId: 1, patientName: 'Youssef T. (demo)', rating: 5, comment: 'Professional and friendly staff. [Sample data]', createdAt: '2026-08-15T15:00:00Z', verified: false },
  { id: 5, doctorId: 1, patientName: 'Heba M. (demo)', rating: 4, comment: 'Clear explanations, slightly long wait. [Sample data]', createdAt: '2026-08-20T11:00:00Z', verified: true }
];

const appointments = [];
const surveyResponses = [];
const patients = [];

// ---- Doctors ----
function getDoctors() {
  return doctors;
}
function getDoctorById(id) {
  return doctors.find((d) => d.id === Number(id));
}
function createDoctor(doc) {
  const newDoc = { id: nextDoctorId++, ...doc };
  doctors.push(newDoc);
  return newDoc;
}
function updateDoctor(id, patch) {
  const doc = getDoctorById(id);
  if (!doc) return null;
  Object.assign(doc, patch);
  return doc;
}
function deleteDoctor(id) {
  const idx = doctors.findIndex((d) => d.id === Number(id));
  if (idx === -1) return false;
  doctors.splice(idx, 1);
  return true;
}

// ---- Reviews ----
function getReviews(doctorId) {
  if (doctorId === undefined) return reviews;
  return reviews.filter((r) => r.doctorId === Number(doctorId));
}
function getReviewById(id) {
  return reviews.find((r) => r.id === Number(id));
}
function createReview(review) {
  const newReview = { id: nextReviewId++, ...review };
  reviews.push(newReview);
  return newReview;
}
function updateReview(id, patch) {
  const review = getReviewById(id);
  if (!review) return null;
  Object.assign(review, patch);
  return review;
}
function deleteReview(id) {
  const idx = reviews.findIndex((r) => r.id === Number(id));
  if (idx === -1) return false;
  reviews.splice(idx, 1);
  return true;
}

// ---- Appointments ----
function getAppointments(filters = {}) {
  return appointments.filter((a) => {
    if (filters.doctorId && a.doctorId !== Number(filters.doctorId)) return false;
    if (filters.date && a.date !== filters.date) return false;
    return true;
  });
}
function getAppointmentById(id) {
  return appointments.find((a) => a.id === Number(id));
}
function isSlotTaken(doctorId, date, time) {
  return appointments.some(
    (a) =>
      a.doctorId === Number(doctorId) &&
      a.date === date &&
      a.time === time &&
      a.status !== 'cancelled'
  );
}
function createAppointment(appt) {
  const newAppt = {
    id: nextAppointmentId++,
    status: 'pending',
    createdAt: new Date().toISOString(),
    ...appt
  };
  appointments.push(newAppt);
  return newAppt;
}
function updateAppointment(id, patch) {
  const appt = getAppointmentById(id);
  if (!appt) return null;
  Object.assign(appt, patch);
  return appt;
}
function deleteAppointment(id) {
  const idx = appointments.findIndex((a) => a.id === Number(id));
  if (idx === -1) return false;
  appointments.splice(idx, 1);
  return true;
}

// ---- Surveys ----
function getSurveys() {
  return surveyResponses;
}
function getSurveyById(id) {
  return surveyResponses.find((s) => s.id === Number(id));
}
function createSurvey(survey) {
  const newSurvey = { id: nextSurveyId++, createdAt: new Date().toISOString(), ...survey };
  surveyResponses.push(newSurvey);
  return newSurvey;
}

// ---- Patients (optional, minimal for MVP) ----
function findOrCreatePatient({ name, phone, email }) {
  let patient = patients.find((p) => p.phone === phone);
  if (!patient) {
    patient = { id: nextPatientId++, name, phone, email: email || null, createdAt: new Date().toISOString() };
    patients.push(patient);
  }
  return patient;
}

module.exports = {
  getDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
  getReviews,
  getReviewById,
  createReview,
  updateReview,
  deleteReview,
  getAppointments,
  getAppointmentById,
  isSlotTaken,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getSurveys,
  getSurveyById,
  createSurvey,
  findOrCreatePatient
};
