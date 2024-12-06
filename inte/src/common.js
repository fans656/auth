export const login = {
  async verifyUI(inte) {
    await inte.elem('#username', {'type': 'input'});
    await inte.elem('#password', {'type': 'input'});
    await inte.elem('#login', {'type': 'button'});
  },
  
  async fill(inte, username, password) {
    if (username) {
      await inte.page.fill('input[id="username"]', username);
    }
    if (password) {
      await inte.page.fill('input[id="password"]', password);
    }
  },
  
  async login(inte) {
    await inte.page.click('#login');
  },
  
  async success(inte, username) {
    await inte.elem('.header .username', {text: username});
  },
};
