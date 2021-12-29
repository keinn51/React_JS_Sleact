import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { Component, useCallback, useState, VFC } from 'react';
import { BrowserRouter as Router, Link, Navigate, Route, Routes } from 'react-router-dom';
import useSWR from 'swr';
import {
  AddButton,
  Channels,
  Chats,
  Header,
  LogOutButton,
  MenuScroll,
  ProfileImg,
  ProfileModal,
  RightMenu,
  WorkspaceButton,
  WorkspaceModal,
  WorkspaceName,
  Workspaces,
  WorkspaceWrapper,
} from './styles';
import gravatar from 'gravatar';
import loadable from '@loadable/component';
import { useParams } from 'react-router';
import Menu from '@components/Menu';
import useInput from '@hooks/useinput';
import { IUser } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';
import Modal from '@components/Modal';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const {
    data: userData,
    error,
    isValidating,
    mutate,
  } = useSWR<IUser | false>('http://localhost:3095/api/users', fetcher);
  const [showUserMenu, setShowUserMenu] = useInput(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useInput(false);
  const [newWorkspace, setNewWorkspace, onChangeNewWorkspace] = useInput('');
  const [newUrl, setNewUrl, onChangeNewUrl] = useInput('');
  const [showWorkspaceModal, setShowWorkspaceModal] = useInput(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useInput(false);

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate(false, false);
      });
  }, []);

  const onClickUserProfile = useCallback((e) => {
    e.stopPropagation();
    setShowUserMenu((prev) => !prev);
  }, []);

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return; //trim을 넣는 이유는, 띄어쓰기도 잡아주기 위해서!
      axios
        .post(
          'http://localhost:3095/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
          console.log(response);
          mutate();
          setShowCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
        })
        .catch((error) => {
          console.log(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newWorkspace, newUrl],
  );

  // 모든 모달들을 닫아주는 함수
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  if (!userData) {
    return <Navigate to="/login" />;
  }

  console.log(userData);

  return (
    <div>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(userData.email, { s: `28px`, d: `retro` })} alt={userData.email}></ProfileImg>
            {showUserMenu && (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(userData.email, { s: `36px`, d: `retro` })} alt={userData.email} />
                  <div id="profile-letters">
                    <span id="profile-name">{userData.email}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>LogOut</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>

      <button onClick={onLogout}>로그아웃</button>
      <WorkspaceWrapper>
        <Workspaces>
          {userData?.Workspaces?.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${123}/channel/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>
        {/* Channel  */}
        <Channels> 
          {/* WorkspaceName : Button => 채널만들기 & 로그아웃 */}
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                {/* <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button> */}
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
          </MenuScroll>
        </Channels>
        <Chats>
          <Routes>
            <Route path="channel" element={<Channel />} />
            <Route path="dm" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>

      <Modal show={showCreateWorkspaceModal} onCloseModal={onCloseModal}>
        <form onSubmit={onCreateWorkspace}>
          <Label id="workspace-label">
            <span>Workspace Name</span>
            <Input id="workspace" type="text" value={newWorkspace} onChange={onChangeNewWorkspace} />
          </Label>
          <Label id="workspace-url-label">
            <span>Workspace URL</span>
            <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
          </Label>
          <Button type="submit">Create</Button>
        </form>
      </Modal>
      <CreateChannelModal show={showCreateChannelModal} onCloseModal={onCloseModal} />
    </div>
  );
};

export default Workspace;
