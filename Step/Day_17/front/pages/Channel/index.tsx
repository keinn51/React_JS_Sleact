import React from 'react';
import { Container, Header } from '@pages/Channel/styles';
import { useParams } from 'react-router';

const Channel = () => {
  const {workspace, channel} = useParams();

  // console.log(workspace, channel);
  return(
    <Container>
      <Header>
        Channel!
      </Header>
    </Container>
  )
}

export default Channel;