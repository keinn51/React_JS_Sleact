import React, { useCallback, useEffect, useRef } from 'react';
import { Container, DragOver, Header } from '@pages/Channel/styles';
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
import Scrollbars from 'react-custom-scrollbars';
import InviteChannelModal from '@components/inviteChannelModal';

const PAGE_SIZE = 20;
const Channel = () => {
  const { workspace, channel } = useParams<{ workspace: string; channel: string }>();
  const socket = useSocket(workspace);
  const [chat, setChat, onChangeChat] = useInput('');
  const [showInviteChannelModal, setShowInviteChannelModal] = useInput(false);
  const [dragOver, setDragOver] = useInput(false);

  const { data: myData } = useSWR(`/api/users`, fetcher);
  const { data: memberData } = useSWR<IUser[]>(`/api/workspaces/${workspace}/channels/${channel}/members`, fetcher);
  const { data: channelData } = useSWR<IChannel>(`/api/workspaces/${workspace}/channels/${channel}`, fetcher);

  const {
    data: chatData,
    mutate: mutateChat,
    setSize,
  } = useSWRInfinite<IChat[]>(
    (index) => `/api/workspaces/${workspace}/channels/${channel}/chats?perPage=${PAGE_SIZE}&page=${index + 1}`,
    fetcher,
  );
  const { data: channelMembersData } = useSWR<IUser[]>(
    memberData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
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
          .then(() => {
            mutateChat();
          })
          .catch(console.error);
      }
    },
    [channel, channelData, chat, chatData, mutateChat, myData, setChat, workspace],
  );

  // onMessage : socket 을 deps로 설정해, 남을 포함한 누군가가 채팅을 칠 때 실행되는 함수
  const onMessage = useCallback(
    (data: IChat) => {
      // console.log(data);
      // { id: 19, content: '2', createdAt: '2022-01-10T07:06:47.000Z', updatedAt: '2022-01-10T07:06:47.000Z', ChannelId: 1,
      // Channel: { id: 1, name: '일반', private: false, createdAt: '2021-12-26T04:16:12.000Z', updatedAt: '2021-12-26T04:16:12.000Z',
      // ChannelId: 1 User: {...}
      if (
        data.Channel.name === channel &&
        (data.content.startsWith('uploads\\') || data.content.startsWith('uploads/') || data.UserId !== myData?.id)
      ) {
        mutateChat().then(() => {
          if (scrollbarRef.current) {
            if (
              scrollbarRef.current.getScrollHeight() <
              scrollbarRef.current.getClientHeight() + scrollbarRef.current.getScrollTop() + 150
            ) {
              scrollbarRef.current?.scrollToBottom();
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
    [channel, myData?.id, mutateChat],
  );

  const onClickInviteChannel = useCallback(() => {
    setShowInviteChannelModal(true);
  }, [setShowInviteChannelModal]);

  const onCloseModal = useCallback(() => {
    setShowInviteChannelModal(false);
  }, [setShowInviteChannelModal]);

  const onDragOver = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(true);
    },
    [setDragOver],
  );

  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      // console.log(e);
      const formData = new FormData();
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          // console.log(e.dataTransfer.items[i]);
          if (e.dataTransfer.items[i].kind === 'file') {
            const file = e.dataTransfer.items[i].getAsFile();
            // console.log(e, '.... file[' + i + '].name = ' + file.name);
            formData.append('image', file);
          }
        }
      } else {
        // Use DataTransfer interface to access the file(s)
        for (let i = 0; i < e.dataTransfer.files.length; i++) {
          // console.log(e, '... file[' + i + '].name = ' + e.dataTransfer.files[i].name);
          formData.append('image', e.dataTransfer.files[i]);
        }
      }
      axios.post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData).then(() => {
        setDragOver(false);
        // localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
      });
    },
    [workspace, channel, setDragOver],
  );

  useEffect(() => {
    if (chatData?.length === 1) {
      scrollbarRef.current?.scrollToBottom();
    }
  }, [chatData]);

  useEffect(() => {
    // console.log(`socket`);
    // console.log(socket[0]);

    socket[0]?.on('message', onMessage);
    return () => {
      socket[0]?.off('message', onMessage);
    };
  }, [onMessage, socket]);

  useEffect(() => {
    localStorage.setItem(`${workspace}-${channel}`, new Date().getTime().toString());
  }, [workspace, channel]);

  const chatSections = makeSection(chatData ? [...chatData].flat().reverse() : []);

  // console.log(`channelData`);
  // console.log(channelData);
  // console.log(`chatData`);
  // console.log(chatData);
  // console.log(`channel`);
  // console.log(channel);

  if (!myData) {
    return null;
  }

  return (
    <Container onDrop={onDrop} onDragOver={onDragOver}>
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
      {dragOver && <DragOver>업로드!</DragOver>}
    </Container>
  );
};

export default Channel;
