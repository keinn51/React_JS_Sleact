useEffect(() => {
  localStorage.setItem(`${workspace}-${id}`, new Date().getTime().toString());
}, [workspace, id]);
