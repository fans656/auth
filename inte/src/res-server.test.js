import * as playwright from '@playwright/test';
import { test } from '@playwright/test';
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
  origin: `http://localhost:${ports.auth_res_web}`,
});

test.describe('res-server-login', () => {
  test('simple', async ({page}) => {
    // page = await inte(page, '/');
    // await page.click('#goto-login', async (newPage) => {
    //   await newPage.waitForLoadState();
    //   await verifyLoginForm(inte, newPage);
    //   await fillUsernameAndPassword(newPage, 'admin', 'admin');
    //   await clickLogin(newPage);
    //   await verifySuccess(inte, newPage, 'Logged in', 'admin');
    // });

    await inte.verify(page, '/', async () => {
      page.context().on('page', async (page) => {
        await page.waitForLoadState();
        await verifyLoginForm(inte, page);
        await fillUsernameAndPassword(page, 'admin', 'admin');
        await clickLogin(page);
        await verifySuccess(inte, page, 'Logged in', 'admin');
      });

      await page.click('#goto-login');
      await page.waitForTimeout(5000);
    });
  });
});
