import React, { useState, useMemo, useEffect, useCallback } from 'react'
import { Form, Button, Auth, message } from 'fansjs/ui';

import { api } from 'src/api';

export function Home() {
  const user = Auth.useUser();
  if (user.username) {
    return (
      <div>
        <h3>Profile</h3>
        <Auth.Profile/>
      </div>
    );
  } else {
    return (
      <div>
        <h3>Login</h3>
        <Auth.Login/>
      </div>
    );
  }
}
