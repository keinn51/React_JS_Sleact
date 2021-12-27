import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { FC, useCallback } from 'react';
import { Navigate } from 'react-router';
import useSWR from 'swr';

const Workspace: FC = ({ children }) => {
  const { data, error, isValidating, mutate } = useSWR('http://localhost:3095/api/users', fetcher, {
    dedupingInterval: 100000,
  });
  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate(false, false);
      });
  }, []);

  if (!data) {
    return <Navigate to="/login" />;
  }

  return (
    <div>
      <button onClick={onLogout}>로그아웃</button>
      {children}
    </div>
  );
};

export default Workspace;
