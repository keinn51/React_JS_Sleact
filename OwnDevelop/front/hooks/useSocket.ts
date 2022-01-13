import { useCallback } from 'react';
import io from 'socket.io-client';

const backUrl = `http://localhost:3095`;

const sockets: { [key: string]: SocketIOClient.Socket } = {};
const useSocket = (workspace?: string): [SocketIOClient.Socket | undefined, () => void] => {
  // disconnect 자체는 socket.io-client에 내장되어 있는 함수이다. 여기서는 sockets[workspace]을
  // disconnect 해주는 자체 함수를 만든 것 뿐이다.
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect();
      delete sockets[workspace];
    }
  }, [workspace]);

  if (!workspace) return [undefined, disconnect];

  // sockets[workspace] 이 존재하지 않는다면 connect 라는 socket.io-client 내장 함수를 사용한다.
  // socket.io-client 에서 가져오는 io는 "함수" 이다.
  // io.connect(url, option) 에서 url은 연결할 백엔드 서버이고 옵션도 정해줄 수 있다.
  if (!sockets[workspace]) {
    sockets[workspace] = io.connect(`${backUrl}/ws-${workspace}`, {
      transports: ['websocket'],
    });
  }

  return [sockets[workspace], disconnect];
};

export default useSocket;
