import { getDoctor } from './api.js';
import { starString, showToast } from './ui.js';
import { loadReviews, initReviewForm } from './reviews.js';
import { initBookingForm } from './booking.js';
import { initSurveyForm } from './survey.js';

const DOCTOR_ID = 1;

function renderDoctorProfile(doctor) {
  document.getElementById('heroPhoto').src = doctor.photo || '/assets/placeholder.jpg';
  document.getElementById('heroPhoto').alt = `Photo of ${doctor.name}`;
  document.getElementById('heroName').textContent = doctor.name;
  document.getElementById('heroTitle').textContent = `${doctor.title} · ${doctor.specialty}`;
  document.getElementById('heroBio').textContent = doctor.bio;

  const ratingEl = document.getElementById('heroRating');
  ratingEl.innerHTML = '';
  const stars = document.createElement('span');
  stars.className = 'stars';
  stars.textContent = starString(doctor.rating);
  const text = document.createElement('span');
  text.textContent = ` ${doctor.rating} — Based on ${doctor.reviewCount} reviews`;
  ratingEl.append(stars, text);

  document.getElementById('aboutBio').textContent = doctor.bio;

  const skillsList = document.getElementById('skillsList');
  skillsList.innerHTML = '';
  (doctor.skills || []).forEach((skill) => {
    const li = document.createElement('li');
    li.textContent = skill;
    skillsList.appendChild(li);
  });

  document.getElementById('experienceText').textContent =
    `${doctor.experienceYears}+ years of clinical experience in ${doctor.specialty}.`;

  document.title = `${doctor.name} | ${doctor.specialty}`;
}

function initNavToggle() {
  const toggle = document.getElementById('navToggle');
  const nav = document.getElementById('primaryNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();
  initNavToggle();
  initBookingForm();
  initSurveyForm();

  try {
    const doctor = await getDoctor(DOCTOR_ID);
    renderDoctorProfile(doctor);
    await loadReviews(doctor);
    initReviewForm(() => {
      // Refresh the hero/profile rating after a new review is submitted.
      getDoctor(DOCTOR_ID).then((updated) => {
        renderDoctorProfile(updated);
        loadReviews(updated);
      });
    });
  } catch (err) {
    console.error(err);
    document.getElementById('heroName').textContent = 'Unable to load doctor profile';
    showToast('Something went wrong loading the page. Please refresh.', 'error');
  }
}

document.addEventListener('DOMContentLoaded', init);
