import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { ddb } from '../lib/dynamo.js';
import { generateId } from '../lib/idgen.js';

const TABLE = 'minecon_users';
const router = Router();

async function findByEmail(email) {
  const result = await ddb.send(new QueryCommand({
    TableName: TABLE,
    IndexName: 'email-index',
    KeyConditionExpression: 'email = :e',
    ExpressionAttributeValues: { ':e': email.toLowerCase() },
    Limit: 1,
  }));
  return result.Items?.[0] ?? null;
}

function sanitize(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

// POST /api/auth/signup  — attendee account creation with password
router.post('/signup', async (req, res) => {
  try {
    const { full_name, email, password, company } = req.body;
    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    const existing = await findByEmail(email);
    if (existing) return res.status(409).json({ error: 'An account with that email already exists.' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = {
      id: generateId(),
      created_date: new Date().toISOString(),
      full_name,
      email: email.toLowerCase(),
      company: company || '',
      role: 'attendee',
      status: 'active',
      password_hash,
    };
    await ddb.send(new PutCommand({ TableName: TABLE, Item: user }));
    res.status(201).json(sanitize(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login  — validates password for attendees; skips check for internal roles
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required.' });

    const user = await findByEmail(email);
    if (!user) return res.status(401).json({ error: 'No account found with that email.' });

    if (user.role === 'attendee') {
      if (!user.password_hash) {
        return res.status(401).json({ error: 'This account has no password set. Please sign up again.' });
      }
      const match = await bcrypt.compare(password || '', user.password_hash);
      if (!match) return res.status(401).json({ error: 'Incorrect password.' });
    }

    res.json(sanitize(user));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
