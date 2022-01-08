const onMessage = useCallback(
  (data: IDM) => {
    if (data.SenderId === Number(id) && myData.id !== Number(id)) {
      mutateChat((chatData) => {
        chatData?.[0].unshift(data);
        return chatData;
      }, false).then(() => {
        if (scrollbarRef.current) {
          if (
            scrollbarRef.current.getScrollHeight() <
            scrollbarRef.current.getClientHeight() +
              scrollbarRef.current.getScrollTop() +
              150
          ) {
            console.log("scrollToBottom!", scrollbarRef.current?.getValues());
            setTimeout(() => {
              scrollbarRef.current?.scrollToBottom();
            }, 100);
          } else {
            toast.success("새 메시지가 도착했습니다.", {
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
  [id, myData, mutateChat],
);
