import test from 'node:test';
import assert from 'node:assert/strict';
import { submitNewsletter } from '../lib/newsletter-submission.ts';

const fields = { firstName: 'Reader', lastName: 'Example', email: 'reader@example.com' };
const request = (data = fields, origin = 'https://homeandschool.co.za') => new Request('https://homeandschool.co.za/api/newsletter', { method: 'POST', headers: { origin }, body: JSON.stringify(data) });
const form = (response = '', classes = '') => `<form data-id="3792" class="mb4wp-form ${classes}"><input name="_mb4wp_timestamp" value="1700000000"><input name="_mb4wp_form_id" value="3792"><input name="_mb4wp_form_element_id" value="mb4wp-form-1"><div class="mb4wp-response">${response}</div></form>`;
const noNetwork = async () => { throw Error('Should not contact CMS'); };

test('uses CMS form fields without overriding mailing lists and preserves opt-in message', async () => {
  let calls = 0;
  const response = await submitNewsletter(request(), { fetchImpl: async (url, options) => {
    assert.equal(String(url), 'https://cms.homeandschool.co.za/');
    if (++calls === 1) return new Response(form());
    const body = new URLSearchParams(options.body);
    assert.equal(body.get('NAME'), fields.firstName);
    assert.equal(body.get('LNAME'), fields.lastName);
    assert.equal(body.get('EMAIL'), fields.email);
    assert.equal(body.get('_mb4wp_form_id'), '3792');
    assert.equal(body.get('_mb4wp_form_element_id'), 'mb4wp-form-1');
    assert.equal(body.get('_mb4wp_timestamp'), '1700000000');
    assert.equal(body.has('_mb4wp_lists'), false);
    assert.equal(options.redirect, 'manual');
    return new Response(form('<div class="mb4wp-alert mb4wp-success"><p>Check your inbox to confirm.</p></div>', 'mb4wp-form-success'), { headers: { 'set-cookie': 'private=value' } });
  } });
  assert.equal(calls, 2);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { submitted: true, message: 'Check your inbox to confirm.' });
  assert.equal(response.headers.has('set-cookie'), false);
});

test('rejects invalid, oversized, cross-origin and honeypot submissions before contacting CMS', async () => {
  for (const data of [{ ...fields, email: 'bad' }, { ...fields, company: 'spam' }, null, [], { ...fields, firstName: 'x'.repeat(101) }])
    assert.equal((await submitNewsletter(request(data), { fetchImpl: noNetwork })).status, 400);
  assert.equal((await submitNewsletter(request(fields, 'https://other.example'), { fetchImpl: noNetwork })).status, 403);
  assert.equal((await submitNewsletter(request({ ...fields, firstName: 'x'.repeat(5000) }), { fetchImpl: noNetwork })).status, 413);
});

test('never treats a generic 200, plugin error, unrelated form or redirect as success', async () => {
  for (const result of [new Response('<p>Thank you</p>'), new Response(form('<div class="mb4wp-error">Error</div>')), new Response(form('<div class="mb4wp-success">OK</div>', 'mb4wp-form-success').replace('data-id="3792"', 'data-id="99"')), new Response(null, { status: 302, headers: { location: '/thank-you' } })]) {
    let calls = 0;
    const response = await submitNewsletter(request(), { fetchImpl: async () => ++calls === 1 ? new Response(form()) : result });
    assert.equal(response.status, 502);
    assert.equal((await response.json()).submitted, undefined);
  }
});

test('does not post when the form is unavailable or requires interactive CAPTCHA', async () => {
  for (const html of ['maintenance', form('<div class="g-recaptcha"></div>')]) {
    let calls = 0;
    const response = await submitNewsletter(request(), { fetchImpl: async () => { calls++; return new Response(html); } });
    assert.equal(response.status, 502);
    assert.equal(calls, 1);
  }
});

test('honors the native timing check before posting', async () => {
  let calls = 0;
  let waited = false;
  const response = await submitNewsletter(request(), {
    wait: async ms => { assert.ok(ms > 0 && ms <= 5000); waited = true; },
    fetchImpl: async () => {
      if (++calls === 1) return new Response(form().replace('1700000000', String(Math.floor(Date.now() / 1000))));
      assert.equal(waited, true);
      return new Response(form('<div class="mb4wp-success">Subscribed.</div>', 'mb4wp-form-success'));
    },
  });
  assert.equal(response.status, 200);
});
