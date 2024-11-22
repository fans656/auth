import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';
import * as jose from 'jose';
import { Routed, Layout, Auth } from 'fansjs/ui';

import { api } from 'src/api';
import { Home } from 'src/home';
import { Users } from 'src/users';

const pages = [
  {
    path: '/',
    comp: <Page><Home/></Page>,
  },
  {
    path: '/users',
    comp: <Page><Users/></Page>,
  },
  {
    path: '*',
    comp: <Page><NotFound/></Page>,
  },
];

export default function App() {
  return (
    <Auth>
      <Routed>{pages}</Routed>
    </Auth>
  );
}

function Page({children}) {
  return (
    <Layout>
      <Layout.Header
        links={[
          {label: 'Home', path: '/'},
          {label: 'Users', path: '/users'},
        ]}
        auth={true}
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
