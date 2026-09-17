/**
 * UK phone number validation utilities.
 */

export function isValidUKMobile(phone: string): boolean {
  if (!phone) return false;
  const cleaned = phone.replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
  return /^07\d{9}$/.test(cleaned);
}

export function getPhoneError(phone: string): string | null {
  if (!phone || phone.trim().length === 0) return 'Phone number is required';
  if (!isValidUKMobile(phone)) return 'Please enter a valid UK mobile number';
  return null;
}

export function normaliseUKPhone(phone: string): string {
  return phone.replace(/\s+/g, '').replace(/^(\+44|0044)/, '0');
}

export function captureClientMeta(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform || 'unknown',
    screenWidth: String(screen.width),
    screenHeight: String(screen.height),
    referrer: document.referrer || 'direct',
  };
}
