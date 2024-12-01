import * as playwright from '@playwright/test';
import { test, expect } from '@playwright/test';
import { ports } from 'fansjs';
import { Intetest } from 'fansjs/testutil';

test.describe.configure({mode: 'parallel'});

const inte = new Intetest({
  playwright,
  origin: `http://localhost:${ports.auth_web}`,
});

test.describe('login', () => {
  test('visit home page shows login form by default', async ({page}) => {
    await inte.verify(page, '/', async () => {
      await verifyLoginForm(page);
    });
  });

  test('admin login & logout', async ({page}) => {
    await inte.verify(page, '/', async () => {
      // NOTE: the "admin" password is setup in inte/sample-data
      await fillUsernameAndPassword(page, 'admin', 'admin');
      await clickLogin(page);
      await verifySuccess(page, 'Logged in', 'admin');
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
});

async function clickLogin(page) {
  await page.click('*[id="login"]');
}

async function fillUsernameAndPassword(page, username, password) {
  if (username) {
    await page.fill('input[id="username"]', username);
  }
  if (password) {
    await page.fill('input[id="password"]', password);
  }
}

async function verifySuccess(page, text, username) {
  // login success message
  await verifyAntMessage(page, '.ant-message-success', text);
  
  // username in page
  await inte.verify(page, '.username', {text: username});
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
  
async function verifyLogout(page) {
  // click logout
  await page.click('*[id="logout"]');
  
  // login form show again
  await verifyLoginForm(page);
}

async function verifyLoginForm(page) {
  await inte.verify(page, '/', async ({elem}) => {
    await elem('#username', {'type': 'input'});
    await elem('#password', {'type': 'input'});
    await elem('#login', {'type': 'button'});
  });
}
