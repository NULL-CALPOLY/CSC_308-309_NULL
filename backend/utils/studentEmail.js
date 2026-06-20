// Recognized student email domain(s). Defaults to Cal Poly; override with the
// STUDENT_EMAIL_DOMAINS env var (comma-separated) to support more schools.
const STUDENT_DOMAINS = (process.env.STUDENT_EMAIL_DOMAINS || 'calpoly.edu')
  .split(',')
  .map((d) => d.trim().toLowerCase())
  .filter(Boolean);

/**
 * Returns true if the given email belongs to a recognized student domain.
 * @param {string} email
 * @returns {boolean}
 */
export function isStudentEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const domain = email.trim().toLowerCase().split('@')[1];
  if (!domain) return false;
  // Match the domain or any subdomain (e.g. mail.calpoly.edu).
  return STUDENT_DOMAINS.some(
    (d) => domain === d || domain.endsWith(`.${d}`)
  );
}

export default isStudentEmail;
