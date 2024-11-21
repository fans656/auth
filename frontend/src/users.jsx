import React, { useEffect, useState, useMemo } from 'react'
import moment from 'moment';
import { Table, Button, Action, message } from 'fansjs/ui';

import { api } from 'src/api';

export function Users() {
  const {res, controller} = api.useGetController('/api/users');
  const userCols = useUserCols({controller});
  return (
    <div className="vert margin">
      <Table
        data={res && res.users}
        cols={userCols}
      />
      <Action
        action={{
          name: 'Create',
          type: 'edit',
          done: (user) => doCreateUser(user, {controller}),
        }}
        data={makeCreateUserTemplate}
      />
    </div>
  );
}

async function doCreateUser(user, {controller}) {
  await api.post('/api/create-user', {
    username: user.username,
    password: user.password,
    meta: user.meta,
    extra: user.extra,
  });
  controller.refresh();
}

function makeCreateUserTemplate() {
  return {
    username: 'guest',
    password: 'guest',
    meta: {},
    extra: {},
  };
}

function useUserCols({controller}) {
  return useMemo(() => {
    return [
      {name: 'username'},
      {name: 'admin', render: d => d.meta.admin ? 'Yes' : null},
      {name: 'meta', render: d => JSON.stringify(d.meta)},
      {name: 'extra', render: d => JSON.stringify(d.extra)},
      {name: 'created', render: d => moment(d.ctime * 1000).format('YYYY-MM-DD hh:mm:ss')},
      {name: 'actions', actions: [
        {
          name: 'edit',
          type: 'edit',
          pre: user => {
            return {meta: user.meta, extra: user.extra};
          },
          done: async (edited, user) => {
            await api.post('/api/edit-user', {
              username: user.username,
              extra: edited.extra,
              meta: edited.meta,
            });
            message.success('Edited');
            controller.refresh();
          },
        },
        {
          name: 'more',
          actions: [
            {
              name: 'change password',
              done: (user) => {
                console.log('change password', user);
              },
            },
            {
              name: 'delete user',
              danger: true,
              done: async (user) => {
                await api.post('/api/delete-user', {username: user.username});
                message.success('Deleted');
                controller.refresh();
              },
            },
          ],
        },
      ]},
    ];
  }, [controller]);
}
