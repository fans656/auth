import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';
import * as jose from 'jose';
import { Routed, Layout } from 'fansjs/ui';

import { api } from 'src/api';
import { UserContext } from 'src/contexts';
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
  const user = useUser();
  return (
    <UserContext.Provider value={user}>
      {user.refreshed ? <Routed>{pages}</Routed> : null}
    </UserContext.Provider>
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

function useUser() {
  const [data, set_data] = useState();
  
  const refresh = useCallback(() => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const data = jose.decodeJwt(token);
        set_data({username: data.user, refreshed: true});
      } catch (e) {
        console.error('user.refresh exception', e);
        set_data({username: undefined, refreshed: true});
      }
    } else {
      set_data({username: undefined, refreshed: true});
    }
  }, []);
  
  const logout = useCallback(() => {
    Cookies.remove('token');
    refresh();
  }, [refresh]);

  useEffect(() => {
    refresh();
  }, []);

  const user = useMemo(() => {
    return {...data, refresh, logout};
  }, [data, refresh, logout]);
  
  return user;
}
