const BASE = process.env.OMNIFLEX_API_URL || 'https://omniflex.co.zw';
const API_KEY = process.env.OMNIFLEX_API_KEY;

// Normalize any Zim phone format to 263XXXXXXXXX
function normalizePhone(phone) {
  if (!phone) return phone;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.startsWith('263')) return digits;
  if (digits.startsWith('0')) return '263' + digits.slice(1);
  return '263' + digits;
}

async function post(path, body) {
  const r = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || data.error || `OmniFlex ${r.status}`);
  return data;
}

export async function sendSmsOtp(phone) {
  return post('/api/otp/send', { identifier: normalizePhone(phone), method: 'sms' });
}

export async function verifySmsOtp(phone, code) {
  return post('/api/otp/verify', { identifier: normalizePhone(phone), code });
}

export async function sendSms(phone, message) {
  return post('/api/sms/send', { phone: normalizePhone(phone), message });
}
