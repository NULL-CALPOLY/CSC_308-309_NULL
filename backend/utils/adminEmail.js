// Master/site administrators are configured via the ADMIN_EMAILS env var
// (comma-separated). Falls back to the default admin if the env var is unset.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || 'vishnualachi@gmail.com')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/**
 * Returns true if the given email is configured as a site administrator.
 * @param {string} email
 * @returns {boolean}
 */
export function isAdminEmail(email) {
  if (!email || typeof email !== 'string') return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export default isAdminEmail;
