import { Header, Container } from '@pages/DirectMessage/styles';
import React, { useCallback } from 'react';
import gravatar from 'gravatar';
import useSWR, { mutate } from 'swr';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';
import ChatList from '@components/ChatList';
import useInput from '@hooks/useinput';
import axios from 'axios';

const DirectMessage = () => {
  const { workspace, id } = useParams();
  const [chat, setChat, onChangeChat] = useInput('');

  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { data: chatData, mutate: mutateChat } = useSWR(
    `/api/workspaces/${workspace}/dms/${id}/chats?perPage=20&page=1`,
    fetcher,
  );

  const onSubmitForm = useCallback(
    (e) => {
      // e.preventDefault();
      console.log(`e: ${e}`);
      if (!chat.trim()) {
        axios
          .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
            content: chat,
          })
          .then(() => {
            mutateChat();
            setChat('');
          })
          .catch(console.error);
      }
    },
    [chat, id, mutateChat, setChat, workspace],
  );

  if (!userData || !myData) {
    return null;
  }

  // console.log(workspace, id)

  return (
    <Container>
      <Header>
        <img src={gravatar.url(userData?.email, { s: '24px', d: 'retro' })} alt={userData?.nickname} />
        <span>{userData?.nickname}</span>
      </Header>
      <ChatList />
      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} />
    </Container>
  );
};

export default DirectMessage;
