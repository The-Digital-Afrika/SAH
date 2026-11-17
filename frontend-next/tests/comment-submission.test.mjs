import test from 'node:test';
import assert from 'node:assert/strict';
import { submitComment } from '../lib/comment-submission.ts';

const values = { postId: 123, comment: 'A useful article.', name: 'Test reader', email: 'reader@example.com', website: '' };
const request = (body = values, origin = 'https://homeandschool.co.za') => new Request('https://homeandschool.co.za/api/comments', {
  method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const noNetwork = async () => { throw new Error('Invalid submissions must not contact WordPress'); };

test('forwards native WordPress comment fields and returns only a confirmation', async () => {
  const response = await submitComment(request(), { fetchImpl: async (url, options) => {
    assert.equal(String(url), 'https://cms.homeandschool.co.za/wp-comments-post.php');
    assert.equal(options.redirect, 'manual');
    const form = new URLSearchParams(options.body);
    assert.equal(form.get('comment_post_ID'), '123');
    assert.equal(form.get('email'), values.email);
    assert.equal(form.get('author'), values.name);
    assert.equal(form.get('comment'), values.comment);
    assert.equal(form.has('status'), false);
    return new Response(null, { status: 302, headers: { location: 'https://cms.homeandschool.co.za/#comment-456', 'set-cookie': 'private=value' } });
  } });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { submitted: true });
  assert.equal(response.headers.has('set-cookie'), false);
});

test('rejects cross-origin submissions without contacting WordPress', async () => {
  assert.equal((await submitComment(request(values, 'https://unrelated.example'), { fetchImpl: noNetwork })).status, 403);
});

test('accepts the configured public origin behind an internal reverse proxy', async () => {
  const proxied = new Request('http://localhost:3000/api/comments', {
    method: 'POST', headers: { origin: 'https://homeandschool.co.za' }, body: JSON.stringify(values),
  });
  const response = await submitComment(proxied, { siteOrigin: 'https://homeandschool.co.za', fetchImpl: async () =>
    new Response(null, { status: 302, headers: { location: 'https://cms.homeandschool.co.za/#comment-456' } }) });
  assert.equal(response.status, 200);
});

test('rejects invalid fields, script URLs and honeypot submissions', async () => {
  for (const body of [{ ...values, postId: -1 }, { ...values, comment: ' ' }, { ...values, email: 'invalid' }, { ...values, website: 'javascript:alert(1)' }, { ...values, company: 'bot' }]) {
    assert.equal((await submitComment(request(body), { fetchImpl: noNetwork })).status, 400);
  }
});

test('does not report success when WordPress redirects to a login page', async () => {
  const result = await submitComment(request(), { fetchImpl: async () => new Response(null, { status: 302, headers: { location: 'https://cms.homeandschool.co.za/wp-login.php' } }) });
  assert.equal(result.status, 502);
});

test('preserves duplicate and flood errors without retrying', async () => {
  for (const status of [409, 429]) {
    let calls = 0;
    const result = await submitComment(request(), { fetchImpl: async () => { calls++; return new Response('Duplicate or too fast', { status }); } });
    assert.equal(result.status, status);
    assert.equal(calls, 1);
  }
});

test('handles network failure without showing a success message', async () => {
  const result = await submitComment(request(), { fetchImpl: async () => { throw new Error('offline'); } });
  assert.equal(result.status, 502);
  assert.equal((await result.json()).submitted, undefined);
});
