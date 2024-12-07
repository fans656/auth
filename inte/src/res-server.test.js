import { test, expect } from '@playwright/test';
import { ports } from 'fansjs';
import inte from '@fans656/inte';

import { login } from './common';

inte.setup({origin: `http://localhost:${ports.auth_res_web}`, expect, test});

test('redirection login works', async ({page}) => {
  await inte(page, '/');

  await inte.click('#goto-login', {follow: true});

  await login.verifyUI(inte);
  await login.fill(inte, 'admin', 'admin');
  await login.login(inte);
  await login.success(inte, 'admin');
});

test.describe('endpoint-protection', async () => {
  test('non-logged', async ({page}) => {
    await verifyEndpointProtection(page, 200, '/api/public');
    await verifyEndpointProtection(page, 401, '/api/private');
    await verifyEndpointProtection(page, 401, '/api/admin');
    await verifyEndpointProtection(page, 401, '/api/login_required/foo');
    await verifyEndpointProtection(page, 401, '/api/login_required/bar');
    await verifyEndpointProtection(page, 401, '/api/admin_required/foo');
    await verifyEndpointProtection(page, 401, '/api/admin_required/bar');
  });

  test('non-admin-user', async ({page}) => {
    await doLogin(page, 'guest', 'guest');
    await verifyEndpointProtection(page, 200, '/api/public');
    await verifyEndpointProtection(page, 200, '/api/private');
    await verifyEndpointProtection(page, 403, '/api/admin');
    await verifyEndpointProtection(page, 200, '/api/login_required/foo');
    await verifyEndpointProtection(page, 200, '/api/login_required/bar');
    await verifyEndpointProtection(page, 403, '/api/admin_required/foo');
    await verifyEndpointProtection(page, 403, '/api/admin_required/bar');
  });

  test('admin-user', async ({page}) => {
    await doLogin(page, 'admin', 'admin');
    await verifyEndpointProtection(page, 200, '/api/public');
    await verifyEndpointProtection(page, 200, '/api/private');
    await verifyEndpointProtection(page, 200, '/api/admin');
    await verifyEndpointProtection(page, 200, '/api/login_required/foo');
    await verifyEndpointProtection(page, 200, '/api/login_required/bar');
    await verifyEndpointProtection(page, 200, '/api/admin_required/foo');
    await verifyEndpointProtection(page, 200, '/api/admin_required/bar');
  });
});

async function doLogin(page, username, password) {
  await inte(page, '/');
  await inte.click('#goto-login', {follow: true});
  await login.fill(inte, username, password);
  await login.login(inte);
  await login.success(inte, username);
}

async function verifyEndpointProtection(page, status, endpoint) {
  await inte(page, `/query?endpoint=${endpoint}`);
  await inte.elem('.status', {text: `${status}`});
}
