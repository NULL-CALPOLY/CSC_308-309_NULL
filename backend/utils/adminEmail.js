// Master/site administrators are configured via the ADMIN_EMAILS env var
// (comma-separated). Their accounts get isAdmin set automatically on signup and
// login, so they can approve/reject club registrations.
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '')
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
