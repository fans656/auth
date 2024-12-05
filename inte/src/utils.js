import { expect } from '@playwright/test';

export async function verifyLoginForm(inte, page) {
  await inte.verify(page, async ({elem}) => {
    await elem('#username', {'type': 'input'});
    await elem('#password', {'type': 'input'});
    await elem('#login', {'type': 'button'});
  });
}

export async function fillUsernameAndPassword(page, username, password) {
  if (username) {
    await page.fill('input[id="username"]', username);
  }
  if (password) {
    await page.fill('input[id="password"]', password);
  }
}

export async function clickLogin(page) {
  await page.click('#login');
}

export async function verifySuccess(inte, page, text, username) {
  // login success message
  // await verifyAntMessage(page, '.ant-message-success', text);
  
  // username in page
  await inte.verify(page, '.header .username', {text: username});
}

export async function verifyError(page, text) {
  await verifyAntMessage(page, '.ant-message-error', text);
}

async function verifyAntMessage(page, selector, text) {
  const error = page.locator(selector);
  await error.waitFor();
  expect(await error.textContent()).toBe(text);
  await error.waitFor({state: 'hidden'});
}
