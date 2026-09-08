(function () {
  const reviewForm = document.getElementById("reviewForm");
  const reviewStars = document.getElementById("reviewStars");
  const reviewRatingInput = document.getElementById("reviewRating");
  const reviewsList = document.getElementById("reviewsList");
  const toggleReviewsBtn = document.getElementById("toggleReviewsBtn");

  const MAX_VISIBLE_REVIEWS = 3;
  let expanded = false;

  function getReviews() {
    return doctorStorage.getReviews();
  }

  function saveReviews(reviews) {
    doctorStorage.saveReviews(reviews);
  }

  function formatDate(value) {
    const date = new Date(value);
    return date.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function renderStars(value) {
    return "★".repeat(value) + "☆".repeat(5 - value);
  }

  function calculateAverageRating(reviews) {
    if (!reviews.length) return 0;
    const total = reviews.reduce(
      (sum, review) => sum + Number(review.rating),
      0,
    );
    return total / reviews.length;
  }

  function renderRatingSummary() {
    const reviews = getReviews();
    const average = calculateAverageRating(reviews);
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

    reviews.forEach((review) => {
      const rating = Number(review.rating);
      if (rating >= 1 && rating <= 5) distribution[rating] += 1;
    });

    const averageRatingValue = document.getElementById("averageRatingValue");
    const averageRatingStars = document.getElementById("averageRatingStars");
    const ratingBreakdown = document.getElementById("ratingBreakdown");

    if (averageRatingValue) averageRatingValue.textContent = average.toFixed(1);
    if (averageRatingStars)
      averageRatingStars.textContent = renderStars(Math.round(average || 0));

    if (ratingBreakdown) {
      ratingBreakdown.innerHTML = [5, 4, 3, 2, 1]
        .map((star) => {
          const count = distribution[star] || 0;
          const percentage = reviews.length
            ? (count / reviews.length) * 100
            : 0;
          return `
          <div class="rating-row">
            <span>${star}</span>
            <div class="rating-bar-track"><span class="rating-bar-fill" style="width: ${percentage}%"></span></div>
            <span>${Math.round(percentage)}%</span>
          </div>
        `;
        })
        .join("");
    }
  }

  function renderReviews() {
    const reviews = getReviews();
    const visible = expanded ? reviews : reviews.slice(0, MAX_VISIBLE_REVIEWS);

    if (!reviewsList) return;
    if (!reviews.length) {
      reviewsList.innerHTML =
        '<div class="review-card"><p>كن أول من يشارك تجربته</p></div>';
      toggleReviewsBtn.hidden = true;
      return;
    }

    reviewsList.innerHTML = visible
      .map(
        (review) => `
      <article class="review-card">
        <div class="review-header">
          <span class="review-name">${review.name}</span>
          ${review.verified ? '<span class="badge">موثق</span>' : ""}
        </div>
        <div class="review-stars">${renderStars(Number(review.rating))}</div>
        <p>${review.comment}</p>
        <div class="review-meta">
          <span class="review-date">${formatDate(review.createdAt)}</span>
        </div>
      </article>
    `,
      )
      .join("");

    if (toggleReviewsBtn) {
      toggleReviewsBtn.hidden = reviews.length <= MAX_VISIBLE_REVIEWS;
      toggleReviewsBtn.textContent = expanded ? "إظهار أقل" : "عرض المزيد";
    }
  }

  function validateReviewForm(formData) {
    const errors = {};
    const name = formData.reviewerName?.trim();
    const rating = Number(formData.reviewRating);
    const comment = formData.reviewComment?.trim();

    if (!name) errors.reviewerName = "من فضلك أدخل الاسم";
    if (!rating || rating < 1 || rating > 5)
      errors.reviewRating = "من فضلك اختر تقييم من 1 إلى 5 نجوم";
    if (!comment || comment.length < 10)
      errors.reviewComment = "التعليق يجب أن يحتوي على 10 أحرف على الأقل";

    return errors;
  }

  function showReviewErrors(errors) {
    const fields = reviewForm.querySelectorAll("input, textarea");
    fields.forEach((field) => {
      const name = field.name;
      const errorEl = reviewForm.querySelector(`[data-error-for="${name}"]`);
      const hasError = errors[name];
      field.classList.toggle("invalid", Boolean(hasError));
      if (errorEl) errorEl.textContent = hasError || "";
    });

    const starError = reviewForm.querySelector(
      '[data-error-for="reviewRating"]',
    );
    if (starError) {
      starError.textContent = errors.reviewRating || "";
    }
  }

  function setupStarInteraction() {
    const stars = reviewStars ? reviewStars.querySelectorAll(".star") : [];
    stars.forEach((star) => {
      star.addEventListener("mouseenter", () => {
        const value = Number(star.dataset.value);
        stars.forEach((item) => {
          item.classList.toggle("active", Number(item.dataset.value) <= value);
        });
      });

      star.addEventListener("mouseleave", () => {
        const currentValue = Number(reviewRatingInput.value || 0);
        stars.forEach((item) => {
          item.classList.toggle(
            "active",
            Number(item.dataset.value) <= currentValue,
          );
        });
      });

      star.addEventListener("click", () => {
        const value = Number(star.dataset.value);
        reviewRatingInput.value = String(value);
        stars.forEach((item) => {
          item.classList.toggle("active", Number(item.dataset.value) <= value);
        });
      });
    });
  }

  function submitReview(event) {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(reviewForm).entries());
    const errors = validateReviewForm(formData);

    if (Object.keys(errors).length > 0) {
      showReviewErrors(errors);
      ui.showToast("يرجى مراجعة بيانات التقييم", "error");
      return;
    }

    const review = {
      name: formData.reviewerName.trim(),
      rating: Number(formData.reviewRating),
      comment: formData.reviewComment.trim(),
      createdAt: new Date().toISOString(),
      verified: false,
    };

    const reviews = getReviews();
    reviews.unshift(review);
    saveReviews(reviews);
    renderRatingSummary();
    renderReviews();
    reviewForm.reset();
    reviewRatingInput.value = "0";
    setupStarInteraction();
    ui.showToast("تم إضافة تقييمك بنجاح", "success");
  }

  function initializeReviews() {
    if (!reviewForm) return;

    setupStarInteraction();
    renderRatingSummary();
    renderReviews();

    reviewForm.addEventListener("submit", submitReview);

    if (toggleReviewsBtn) {
      toggleReviewsBtn.addEventListener("click", () => {
        expanded = !expanded;
        renderReviews();
      });
    }
  }

  window.reviews = {
    calculateAverageRating,
    renderReviews,
    renderRatingSummary,
    submitReview,
    initializeReviews,
  };
})();
