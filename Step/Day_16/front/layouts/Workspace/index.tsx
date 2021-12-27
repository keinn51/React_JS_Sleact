import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { Component, FC, useCallback } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import useSWR from 'swr';
import {
  Channels,
  Chats,
  Header,
  MenuScroll,
  ProfileImg,
  RightMenu,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './styles';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import { useParams } from 'react-router';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: FC = () => {
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

  console.log(data);

  return (
    <div>
      <Header>
        <RightMenu>
          <span>
            <ProfileImg src={gravatar.url(data.email, { s: `28px`, d: `retro` })} alt=""></ProfileImg>
          </span>
        </RightMenu>
      </Header>
      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>test</Workspaces>
        <Channels>
          <WorkspaceName>Sleact</WorkspaceName>
          <MenuScroll>MS</MenuScroll>
        </Channels>
        <Chats>
          <Routes>
            <Route path="channel" element={<Channel />} />
            <Route path="dm" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>
    </div>
  );
};

export default Workspace;
