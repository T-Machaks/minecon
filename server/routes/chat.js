import { Router } from 'express';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
import { ddb } from '../lib/dynamo.js';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';

const router = Router();

const bedrock = new BedrockRuntimeClient({ region: 'us-east-1' });

const SYSTEM = `You are the official AI assistant for MineCon 2026 — Southern Africa's premier B2B Mining & Construction Exhibition.

Event details:
- Dates: October 14–16, 2026
- Venue: Artfarm Grounds, Pomona, Harare, Zimbabwe

Exhibition zones:
- Main Hall — Diamond tier exhibitors
- Exhibition Hall — Gold tier exhibitors
- Suppliers Zone — Chrome tier exhibitors
- Solutions Zone — Copper tier exhibitors

You help attendees, exhibitors, and organizers with event information, finding exhibitors, booking meetings, sending enquiries, and general FAQs. Be helpful, friendly, and concise.`;

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    if (!Array.isArray(messages) || !messages.length) {
      return res.status(400).json({ error: 'messages array required' });
    }

    // Fetch live exhibitor directory
    const scan = await ddb.send(new ScanCommand({ TableName: 'minecon_exhibitors' }));
    const directory = (scan.Items || [])
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
      .map(e => `- ${e.name} | ${e.tier} tier | Booth ${e.booth} | ${e.section} | ${e.category} | ${e.description}`)
      .join('\n');

    // Convert messages to Bedrock Converse format
    const bedrockMessages = messages.map(m => ({
      role: m.role,
      content: [{ text: typeof m.content === 'string' ? m.content : m.content }],
    }));

    const response = await bedrock.send(new ConverseCommand({
      modelId: 'amazon.nova-lite-v1:0',
      system: [{ text: `${SYSTEM}\n\nCurrent exhibitor directory:\n${directory}` }],
      messages: bedrockMessages,
      inferenceConfig: {
        maxTokens: 1024,
        temperature: 0.7,
      },
    }));

    const content = response.output.message.content[0].text;
    res.json({ content });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
