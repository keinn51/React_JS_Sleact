import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, useEffect, VFC } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
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
import useSocket from '@hooks/useSocket';
import CreateWorkspaceModal from '@components/CreateWorkspaceModal';

const Channel = loadable(() => import('@pages/Channel'));
const DirectMessage = loadable(() => import('@pages/DirectMessage'));

const Workspace: VFC = () => {
  const { workspace } = useParams<{ workspace: string }>();

  const [showUserMenu, setShowUserMenu] = useInput(false);
  const [showCreateWorkspaceModal, setShowCreateWorkspaceModal] = useInput(false);
  const [showInviteWorkspaceModal, setShowInviteWorkspaceModal] = useInput(false);
  const [showInviteChannelModal, setShowInviteChannelModal] = useInput(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useInput(false);
  const [showCreateChannelModal, setShowCreateChannelModal] = useInput(false);

  // IUser & IChannel 타입에 대한 정보는 typings/db.ts를 확인한다.
  const { data: myData, mutate } = useSWR<IUser | false>('/api/users', fetcher);
  const { data: channelsData } = useSWR<IChannel[]>(
    myData && workspace ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const { data: workspaceData } = useSWR<IWorkspace[]>(myData && workspace ? `/api/workspaces/` : null, fetcher);

  // console.log(`workspaceData`);
  // console.log(workspaceData);
  // console.log(`workspace name`);
  // console.log(workspace);

  // socket 을 사용한다. useSocket 이라는 custom hooks를 통해서, socket과 disconnet 함수를 가져온다.
  const [socket, disconnet] = useSocket(workspace);

  const onLogout = useCallback(() => {
    axios
      .post('/api/users/logout', null, {
        withCredentials: true,
      })
      .then(() => {
        mutate(false, false);
      });
  }, [mutate]);

  // header에서 프로필 사진을 눌렀을 때 실행되는 함수
  // stopPropagation ► 클릭 이벤트가 자식 함수로 캡쳐링 되지 않음
  const onClickUserProfile = useCallback(
    (e) => {
      e.stopPropagation();
      setShowUserMenu((prev) => !prev);
    },
    [setShowUserMenu],
  );

  const onClickCreateWorkspace = useCallback(() => {
    setShowCreateWorkspaceModal(true);
  }, [setShowCreateWorkspaceModal]);

  const onClickInviteWorkspace = useCallback(() => {
    setShowInviteWorkspaceModal(true);
  }, [setShowInviteWorkspaceModal]);

  // 모든 모달들을 닫아주는 함수
  const onCloseModal = useCallback(() => {
    setShowCreateWorkspaceModal(false);
    setShowCreateChannelModal(false);
    setShowInviteWorkspaceModal(false);
    setShowInviteChannelModal(false);
  }, [setShowCreateChannelModal, setShowCreateWorkspaceModal, setShowInviteChannelModal, setShowInviteWorkspaceModal]);

  const toggleWorkspaceModal = useCallback(() => {
    setShowWorkspaceModal((prev) => !prev);
  }, [setShowWorkspaceModal]);

  const onClickAddChannel = useCallback(() => {
    setShowCreateChannelModal(true);
  }, [setShowCreateChannelModal]);

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, [setShowInviteChannelModal]);

  // socket.emit ► login이라는 이벤트를 객체 데이터를 가지고 서버로 보내준다.
  useEffect(() => {
    if (channelsData && myData && socket) {
      socket.emit(`login`, { id: myData.id, channels: channelsData.map((v) => v.id) });
    }
  }, [channelsData, socket, myData]);

  // workspace 가 바뀌면, disconnet로 이전에 있었던 sockect 을 해제한다.
  useEffect(() => {
    return () => {
      disconnet();
    };
  }, [workspace, disconnet]);

  if (!myData) {
    return <Navigate to="/login" />;
  }

  // console.log(myData.Workspaces);
  // console.log(`channelsData`);
  // console.log(channelsData);
  // console.log(`workspace: ${workspace}`)
  // console.log(location.toString())
  // console.log(memberData)

  return (
    <div style={{ maxHeight: '100%', overflow: 'hidden' }}>
      <Header>
        <RightMenu>
          <span onClick={onClickUserProfile}>
            <ProfileImg src={gravatar.url(myData.email, { s: `28px`, d: `retro` })} alt={myData.email}></ProfileImg>
            {showUserMenu && (
              <Menu style={{ right: 0, top: 38 }} show={showUserMenu} onCloseModal={onClickUserProfile}>
                <ProfileModal>
                  <img src={gravatar.url(myData.email, { s: `36px`, d: `retro` })} alt={myData.email} />
                  <div id="profile-letters">
                    <span id="profile-name">{myData.email}</span>
                    <span id="profile-active">Active</span>
                  </div>
                </ProfileModal>
                <LogOutButton onClick={onLogout}>LogOut</LogOutButton>
              </Menu>
            )}
          </span>
        </RightMenu>
      </Header>

      {/* WorkspaceWrapper : Workspaces + Channels + Chats 모두 합친 div */}
      <WorkspaceWrapper>
        <Workspaces>
          {myData?.Workspaces?.map((ws) => {
            return (
              <Link key={ws.id} to={`/workspace/${ws.url}/channels/일반`}>
                <WorkspaceButton>{ws.name.slice(0, 1).toUpperCase()}</WorkspaceButton>
              </Link>
            );
          })}
          <AddButton onClick={onClickCreateWorkspace}>+</AddButton>
        </Workspaces>

        <Channels>
          <WorkspaceName onClick={toggleWorkspaceModal}>Sleact</WorkspaceName>
          <MenuScroll>
            {/* Modal */}
            <Menu show={showWorkspaceModal} onCloseModal={toggleWorkspaceModal} style={{ top: 95, left: 80 }}>
              <WorkspaceModal>
                <h2>Sleact</h2>
                <button onClick={onClickInviteWorkspace}>워크스페이스에 사용자 초대</button>
                <button onClick={onClickInviteChannel}>채널에 사용자 초대</button>
                <button onClick={onClickAddChannel}>채널 만들기</button>
                <button onClick={onLogout}>로그아웃</button>
              </WorkspaceModal>
            </Menu>
            <ChannelList />
            <DMList />
          </MenuScroll>
        </Channels>

        <Chats>
          <Routes>
            <Route path="channels/:channel/*" element={<Channel />} />
            <Route path="dms/:id/*" element={<DirectMessage />} />
          </Routes>
        </Chats>
      </WorkspaceWrapper>

      {/* 새로운 WorkSpace 만들기 */}
      <CreateWorkspaceModal
        show={showCreateWorkspaceModal}
        onCloseModal={onCloseModal}
        setShowCreateWorkspaceModal={setShowCreateWorkspaceModal}
      />

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
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </div>
  );
};

export default Workspace;
