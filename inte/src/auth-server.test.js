import { test, expect } from '@playwright/test';
import { ports } from 'fansjs';
import inte from '@fans656/inte';

import { login } from './common';

inte.setup({origin: `http://localhost:${ports.auth_web}`, expect, test});

test.describe('login', () => {
  test('visit home page shows login form by default', async ({page}) => {
    await inte(page, '/');
    await login.verifyUI(inte);
  });

  test('admin login then logout', async ({page}) => {
    await inte(page, '/');
    await login.verifyUI(inte);
    await login.fill(inte, 'admin', 'admin');
    await login.login(inte);
    await login.success(inte, 'admin');
    await verifyLogout(inte);
  });

  test('invalid input (empty username & password)', async ({page}) => {
    await inte(page, '/');
    await login.login(inte);
    await verifyError(page, 'Invalid input');
  });

  test('invalid input (username too long)', async ({page}) => {
    await inte(page, '/');
    await login.fill(inte, 'a'.repeat(101), 'password');
    await login.login(inte);
    await verifyError(page, 'Invalid input');
  });

  test('invalid input (password too long)', async ({page}) => {
    await inte(page, '/');
    await login.fill(inte, 'username', 'a'.repeat(101));
    await login.login(inte);
    await verifyError(page, 'Invalid input');
  });

  test('wrong username or password', async ({page}) => {
    await inte(page, '/');
    await login.fill(inte, 'asdf', 'asdf');
    await login.login(inte);
    await verifyError(page, 'Wrong username or password');
  });

  test('enter in username input triggers login', async ({page}) => {
    await inte(page, '/');
    await page.press('#username', 'Enter');
    await verifyError(page, 'Invalid input');
  });

  test('enter in password input triggers login', async ({page}) => {
    await inte(page, '/');
    await page.press('#password', 'Enter');
    await verifyError(page, 'Invalid input');
  });

  test('click login in header can show login form', async ({page}) => {
    await inte(page, '/users');
    await page.click('#goto-login');
    await login.verifyUI(inte);
  });
});
  
async function verifyLogout(inte) {
  // click logout
  await inte.click('#logout');
  
  // login form show again
  await login.verifyUI(inte);
}

async function verifyError(page, text) {
  await verifyAntMessage(page, '.ant-message-error', text);
}

async function verifyAntMessage(page, selector, text) {
  const error = page.locator(selector);
  await error.waitFor();
  expect(await error.textContent()).toBe(text);
  await error.waitFor({state: 'hidden'});
}
