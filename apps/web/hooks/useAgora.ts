'use client';
import { useEffect, useRef, useState } from 'react';
import AgoraRTC, {
  IAgoraRTCClient,
  ILocalVideoTrack,
  ILocalAudioTrack,
  IRemoteVideoTrack,
} from 'agora-rtc-sdk-ng';

const APP_ID = process.env.NEXT_PUBLIC_AGORA_APP_ID!;

export function useAgora(channelName: string, role: 'host' | 'audience') {
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const joinedRef = useRef(false); // ← prevent double join
  const [localVideoTrack, setLocalVideoTrack] = useState<ILocalVideoTrack | null>(null);
  const [localAudioTrack, setLocalAudioTrack] = useState<ILocalAudioTrack | null>(null);
  const [remoteVideoTrack, setRemoteVideoTrack] = useState<IRemoteVideoTrack | null>(null);
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState('');
  const [micMuted, setMicMuted] = useState(false);
  const [camOff, setCamOff] = useState(false);

  const join = async () => {
    if (joinedRef.current) return; // ← block duplicate joins
    joinedRef.current = true;

    try {
      // Reuse existing client or create new one
      if (!clientRef.current) {
        clientRef.current = AgoraRTC.createClient({ mode: 'live', codec: 'vp8' });
      }
      const client = clientRef.current;

      await client.setClientRole(role);
      await client.join(APP_ID, channelName, null, null);

      if (role === 'host') {
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        setLocalAudioTrack(audioTrack);
        setLocalVideoTrack(videoTrack);
        await client.publish([audioTrack, videoTrack]);
      }

      client.on('user-published', async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === 'video') setRemoteVideoTrack(user.videoTrack!);
        if (mediaType === 'audio') user.audioTrack?.play();
      });

      client.on('user-unpublished', (_, mediaType) => {
        if (mediaType === 'video') setRemoteVideoTrack(null);
      });

      setJoined(true);
    } catch (err: any) {
      joinedRef.current = false; // allow retry on error
      setError(err.message || 'Failed to join');
    }
  };

  const leave = async () => {
    if (!joinedRef.current) return;
    joinedRef.current = false;

    localAudioTrack?.stop();
    localAudioTrack?.close();
    localVideoTrack?.stop();
    localVideoTrack?.close();

    clientRef.current?.removeAllListeners();
    await clientRef.current?.leave();
    clientRef.current = null;

    setJoined(false);
    setLocalVideoTrack(null);
    setLocalAudioTrack(null);
    setRemoteVideoTrack(null);
  };

  const toggleMic = async () => {
    if (localAudioTrack) {
      await localAudioTrack.setMuted(!micMuted);
      setMicMuted(m => !m);
    }
  };

  const toggleCam = async () => {
    if (localVideoTrack) {
      await localVideoTrack.setMuted(!camOff);
      setCamOff(c => !c);
    }
  };

  // Cleanup on unmount only
  useEffect(() => {
    return () => { leave(); };
  }, []); // ← empty deps, only runs on unmount

  return {
    join, leave, toggleMic, toggleCam,
    localVideoTrack, remoteVideoTrack,
    joined, error, micMuted, camOff,
  };
}