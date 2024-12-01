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
  test('can show login form', async ({page}) => {
    await inte.verify(page, '/', async ({elem}) => {
      await elem('#username', {'type': 'input'});
      await elem('#password', {'type': 'input'});
      await elem('#login', {'type': 'button'});
    });
  });
});
