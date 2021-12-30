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
import { IChannel, IUser, IWorkspace } from '@typings/db';
import { Button, Input, Label } from '@pages/SignUp/styles';
import Modal from '@components/Modal';
import { toast } from 'react-toastify';
import CreateChannelModal from '@components/CreateChannelModal';
import InviteWorkspaceModal from '@components/inviteWorkspaceModal';
import InviteChannelModal from '@components/inviteChannelModal';
import DMList from '@components/DMList';
import ChannelList from '@components/ChannelList';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const { workspace } = useParams<{ workspace: string }>();
  const [showUserMenu, setShowUserMenu] = useInput(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useInput(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useInput(false);
  // const [showInviteChannelModal, setShowInviteChannelModal] = useInput(false);
  const [newWorkspace, setNewWorkspace, onChangeNewWorkspace] = useInput('');
  const [newUrl, setNewUrl, onChangeNewUrl] = useInput('');
  const [showWorkspaceModal, setShowWorkspaceModal] = useInput(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useInput(false);

  const { data: userData, error, isValidating, mutate } = useSWR<IUser | false>('/api/users', fetcher);
  const { data: channelData } = useSWR<IChannel[]>(
    userData && workspace ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );
  const { data: memberData } = useSWR<IUser[]>(
    `/api/workspaces/${workspace}/members`,
    fetcher
  );

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

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, []);

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      if (!newUrl || !newUrl.trim()) return; //trim을 넣는 이유는, 띄어쓰기도 잡아주기 위해서!
      axios
        .post(
          '/api/workspaces',
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          },
        )
        .then((response) => {
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
    setShowInviteWorkspaceModal(false);
    // setShowInviteChannelModal(false);
  }, []);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, []);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, []);

  // const onClickInviteChannel = useCallback(()=>{
  //   setShowInviteChannelModal(true);
  // },[])

  if (!userData) {
    return <Navigate to="/login" />;
  }

  // console.log(userData);
  // console.log(channelData);
  // console.log(`workspace: ${workspace}`)
  // console.log(location.toString())
  // console.log(memberData)

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
          {/* WorkspaceName : Button */}
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            {/* Modal */}
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                {/* <button onClick={onClickInviteChannel}>채널에 사용자 초대</button> */}
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList/>
          </MenuScroll>
        </Channels>

        <Chats>
          <Routes>
            <Route path="channel/:channel/*" element={<Channel />} />
            <Route path="dm/:id/*" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>

      {/* 새로운 WorkSpace 만들기 */}
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
      {/* sleact 글자 누르면 나오는 모달 */}
      <CreateChannelModal
        show={showCreateChannelModal}
        onCloseModal={onCloseModal}
        setShowCreateChannelModal={setShowCreateChannelModal}
      />
      <InviteWorkspaceModal
        show={showInviteWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowInviteWorkspaceModal={setShowInviteWorkspaceModal}
      />
      {/* <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      /> */}
    </div>
  );
};

export default Workspace;
