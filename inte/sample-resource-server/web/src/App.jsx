import { ports } from 'fansjs';
import { App, Auth } from 'fansjs/ui';

export default function() {
  return (
    <App auth={`http://localhost:${ports.auth_web}/login`}>
      {[
        {name: 'home', comp: <Home/>, path: '/'},
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
