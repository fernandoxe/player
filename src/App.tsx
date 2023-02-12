// import { useEffect, useState } from 'react';
// import { io } from 'socket.io-client';

import { VideoPage } from './pages/VideoPage';

export const App = () => {
  // useEffect(() => {
  //   const socket = io('http://localhost:5000');
  //   socket.on('connect', () => {
  //     console.log('socket id', socket.id);
  //   });
  //   console.log('use effect');

  //   socket.emit('message1', {asd: socket.id, a: 'a', b: 'b'});
  // }, []);
  
  return (
    <>
      <VideoPage />
    </>
  );
};
