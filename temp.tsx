const onDrop = useCallback(
  (e) => {
    e.preventDefault();
    // console.log(e);
    const formData = new FormData();
    if (e.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        console.log(e.dataTransfer.items[i]);
        if (e.dataTransfer.items[i].kind === "file") {
          const file = e.dataTransfer.items[i].getAsFile();
          console.log(e, ".... file[" + i + "].name = " + file.name);
          formData.append("image", file);
        }
      }
    } else {
      // Use DataTransfer interface to access the file(s)
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        console.log(
          e,
          "... file[" + i + "].name = " + e.dataTransfer.files[i].name,
        );
        formData.append("image", e.dataTransfer.files[i]);
      }
    }
    axios
      .post(`/api/workspaces/${workspace}/channels/${channel}/images`, formData)
      .then(() => {
        setDragOver(false);
        localStorage.setItem(
          `${workspace}-${channel}`,
          new Date().getTime().toString(),
        );
      });
  },
  [workspace, channel],
);
