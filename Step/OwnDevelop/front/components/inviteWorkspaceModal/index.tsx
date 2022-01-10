import Modal from '@components/Modal';
import useInput from '@hooks/useinput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import { IUser } from '@typings/db';
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
  setShowInviteWorkspaceModal: (flag: boolean) => void;
}

const InviteWorkspaceModal: VFC<Props> = ({ show, onCloseModal, setShowInviteWorkspaceModal }) => {
  const { workspace } = useParams();
  const [newMember, setNewMember, onChangeNewMember] = useInput('');

  const { data: userData } = useSWR<IUser | false>('/api/users', fetcher, {
    dedupingInterval: 2000, // 2초
  });
  const { mutate: mutateMember } = useSWR<IUser[]>(userData ? `/api/workspaces/${workspace}/members` : null, fetcher);

  const onInviteMember = useCallback(
    (e) => {
      e.preventDefault();
      if (!newMember || !newMember.trim()) return;
      axios
        .post(
          `/api/workspaces/${workspace}/members`,
          {
            email: newMember,
          },
          {
            withCredentials: true,
          },
        )
        .then(() => {
          mutateMember();
          setShowInviteWorkspaceModal(false);
          setNewMember('');
        })
        .catch((error) => {
          console.dir(error);
          toast.configure();
          toast.error(error.response?.data, { position: 'bottom-center' });
        });
    },
    [mutateMember, newMember, setNewMember, setShowInviteWorkspaceModal, workspace],
  );

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

export default InviteWorkspaceModal;
