import React, { useEffect, useState } from 'react'

import { api } from 'src/api';

export function Users() {
  // TODO: api.useGet
  const [users, set_users] = useState();
  useEffect(() => {
    (async () => {
      const res = await api.get('/api/users');
      set_users(res.users);
    })();
  }, []);
  return users ? (
    <div>
      {users.map(d => (
        <div key={d.username}>
          {JSON.stringify(d)}
        </div>
      ))}
    </div>
  ) : null;
}
