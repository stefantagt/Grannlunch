const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidName(value: string): boolean {
  const name = value.trim();
  return name.length >= 2 && name.length <= 80;
}

export function isValidEmail(value: string): boolean {
  const email = value.trim();
  return email.length <= 254 && EMAIL_PATTERN.test(email);
}

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
