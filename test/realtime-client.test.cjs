const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRealtimeClient } = require('../services/realtime/client');

class Socket {
  static instances = [];
  constructor(url) {
    this.url = url;
    this.readyState = 1;
    this.sent = [];
    Socket.instances.push(this);
  }
  send(data) { this.sent.push(JSON.parse(data)); }
  close() { this.readyState = 3; this.onclose?.(); }
  async receive(event, data, channel) {
    await this.onmessage({ data: JSON.stringify({ event, data: JSON.stringify(data), channel }) });
  }
}

test('all three targets use the same websocket transport', () => {
  const source = fs.readFileSync(path.join(__dirname, '../services/realtime/client.js'));
  assert.deepEqual(source, fs.readFileSync(path.join(__dirname, '../../loop-technician-mobile/services/realtime/client.js')));
  assert.deepEqual(source, fs.readFileSync(path.join(__dirname, '../../backend-laravel/public/assets/js/loop-realtime.js')));
});

test('private subscription is signed and only subscribed events reach the screen', async () => {
  const events = [];
  const requests = [];
  const client = createRealtimeClient({
    WebSocket: Socket,
    config: async () => ({ enabled: true, key: 'public-key', host: 'localhost', port: 8080, scheme: 'ws', channels: ['private-users.7'] }),
    authUrl: 'https://example.test/api/realtime/auth',
    headers: () => ({ Authorization: 'Bearer private-token' }),
    fetch: async (url, options) => {
      requests.push({ url, options });
      return { ok: true, json: async () => ({ auth: 'signed-channel' }) };
    },
    onEvent: (event) => events.push(event),
  });
  client.start();
  await new Promise(setImmediate);
  const socket = Socket.instances.at(-1);
  assert.ok(!socket.url.includes('private-token'));
  await socket.receive('pusher:connection_established', { socket_id: '1.2', activity_timeout: 30 });
  assert.deepEqual(JSON.parse(requests[0].options.body), { socket_id: '1.2', channel_name: 'private-users.7' });
  assert.equal(requests[0].options.headers.Authorization, 'Bearer private-token');
  assert.deepEqual(socket.sent[0], { event: 'pusher:subscribe', data: { channel: 'private-users.7', auth: 'signed-channel' } });
  await socket.receive('data.changed', { topics: ['orders'] }, 'private-users.7');
  assert.equal(events.length, 0);
  await socket.receive('pusher_internal:subscription_succeeded', {}, 'private-users.7');
  await socket.receive('data.changed', { topics: ['orders'] }, 'private-users.8');
  assert.equal(events.length, 1);
  await socket.receive('data.changed', { topics: ['wallet'] }, 'private-users.7');
  assert.deepEqual(events.at(-1), { topics: ['wallet'] });
  await socket.receive('pusher:ping', {});
  assert.equal(socket.sent.at(-1).event, 'pusher:pong');
  client.stop();
  await socket.receive('data.changed', { topics: ['orders'] }, 'private-users.7');
  assert.equal(events.length, 2);
  assert.equal(requests.length, 1);
});

test('a disabled service opens no socket and sends no data requests', async () => {
  const count = Socket.instances.length;
  const client = createRealtimeClient({
    WebSocket: Socket,
    config: async () => ({ enabled: false }),
    fetch: () => { throw new Error('Unexpected HTTP request'); },
  });
  client.start();
  await new Promise(setImmediate);
  assert.equal(Socket.instances.length, count);
  client.stop();
});

test('resuming creates a fresh signed subscription and ignores the old connection', async () => {
  const requests = [];
  const events = [];
  const client = createRealtimeClient({
    WebSocket: Socket,
    config: async () => ({ enabled: true, key: 'public', host: 'localhost', port: 8080, scheme: 'ws', channels: ['private-users.7'] }),
    authUrl: 'https://example.test/api/realtime/auth',
    fetch: async (url, options) => {
      requests.push(JSON.parse(options.body));
      return { ok: true, json: async () => ({ auth: 'signature' }) };
    },
    onEvent: (event) => events.push(event),
  });
  try {
    client.start();
    await new Promise(setImmediate);
    const first = Socket.instances.at(-1);
    await first.receive('pusher:connection_established', { socket_id: '1.2' });
    await first.receive('pusher_internal:subscription_succeeded', {}, 'private-users.7');
    client.stop();
    client.start();
    await new Promise(setImmediate);
    const second = Socket.instances.at(-1);
    assert.notEqual(first, second);
    await second.receive('pusher:connection_established', { socket_id: '3.4' });
    await second.receive('pusher_internal:subscription_succeeded', {}, 'private-users.7');
    await first.receive('data.changed', { topics: ['wallet'] }, 'private-users.7');
    assert.deepEqual(requests.map((request) => request.socket_id), ['1.2', '3.4']);
    assert.deepEqual(events, [{ topics: ['*'], reconnect: true }, { topics: ['*'], reconnect: true }]);
  } finally { client.stop(); }
});
