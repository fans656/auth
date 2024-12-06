import { test, expect } from '@playwright/test';
import { ports } from 'fansjs';
import inte from '@fans656/inte';

import { login } from './common';

inte.setup({origin: `http://localhost:${ports.auth_res_web}`, expect, test});

test.describe('res-server-login', () => {
  test('redirection login works', async ({page}) => {
    await inte(page, '/');

    await inte.click('#goto-login', {follow: true});

    await login.verifyUI(inte);
    await login.fill(inte, 'admin', 'admin');
    await login.login(inte);
    await login.success(inte, 'admin');
  });
});
