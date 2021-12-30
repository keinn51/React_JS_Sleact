import { Header, Container } from '@pages/DirectMessage/styles';
import React from 'react';
import gravatar from 'gravatar';
import useSWR from 'swr';
import fetcher from '@utils/fetcher';
import { useParams } from 'react-router';
import ChatBox from '@components/ChatBox';

const DirectMessage = () => {
  const { workspace, id } = useParams();
  const { data: userData } = useSWR(`/api/workspaces/${workspace}/users/${id}`, fetcher);
  const { data: myData } = useSWR(`/api/users`, fetcher);

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
      {/* <ChatList /> */}
      <ChatBox chat={'Hey~'} />
    </Container>
  );
};

export default DirectMessage;
