import * as playwright from '@playwright/test';
import { test, expect } from '@playwright/test';
import { ports } from 'fansjs';
import { Intetest } from 'fansjs/testutil';

import {
  verifyLoginForm,
  fillUsernameAndPassword,
  clickLogin,
  verifySuccess,
  verifyError,
} from './utils';

test.describe.configure({mode: 'parallel'});

const inte = new Intetest({
  playwright,
  origin: `http://localhost:${ports.auth_web}`,
});

test.describe('login', () => {
  test('visit home page shows login form by default', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await verifyLoginForm(inte, page);
    });
  });

  test('admin login & logout', async ({page}) => {
    await inte.verify(page, '/', async () => {
      // NOTE: the "admin" password is setup in inte/sample-data
      await fillUsernameAndPassword(page, 'admin', 'admin');
      await clickLogin(page);
      await verifySuccess(inte, page, 'Logged in', 'admin');
      await verifyLogout(page);
    });
  });

  test('invalid input (empty username & password)', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await clickLogin(page);
      await verifyError(page, 'Invalid input');
    });
  });

  test('invalid input (username too long)', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await fillUsernameAndPassword(page, 'a'.repeat(101), 'password');
      await clickLogin(page);
      await verifyError(page, 'Invalid input');
    });
  });

  test('invalid input (password too long)', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await fillUsernameAndPassword(page, 'username', 'a'.repeat(101));
      await clickLogin(page);
      await verifyError(page, 'Invalid input');
    });
  });

  test('wrong username or password', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await fillUsernameAndPassword(page, 'asdf', 'asdf');
      await clickLogin(page);
      await verifyError(page, 'Wrong username or password');
    });
  });

  test('enter in username input triggers login', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await page.press('input[id="username"]', 'Enter');
      await verifyError(page, 'Invalid input');
    });
  });

  test('enter in password input triggers login', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await page.press('input[id="password"]', 'Enter');
      await verifyError(page, 'Invalid input');
    });
  });

  test('click login in header can show login form', async ({page}) => {
    await inte.verify(page, '/users', async () => {
      await page.click('#goto-login');
      await verifyLoginForm(inte, page);
    });
  });
});
  
async function verifyLogout(page) {
  // click logout
  await page.click('*[id="logout"]');
  
  // login form show again
  await verifyLoginForm(inte, page);
}
