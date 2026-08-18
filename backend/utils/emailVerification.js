// Production always requires verified email. Development and test may opt out
// explicitly so local work does not depend on an SMTP service.
export function isEmailVerificationRequired() {
  if (process.env.NODE_ENV === 'production') return true;
  return process.env.EMAIL_VERIFICATION_REQUIRED !== 'false';
}
