import { isStudentEmail } from '../../../backend/utils/studentEmail.js';

describe('isStudentEmail', () => {
  test('accepts a @calpoly.edu address', () => {
    expect(isStudentEmail('jdoe@calpoly.edu')).toBe(true);
  });

  test('accepts a subdomain of calpoly.edu', () => {
    expect(isStudentEmail('jdoe@mail.calpoly.edu')).toBe(true);
  });

  test('is case-insensitive', () => {
    expect(isStudentEmail('JDOE@CalPoly.EDU')).toBe(true);
  });

  test('rejects a non-student domain', () => {
    expect(isStudentEmail('jdoe@gmail.com')).toBe(false);
  });

  test('rejects a lookalike domain', () => {
    expect(isStudentEmail('jdoe@notcalpoly.edu')).toBe(false);
  });

  test('handles empty / malformed input', () => {
    expect(isStudentEmail('')).toBe(false);
    expect(isStudentEmail(null)).toBe(false);
    expect(isStudentEmail('no-at-sign')).toBe(false);
  });
});
