useEffect(() => {
  socket?.on("onlineList", (data: number[]) => {
    setOnlineList(data);
  });
  // socket?.on('dm', onMessage);
  // console.log('socket on dm', socket?.hasListeners('dm'), socket);
  return () => {
    socket?.off("dm", onMessage);
    // console.log('socket off dm', socket?.hasListeners('dm'));
    // socket?.off('onlineList');
  };
}, [socket]);
