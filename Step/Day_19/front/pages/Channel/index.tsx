import React, { useCallback } from 'react';
import { Container, Header } from '@pages/Channel/styles';
import useInput from '@hooks/useinput';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';

const Channel = () => {
  const [chat, setChat, onChangeChat] = useInput('');

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      console.log(`submit: ${chat}`);
      setChat('');
    },
    [chat, setChat],
  );

  return (
    <Container>
      <Header>Channel!</Header>
      {/* <ChatList /> */}
      <ChatBox chat={chat} onChangeChat={onChangeChat} onSubmitForm={onSubmitForm} />
    </Container>
  );
};

export default Channel;
