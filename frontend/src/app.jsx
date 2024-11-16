import React, { useState, useMemo, useEffect, useCallback } from 'react'
import Cookies from 'js-cookie';
import * as jose from 'jose';
import { Routed, Layout, Form, Button, message } from 'fansjs/ui';

import { api } from 'src/api';

const pages = [
  {
    path: '/',
    comp: <Page><Home/></Page>,
  },
  {
    path: '*',
    comp: <Page><NotFound/></Page>,
  },
];

const UserContext = React.createContext();

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
        ]}
      />
      <Layout.Content center>
        {children}
      </Layout.Content>
    </Layout>
  );
}

function Home() {
  const user = React.useContext(UserContext);
  if (user.username) {
    return <Profile user={user}/>;
  } else {
    return <Login/>;
  }
}

function NotFound() {
  return (
    <p>Oops! Not found</p>
  );
}

function Profile({user}) {
  return (
    <div>
      <h3>Profile</h3>
      <p>User: {user.username}</p>
      <Button>Log out</Button>
    </div>
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

  useEffect(() => {
    refresh();
  }, []);

  const user = useMemo(() => {
    return {...data, refresh};
  }, [data, refresh]);
  
  return user;
}
