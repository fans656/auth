import React, { useEffect, useState } from 'react'
import moment from 'moment';
import { Table, Button } from 'fansjs/ui';

import { api } from 'src/api';

export function Users() {
  const {users} = api.useGet('/api/users') || {};
  return (
    <div className="vert margin">
      <Table
        data={users}
        cols={userCols}
      />
      <Button
        onClick={() => {
          console.log('create user');
        }}
      >
        Create
      </Button>
    </div>
  );
}

const userCols = [
  {label: 'Username', name: 'username'},
  {label: 'Admin', render: d => d.meta.admin ? 'Yes' : null},
  {label: 'Meta', render: d => JSON.stringify(d.meta)},
  {label: 'Extra', render: d => JSON.stringify(d.extra)},
  {label: 'Created', render: d => moment(d.ctime * 1000).format('YYYY-MM-DD hh:mm:ss')},
  {label: 'Action', render: () => {
    return (
      <div className="horz xs-margin">
        <a
          onClick={() => {
          }}
        >
          Edit
        </a>
        <a>
          Delete
        </a>
      </div>
    );
  }},
];
