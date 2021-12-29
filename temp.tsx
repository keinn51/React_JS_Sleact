const onCreateChannel = useCallback(() => {
  axios
    .post(
      `/api/workspaces/${workspace}/channels`,
      {
        name: newChannel,
      },
      {
        withCredentials: true,
      },
    )
    .then(() => {
      setShowCreateChannelModal(false);
      setNewChannel('');
    })
    .catch((error) => {
      console.dir(error);
      toast.error(error.response?.data, { position: 'bottom-center' });
    });
}, [newChannel]);