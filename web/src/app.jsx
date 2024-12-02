import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';
import * as jose from 'jose';
import qs from 'qs';
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
    path: '/login',
    comp: <Login/>,
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
          {label: 'Users', path: '/users', admin: true},
        ]}
        auth="/"
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
  const query = Routed.useQuery();
  let redirect_uri;
  try {
    redirect_uri = new URL(query.redirect_uri);
  } catch (exc) {
    return (
      <div>
        Invalid redirect URI: {query.redirect_uri}
      </div>
    );
  }
  const name = redirect_uri.host;
  return (
    <Layout.Content center>
      <div className="vert margin">
        <h3>Login to <a href={redirect_uri.origin} target="_blank">{name}</a></h3>
        <Auth.Login
          req={{
            response_type: 'grant',
            // redirect_uri: redirect_uri.href,
          }}
          done={async ({res}) => {
            const data = await res.json();
            const params = qs.stringify({
              ...qs.parse(redirect_uri.search.substring(1)),
              'grant': data.grant,
              'auth_server': window.location.origin,
            });
            const url = `${redirect_uri.origin}${redirect_uri.pathname}?${params}`;
            window.location.href = url;
          }}
        />
      </div>
    </Layout.Content>
  );
}
