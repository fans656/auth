import { useState } from 'react'

import { Routed, Layout, Form, message } from 'fansjs/ui';

import { api } from 'src/api';

const pages = [
  {
    path: '/',
    comp: <Page><Login/></Page>,
  },
  {
    path: '*',
    comp: <Page><NotFound/></Page>,
  },
];

export default function App() {
  return (
    <Routed>{pages}</Routed>
  );
}

function Page({children}) {
  return (
    <Layout>
      <Layout.Header
        links={[
          {label: 'Home', path: '/'},
        ]}
      />
      <Layout.Content center>
        {children}
      </Layout.Content>
    </Layout>
  );
}

function NotFound() {
  return (
    <p>Oops! Not found</p>
  );
}

function Login() {
  return (
    <Form
      fields={[
        {name: 'username', label: 'Username', type: 'input'},
        {name: 'password', label: 'Password', type: 'password'},
        {name: 'login', label: 'Login', type: 'submit'},
      ]}
      submit={async ({username, password}) => {
        const res = await api.post('/api/login', {username, password}, {res: 'raw'});
        switch (res.status) {
          case 200:
            message.success('Login success');
            break;
          case 400:
            message.error((await res.json()).detail);
            break;
          case 422:
            message.error('Invalid input');
            break;
          default:
            message.error('Unknown error');
            break;
        }
      }}
      style={{width: '30em', marginTop: '5em', marginRight: '10em'}}
    />
  );
}
