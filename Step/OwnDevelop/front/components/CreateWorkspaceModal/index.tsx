import Modal from '@components/Modal';
import useInput from '@hooks/useinput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel, IWorkspace } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, VFC } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateWorkspaceModal: (flag: boolean) => void;
}

const CreateWorkspaceModal: VFC<Props> = ({ show, onCloseModal, setShowCreateWorkspaceModal }) => {
  // const { workspace } = useParams();
  // const [newChannel, setNewChannel, onChangeNewChannel] = useInput('');
  const [newWorkspace, setNewWorkspace, onChangeNewWorkspace] = useInput('');
  const [newUrl, setNewUrl, onChangeNewUrl] = useInput('');

  const onCreateWorkspace = useCallback(
    (e) => {
      e.preventDefault();
      if (!newWorkspace || !newWorkspace.trim()) return;
      axios
        .post(
          `/api/workspaces`,
          {
            workspace: newWorkspace,
            url: newUrl,
          },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          setShowCreateWorkspaceModal(false);
          setNewWorkspace('');
          setNewUrl('');
          axios
            .post(
              `/api/workspaces/${newUrl}/channels`,
              {
                name: '일반',
              },
              {
                withCredentials: true,
              },
            )
            .catch((error) => {
              console.dir(error);
              toast.error(error.response?.data, { position: 'bottom-center' });
            });
        })
        .catch((error) => {
          console.dir(error);
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [newUrl, newWorkspace, setNewUrl, setNewWorkspace, setShowCreateWorkspaceModal],
  );

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateWorkspace}>
        <Label id="workspace-label">
          <span>Workspace Name</span>
          <Input id="workspace" type="text" value={newWorkspace} onChange={onChangeNewWorkspace} />
        </Label>
        <Label id="workspace-url-label">
          <span>Workspace URL</span>
          <Input id="workspace" value={newUrl} onChange={onChangeNewUrl} />
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateWorkspaceModal;
