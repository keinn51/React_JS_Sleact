import Modal from '@components/Modal';
import useInput from '@hooks/useinput';
import { Button, Input, Label } from '@pages/SignUp/styles';
import React, { useCallback, VFC } from 'react';

interface Props {
  show: boolean;
  onCloseModal: () => void;
}

const CreateChannelModal: VFC<Props> = ({show, onCloseModal}) => {
  const [newChannel, ,onChangeNewWorkspace] = useInput('');
  const onCreateChannel = useCallback(() => {

  }, [])

  return (
    <Modal show={show} onCloseModal={onCloseModal}>
      <form onSubmit={onCreateChannel}>
        <Label id="channel-label">
          <span>Workspace Name</span>
          <Input id="workspace" type="text" value={newChannel} onChange={onChangeNewWorkspace} />
        </Label>
        <Button type="submit">Create</Button>
      </form>
    </Modal>
  );
};

export default CreateChannelModal;
