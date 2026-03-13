'use client';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { auth } from '@/lib/firebase';

let socketInstance: Socket | null = null;

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const connect = async () => {
      const user = auth.currentUser;
      if (!user || socketInstance?.connected) return;

      const token = await user.getIdToken();
      socketInstance = io(process.env.NEXT_PUBLIC_WS_URL!, {
        auth: { token },
        transports: ['websocket'],
      });

      socketRef.current = socketInstance;
    };

    connect();

    return () => {
      socketInstance?.disconnect();
      socketInstance = null;
    };
  }, []);

  return socketRef;
};
