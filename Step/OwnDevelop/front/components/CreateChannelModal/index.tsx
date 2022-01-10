import Modal from '@components/Modal';
import useInput from '@hooks/useinput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IChannel } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, VFC } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';
import 'react-toastify/dist/ReactToastify.css';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowCreateChannelModal: (flag: boolean) => void;
}

const CreateChannelModal: VFC<Props> = ({ show, onCloseModal, setShowCreateChannelModal }) => {
  const { workspace } = useParams();
  const [newChannel, setNewChannel, onChangeNewChannel] = useInput('');

  const { mutate: mutateChannel } = useSWR<IChannel[]>(
    workspace ? `/api/workspaces/${workspace}/channels` : null,
    fetcher,
  );

  const onCreateChannel = useCallback(
    (e) => {
      e.preventDefault();
      if (!newChannel || !newChannel.trim()) return;
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
          mutateChannel();
          setShowCreateChannelModal(false);
          setNewChannel('');
        })
        .catch((error) => {
          console.dir(error);
          toast.configure();
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [mutateChannel, newChannel, setNewChannel, setShowCreateChannelModal, workspace],
  );

  // console.log(`workspace createChannel`);
  // console.log(workspace);
  // console.log(`channelsData`);
  // console.log(channelsData);

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>Channel Name</span>
          <Input id="workspace" type="text" value={newChannel} onChange={onChangeNewChannel} />
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
