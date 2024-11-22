import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Form, Button, Auth, message } from 'fansjs/ui';

import { api } from 'src/api';

export function Home() {
  const user = Auth.useUser();
  if (user.username) {
    return <Page/>;
  } else {
    return <Auth.Login style={{paddingTop: '2em'}}/>;
  }
}

function Page() {
  return (
    <div className="flex-1">
      home
    </div>
  );
}
