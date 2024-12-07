import React, { useState, useEffect } from 'react';

import { ports } from 'fansjs';
import { App, Auth, Routed } from 'fansjs/ui';

export default function() {
  return (
    <App auth={`http://localhost:${ports.auth_web}/login`}>
      {[
        {name: 'home', comp: <Home/>, path: '/'},
        {name: 'query', comp: <Query/>, path: '/query'},
      ]}
    </App>
  );
}

function Home() {
  const user = Auth.useUser();
  return user.valid ? (
    <div>
      Welcome!
    </div>
  ) : (
    <div>
      Not logged in
    </div>
  );
}

function Query() {
  const query = Routed.useQuery();
  const endpointRef = React.useRef();
  const [status, set_status] = useState();
  useEffect(() => {
    if (endpointRef.current !== query.endpoint) {
      endpointRef.current = query.endpoint;
      (async () => {
        try {
          const res = await fetch(endpointRef.current);
          set_status(res.status);
        } catch (exc) {
          set_status(JSON.stringify(exc));
        }
      })();
    }
  }, [query.endpoint]);
  return status ? (
    <div className="status">{status}</div>
  ) : null;
}
