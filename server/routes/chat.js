import { Router } from 'express';
import { BedrockAgentRuntimeClient, InvokeAgentCommand } from '@aws-sdk/client-bedrock-agent-runtime';

const router = Router();

const bedrockAgent = new BedrockAgentRuntimeClient({ region: 'us-east-1' });

const AGENT_ID    = '6KLVWZQPR7';
const AGENT_ALIAS = 'ZILSAKMPPL';

router.post('/', async (req, res) => {
  try {
    const { message, sessionId, userName, userEmail, userRole, userCompany } = req.body;
    if (!message || !sessionId) {
      return res.status(400).json({ error: 'message and sessionId required' });
    }

    const sessionAttributes = {};
    if (userName)    sessionAttributes.userName    = userName;
    if (userEmail)   sessionAttributes.userEmail   = userEmail;
    if (userRole)    sessionAttributes.userRole    = userRole;
    if (userCompany) sessionAttributes.userCompany = userCompany;

    const response = await bedrockAgent.send(new InvokeAgentCommand({
      agentId:      AGENT_ID,
      agentAliasId: AGENT_ALIAS,
      sessionId,
      inputText:    message,
      ...(Object.keys(sessionAttributes).length > 0 && {
        sessionState: { sessionAttributes },
      }),
    }));

    let text = '';
    for await (const event of response.completion) {
      if (event.chunk?.bytes) {
        text += new TextDecoder().decode(event.chunk.bytes);
      }
    }

    res.json({ content: text });
  } catch (e) {
    console.error('Chat error:', e);
    res.status(500).json({ error: e.message });
  }
});

export default router;
