import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: 'af-south-1' }),
  { marshallOptions: { removeUndefinedValues: true } }
);

function getParams(event) {
  const out = {};
  for (const p of event.parameters || []) out[p.name] = p.value;
  return out;
}

function getBody(event) {
  const out = {};
  const props = event.requestBody?.content?.['application/json']?.properties || [];
  for (const p of props) out[p.name] = p.value;
  return out;
}

function respond(event, statusCode, data) {
  return {
    messageVersion: '1.0',
    response: {
      actionGroup: event.actionGroup,
      apiPath: event.apiPath,
      httpMethod: event.httpMethod,
      httpStatusCode: statusCode,
      responseBody: {
        'application/json': { body: JSON.stringify(data) },
      },
    },
  };
}

export const handler = async (event) => {
  console.log('Bedrock action:', JSON.stringify(event));

  const { apiPath, httpMethod } = event;
  const params = getParams(event);
  const body = getBody(event);

  try {

    // GET /api/exhibitors
    if (apiPath === '/api/exhibitors' && httpMethod === 'GET') {
      let items;

      if (params.tier || params.category) {
        const names = {}, values = {}, parts = [];
        let i = 0;
        if (params.tier)     { names[`#k${i}`] = 'tier';     values[`:v${i}`] = params.tier;     parts.push(`#k${i} = :v${i}`); i++; }
        if (params.category) { names[`#k${i}`] = 'category'; values[`:v${i}`] = params.category; parts.push(`#k${i} = :v${i}`); i++; }
        const r = await ddb.send(new ScanCommand({
          TableName: 'minecon_exhibitors',
          FilterExpression: parts.join(' AND '),
          ExpressionAttributeNames: names,
          ExpressionAttributeValues: values,
        }));
        items = r.Items || [];
      } else {
        const r = await ddb.send(new ScanCommand({ TableName: 'minecon_exhibitors' }));
        items = r.Items || [];
      }

      if (params.sortBy) {
        const f = params.sortBy;
        items.sort((a, b) => (a[f] ?? '') > (b[f] ?? '') ? 1 : -1);
      }

      return respond(event, 200, items);
    }

    // GET /api/exhibitors/{id}
    if (apiPath.startsWith('/api/exhibitors/') && httpMethod === 'GET') {
      const id = params.id || apiPath.split('/').at(-1);
      const r = await ddb.send(new GetCommand({ TableName: 'minecon_exhibitors', Key: { id } }));
      if (!r.Item) return respond(event, 404, { error: 'Exhibitor not found' });
      return respond(event, 200, r.Item);
    }

    // POST /api/meeting-requests
    if (apiPath === '/api/meeting-requests' && httpMethod === 'POST') {
      const item = {
        id: randomUUID(),
        created_date: new Date().toISOString(),
        status: 'Pending',
        ...body,
      };
      await ddb.send(new PutCommand({ TableName: 'minecon_meeting_requests', Item: item }));
      return respond(event, 201, item);
    }

    // GET /api/meeting-requests/{id}
    if (apiPath.startsWith('/api/meeting-requests/') && httpMethod === 'GET') {
      const id = params.id || apiPath.split('/').at(-1);
      const r = await ddb.send(new GetCommand({ TableName: 'minecon_meeting_requests', Key: { id } }));
      if (!r.Item) return respond(event, 404, { error: 'Meeting request not found' });
      return respond(event, 200, r.Item);
    }

    // POST /api/virtual-enquiries
    if (apiPath === '/api/virtual-enquiries' && httpMethod === 'POST') {
      const item = {
        id: randomUUID(),
        created_date: new Date().toISOString(),
        status: 'New',
        ...body,
      };
      await ddb.send(new PutCommand({ TableName: 'minecon_virtual_enquiries', Item: item }));
      return respond(event, 201, item);
    }

    // GET /api/registrations/by-email
    if (apiPath === '/api/registrations/by-email' && httpMethod === 'GET') {
      const email = (params.email || '').toLowerCase();
      if (!email) return respond(event, 400, { error: 'email is required' });
      const r = await ddb.send(new QueryCommand({
        TableName: 'minecon_registrations',
        IndexName: 'email-index',
        KeyConditionExpression: 'email = :e',
        ExpressionAttributeValues: { ':e': email },
        Limit: 1,
      }));
      const reg = r.Items?.[0] ?? null;
      if (!reg) return respond(event, 404, { error: 'Registration not found' });
      return respond(event, 200, reg);
    }

    // GET /api/announcements
    if (apiPath === '/api/announcements' && httpMethod === 'GET') {
      const r = await ddb.send(new ScanCommand({ TableName: 'minecon_announcements' }));
      const items = (r.Items || []).sort((a, b) =>
        (b.created_date ?? '') > (a.created_date ?? '') ? 1 : -1
      );
      return respond(event, 200, items);
    }

    return respond(event, 404, { error: `No handler for ${httpMethod} ${apiPath}` });

  } catch (e) {
    console.error('Lambda error:', e);
    return respond(event, 500, { error: e.message });
  }
};
