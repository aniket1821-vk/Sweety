# Sweety – Testing Summary

## Manual Functional Testing

The following application workflows were manually tested during development.

### Authentication
- User registration and login.
- Password hashing using bcrypt.
- Access to protected APIs with JWT authentication.
- Rejection of requests without authentication.

### Glucose Readings
- Add, view, edit and delete glucose readings.
- Accept valid glucose values between 40 and 600 mg/dL.
- Reject missing, decimal and out-of-range values.
- Prevent duplicate readings for the same date and slot.
- Prevent future-dated readings.
- Enforce a maximum of four readings per day.

### Reports
- Daily report calculations.
- Month-to-date report calculations.
- Previous calendar month's report.
- Highest, lowest, average and total reading calculations.
- Empty-state handling when no readings exist.

### Data Security
- Verified that users can access only their own readings.
- Verified that one user's reading cannot be accessed by another user.

## Build and Code Quality Checks

- Frontend ESLint check: `npm run lint` – passed.
- Frontend production build: `npm run build` – passed.
- Backend dependency audit: `npm audit` – no reported vulnerabilities.

**Note:** Functional workflows were tested manually. An automated unit and integration test suite has not yet been implemented.