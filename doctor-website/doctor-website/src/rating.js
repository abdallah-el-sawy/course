// Overall rating is ALWAYS derived from actual review records.
// Clients can never set a doctor's rating directly.

function calculateRating(reviews) {
  if (!reviews.length) {
    return { average: 0, count: 0 };
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);

  return {
    average: Number((total / reviews.length).toFixed(1)),
    count: reviews.length
  };
}

function calculateDistribution(reviews) {
  const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    const bucket = Math.round(r.rating);
    if (dist[bucket] !== undefined) dist[bucket]++;
  });

  const count = reviews.length || 1;
  const percentages = {};
  Object.keys(dist).forEach((star) => {
    percentages[star] = Math.round((dist[star] / count) * 100);
  });

  return percentages;
}

module.exports = { calculateRating, calculateDistribution };
