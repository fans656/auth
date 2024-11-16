import { useState } from 'react'

import { Routed, Layout, Form } from 'fansjs/ui';

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
      submit={async (values) => {
        console.log('submit', values);
      }}
      style={{width: '30em', marginTop: '5em', marginRight: '10em'}}
    />
  );
}
