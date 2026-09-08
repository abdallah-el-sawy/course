import { getReviews, createReview } from './api.js';
import { showToast, starString, setFieldError, clearFieldErrors, setFormStatus } from './ui.js';

const DOCTOR_ID = 1;
const REVIEW_FIELD_IDS = ['reviewName', 'rating', 'comment'];

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

function renderReviewCard(review) {
  const card = document.createElement('article');
  card.className = 'review-card';

  const head = document.createElement('div');
  head.className = 'review-head';

  const name = document.createElement('span');
  name.className = 'review-name';
  name.textContent = review.patientName;

  const date = document.createElement('span');
  date.className = 'review-date';
  date.textContent = formatDate(review.createdAt);

  head.append(name, date);

  const stars = document.createElement('div');
  stars.className = 'stars';
  stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
  stars.textContent = starString(review.rating);

  const comment = document.createElement('p');
  comment.textContent = review.comment; // textContent only, never innerHTML

  card.append(head, stars, comment);

  if (review.verified) {
    const badge = document.createElement('span');
    badge.className = 'verified-badge';
    badge.textContent = '✓ Verified patient';
    card.appendChild(badge);
  }

  return card;
}

function renderRatingSummary(reviews, doctor) {
  const el = document.getElementById('ratingSummary');
  el.innerHTML = '';

  if (!reviews.length) {
    el.textContent = 'No ratings yet.';
    return;
  }

  const heading = document.createElement('p');
  heading.innerHTML = ''; // ensure clean
  heading.textContent = `Overall Rating: ${doctor.rating} / 5 — based on ${doctor.reviewCount} patient reviews`;
  el.appendChild(heading);

  [5, 4, 3, 2, 1].forEach((star) => {
    const pct = doctor.ratingDistribution?.[star] ?? 0;
    const row = document.createElement('div');
    row.className = 'rating-row';

    const label = document.createElement('span');
    label.className = 'label';
    label.textContent = `${star} ★`;

    const track = document.createElement('div');
    track.className = 'bar-track';
    const fill = document.createElement('div');
    fill.className = 'bar-fill';
    fill.style.width = `${pct}%`;
    track.appendChild(fill);

    const pctLabel = document.createElement('span');
    pctLabel.className = 'pct';
    pctLabel.textContent = `${pct}%`;

    row.append(label, track, pctLabel);
    el.appendChild(row);
  });
}

export async function loadReviews(doctor) {
  const listEl = document.getElementById('reviewsList');
  try {
    const reviews = await getReviews(DOCTOR_ID);
    listEl.innerHTML = '';

    if (!reviews.length) {
      const empty = document.createElement('p');
      empty.textContent = 'No reviews yet. Be the first patient to leave feedback.';
      listEl.appendChild(empty);
    } else {
      reviews
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach((r) => listEl.appendChild(renderReviewCard(r)));
    }

    renderRatingSummary(reviews, doctor);
  } catch (err) {
    listEl.textContent = 'Something went wrong loading reviews. Please try again.';
    console.error(err);
  }
}

function validateReviewForm(form) {
  const errors = {};
  const name = form.patientName.value.trim();
  const rating = form.rating.value;
  const comment = form.comment.value.trim();

  if (name.length < 2) errors.reviewName = 'Please enter your name (2+ characters).';
  if (!rating) errors.rating = 'Please choose a rating.';
  if (comment.length < 2) errors.comment = 'Please enter a comment.';
  if (comment.length > 1000) errors.comment = 'Comment must be under 1000 characters.';

  return errors;
}

export function initReviewForm(onSubmitted) {
  const form = document.getElementById('reviewForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearFieldErrors(REVIEW_FIELD_IDS);
    setFormStatus('reviewStatus', '', null);

    const errors = validateReviewForm(form);
    if (Object.keys(errors).length) {
      Object.entries(errors).forEach(([field, msg]) => setFieldError(field, msg));
      return;
    }

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    try {
      const { rating } = await createReview({
        doctorId: DOCTOR_ID,
        patientName: form.patientName.value.trim(),
        rating: Number(form.rating.value),
        comment: form.comment.value.trim()
      });

      setFormStatus('reviewStatus', 'Thank you — your review has been submitted!', 'success');
      showToast('Review submitted. Thank you!', 'success');
      form.reset();
      if (onSubmitted) onSubmitted(rating);
    } catch (err) {
      if (err.fields) {
        Object.entries(err.fields).forEach(([field, msg]) => {
          const map = { patientName: 'reviewName', rating: 'rating', comment: 'comment' };
          setFieldError(map[field] || field, msg);
        });
      }
      setFormStatus('reviewStatus', err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
