// Central, easily-editable configuration for the clinic.
// Kept separate from business logic so hours/duration can change
// without touching route or availability code.

module.exports = {
  PORT: process.env.PORT || 3000,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'demo-admin-token',

  // 0 = Sunday ... 6 = Saturday (JS Date convention)
  // Working days: Saturday - Thursday, closed Friday (day 5)
  WORKING_DAYS: [0, 1, 2, 3, 4, 6],
  CLOSED_DAYS: [5],

  WORKING_HOURS: { start: '09:00', end: '17:00' },
  BREAK: { start: '13:00', end: '14:00' },
  APPOINTMENT_DURATION_MINUTES: 30,

  MAX_COMMENT_LENGTH: 1000,
  MAX_NAME_LENGTH: 100
};
