const BASE = process.env.OMNIFLEX_API_URL || 'https://omniflex.co.zw';
const API_KEY = process.env.OMNIFLEX_API_KEY;

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
  if (!r.ok) throw new Error(data.message || `OmniFlex ${r.status}`);
  return data;
}

export async function sendSmsOtp(phone) {
  return post('/api/otp/send', { identifier: phone, method: 'sms' });
}

export async function verifySmsOtp(phone, code) {
  return post('/api/otp/verify', { identifier: phone, code });
}

export async function sendSms(phone, message) {
  return post('/api/sms/send', { to: phone, message });
}
