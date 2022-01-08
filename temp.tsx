const onSubmitForm = useCallback(
  (e) => {
    e.preventDefault();
    if (chat.trim() && chatData) {
      const savedChat = chat;
      mutateChat((prevChatData) => {
        prevChatData?.[0].unshift({
          id: (chatData[0][0]?.id || 0) + 1,
          content: savedChat,
          SenderId: myData.id,
          Sender: myData,
          ReceiverId: userData.id,
          Receiver: userData,
          createdAt: new Date(),
        });
        return prevChatData;
      }, false).then(() => {
        setChat("");
        scrollbarRef?.current?.scrollToBottom();
      });
      axios
        .post(`/api/workspaces/${workspace}/dms/${id}/chats`, {
          content: chat,
        })
        .then(() => {})
        .catch(console.error);
    }
  },
  [chat, id, mutateChat, setChat, workspace],
);
