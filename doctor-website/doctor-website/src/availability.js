const config = require('./config');

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function toHHMM(totalMinutes) {
  const h = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const m = String(totalMinutes % 60).padStart(2, '0');
  return `${h}:${m}`;
}

function isWorkingDay(dateStr) {
  const day = new Date(`${dateStr}T00:00:00`).getUTCDay();
  return config.WORKING_DAYS.includes(day);
}

// Generate every possible slot for a working day, before removing booked ones.
function generateDaySlots() {
  const start = toMinutes(config.WORKING_HOURS.start);
  const end = toMinutes(config.WORKING_HOURS.end);
  const breakStart = toMinutes(config.BREAK.start);
  const breakEnd = toMinutes(config.BREAK.end);
  const duration = config.APPOINTMENT_DURATION_MINUTES;

  const slots = [];
  for (let t = start; t + duration <= end; t += duration) {
    const withinBreak = t >= breakStart && t < breakEnd;
    if (!withinBreak) slots.push(toHHMM(t));
  }
  return slots;
}

function isValidSlotTime(time) {
  return generateDaySlots().includes(time);
}

/**
 * Returns available slots for a given date, after removing already-booked
 * (non-cancelled) appointments. This is the authoritative check — the
 * client-side calendar is only a convenience UI.
 */
function getAvailableSlots(dateStr, bookedTimes) {
  if (!isWorkingDay(dateStr)) return [];
  const allSlots = generateDaySlots();
  const booked = new Set(bookedTimes);
  return allSlots.filter((slot) => !booked.has(slot));
}

module.exports = { isWorkingDay, generateDaySlots, isValidSlotTime, getAvailableSlots };
