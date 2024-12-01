import { ports } from 'fansjs';
import { test, expect } from '@playwright/test';

test.describe.configure({mode: 'parallel'});
const origin = `http://localhost:${ports.auth_web}`;

test.describe('login', () => {
  test('show login form', async ({page}) => {
    await page.goto(`${origin}`);
  });
});
