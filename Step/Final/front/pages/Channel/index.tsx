import React, { useCallback, useEffect, useRef } from 'react';
import { Container, Header } from '@pages/Channel/styles';
import useInput from '@hooks/useinput';
import ChatList from '@components/ChatList';
import ChatBox from '@components/ChatBox';
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';
import useSocket from '@hooks/useSocket';
import { useParams } from 'react-router-dom';
import fetcher from '@utils/fetcher';
import makeSection from '@utils/makeSection';
import { IChannel, IChat, IUser } from '@typings/db';
import axios from 'axios';
import { toast } from 'react-toastify';

const PAGE_SIZE = 20;
const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const socket = useSocket(workspace);
  const [chat, setChat, onChangeChat] = useInput('');
  const [showInviteChannelModal, setShowInviteChannelModal] = useInput(false);

  const { data: userData } = useSWR(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);
  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels`, fetcher);
  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const scrollbarRef = useRef<Scrollbars>(null);
  const isEmpty = chatData?.[0]?.length === 0;
  const isReachingEnd = isEmpty || (chatData && chatData[chatData.length - 1]?.length < 20) || false;

  const onSubmitForm = useCallback(
    (e) => {
      e.preventDefault();
      if (chat.trim() && chatData && channelData) {
        const savedChat = chat;
        mutateChat((prevChatData) => {
          prevChatData?.[0].unshift({
            id: (chatData[0][0]?.id || 0) + 1,
            content: savedChat,
            UserId: myData.id,
            User: myData,
            ChannelId: channelData.id,
            Channel: channelData,
            createdAt: new Date(),
          });
          return prevChatData;
        }, false).then(() => {
          setChat('');
          scrollbarRef?.current?.scrollToBottom();
        });
        axios
          .post(`/api/workspaces/${workspace}/channels/${channel}/chats`, {
            content: chat,
          })
          .then(() => {})
          .catch(console.error);
      }
    },
    [channel, channelData, chat, chatData, mutateChat, myData, setChat, workspace],
  );

  const onMessage = useCallback(
    (data: IChat) => {
      if (data.Channel.name === channel && data.UserId !== myData?.id) {
        mutateChat((chatData) => {
          chatData?.[0].unshift(data);
          return chatData;
        }, false).then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              setTimeout(() => {
                scrollbarRef.current?.scrollToBottom();
              }, 100);
            } else {
              toast.success('새 메시지가 도착했습니다.', {
                onClick() {
                  scrollbarRef.current?.scrollToBottom();
                },
                closeOnClick: true,
              });
            }
          }
        });
      }
    },
    [channel, mutateChat, myData?.id],
  );

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, [setShowInviteChannelModal]);

  const onCloseModal = useCallback(() => {}, []);

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  useEffect(() => {
    socket[0]?.on('message', onMessage);
    return () => {
      socket[0]?.off('message', onMessage);
    };
  }, [onMessage, socket]);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  if (!myData) {
    return null;
  }

  return (
    <Container>
      <Header>
        <span>#{channel}</span>
        <div className="header-right">
          <span>{channelMembersData?.length}</span>
          <button
            onClick={onClickInviteChannel}
            className="c-button-unstyled p-ia__view_header__button"
            aria-label="Add people to #react-native"
            data-sk="tooltip_parent"
            type="button"
          >
            <i className="c-icon p-ia__view_header__button_icon c-icon--add-user" aria-hidden="true" />
          </button>
        </div>
      </Header>
      <ChatList
        chatSections={chatSections}
        scrollbarRef={scrollbarRef}
        setSize={setSize}
        isReachingEnd={isReachingEnd}
      />
      <ChatBox chat={chat} onSubmitForm={onSubmitForm} onChangeChat={onChangeChat} />
      <InviteChannelModal
        show={showInviteChannelModal}
        onCloseModal={onCloseModal}
        setShowInviteChannelModal={setShowInviteChannelModal}
      />
    </Container>
  );
};

export default Channel;
