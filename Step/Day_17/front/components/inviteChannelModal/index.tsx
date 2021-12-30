import Modal from '@components/Modal';
import useInput from '@hooks/useinput';
import Channel from '@pages/Channel';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IUser } from '@typings/db';
import fetcher from '@utils/fetcher';
import axios from 'axios';
import React, { useCallback, VFC } from 'react';
import { useParams } from 'react-router';
import { toast } from 'react-toastify';
import useSWR from 'swr';

interface Props {
  show: boolean;
  onCloseModal: () => void;
  setShowInviteChannelModal: (flag: boolean) => void;
}

const InviteChannelModal: VFC<Props> = ({ show, onCloseModal, setShowInviteChannelModal }) => {
  const { workspace, channel } = useParams();
  const [newMember, setNewMember, onChangeNewMember] = useInput('');

  const { data: userData, error } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  const { data: channelData, mutate: mutateMember } = useSWR<IUser[]>(
    userData ? `/api/workspaces/${workspace}/channels/${channel}/members` : null,
    fetcher,
  );

  const onInviteMember = useCallback((e) => {
    e.preventDefault();
    if (!newMember || !newMember.trim()) return;
    axios
      .post(
        `/api/workspaces/${workspace}/channels/${channel}/members`,
        {
          email: newMember,
        },
        {
          withCredentials: true,
        },
      )
      .then(() => {
        mutateMember();
        setShowInviteChannelModal(false);
        setNewMember('');
      })
      .catch((error) => {
        console.dir(error);
        toast.error(error.response?.data, { position: 'bottom-center' });
      });
  }, [newMember]);

  console.log(`workspace: ${workspace} ${channel}`)

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onInviteMember}>
        <Label id="member-label">
          <span>Email</span>
          <Input id="member" type="email" value={newMember} onChange={onChangeNewMember} />
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default InviteChannelModal;