import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { Table, Button, Action } from 'fansjs/ui';

import { api } from 'src/api';

export function Users() {
  const {users} = api.useGet('/api/users') || {};
  return (
    <div className="vert margin">
      <Table
        data={users}
        cols={userCols}
      />
      <Action action={{
        name: 'Create',
        type: 'edit',
        done: user => {
          console.log('create user', user);
        }
      }} data={() => ({username: '<username>', meta: {}, extra: {}})}/>
    </div>
  );
}

const userCols = [
  {name: 'username'},
  {name: 'admin', render: d => d.meta.admin ? 'Yes' : null},
  {name: 'meta', render: d => JSON.stringify(d.meta)},
  {name: 'extra', render: d => JSON.stringify(d.extra)},
  {name: 'created', render: d => moment(d.ctime * 1000).format('YYYY-MM-DD hh:mm:ss')},
  {name: 'actions', actions: [
    {
      name: 'edit',
      type: 'edit',
      done: user => {
        console.log('edited user', user);
      },
    },
    {
      name: 'more',
      actions: [
        {
          name: 'delete',
          danger: true,
          done: (user) => {
            console.log('delete user', user);
          },
        },
      ],
    },
  ]},
];
