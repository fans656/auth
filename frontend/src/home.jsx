import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Form, Button, message } from 'fansjs/ui';

import { api } from 'src/api';
import { UserContext } from 'src/contexts';

export function Home() {
  const user = React.useContext(UserContext);
  if (user.username) {
    return <Profile user={user}/>;
  } else {
    return <Login user={user}/>;
  }
}

function Profile({user}) {
  return (
    <div className="vert margin">
      <h3>Profile</h3>
      <p>User: {user.username}</p>
      <Button
        onClick={user.logout}
      >
        Log out
      </Button>
    </div>
  );
}

function Login({user}) {
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
            user.refresh();
            break;
          case 400:
            message.error((await res.json()).detail);
            break;
          case 422:
            message.error('Invalid input');
            break;
          default:
            message.error('Unknown error');
            console.log(res);
            break;
        }
      }}
      style={{width: '30em', marginTop: '5em', marginRight: '10em'}}
    />
  );
}
