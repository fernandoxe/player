import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ReactionType, SubtitleLang, User, ConnectStatus } from '../../interfaces';
import { Controls } from '../Controls';
import { EditUser } from '../EditUser';
import { Reaction } from '../Reaction';
import { Users } from '../Users';
import { getSavedUser, saveUser } from '../../services';

const MEDIA_HOST = process.env.REACT_APP_MEDIA_HOST;
const WEBSOCKETS_HOST = process.env.REACT_APP_WEBSOCKETS_HOST || '/';

export interface VideoProps {
  id: string;
}

export const Video = ({id}: VideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [loadedMetadata, setLoadedMetadata] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lang, setLang] = useState(SubtitleLang.off);
  const [showControls, setShowControls] = useState(true);
  const [availableTracks, setAvailableTracks] = useState<SubtitleLang[]>([]);
  const [play, setPlay] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [canPlay, setCanPlay] = useState(false);
  const [reactions, setReactions] = useState<{id: string; name: ReactionType; user: User; position?: number, size?: number}[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>(ConnectStatus.disconnected);
  const [socketId, setSocketId] = useState<string>('');
  const [lastEvent, setLastEvent] = useState<{user: User; event: string; currentTime: number}>();
  const [videoName, setVideoName] = useState<string>('');
  const [user, setUser] = useState<string>(getSavedUser());

  const playVideo = useCallback(() => {
    setPlay(true);
    videoRef.current?.play();
    handleMouseMove();
  }, []);

  const pauseVideo = useCallback(() => {
    setPlay(false);
    videoRef.current?.pause();
    handleMouseMove();
    const pausedTimes = localStorage.getItem('pausedTimes') || '{}';
    const parsedPausedTimes = JSON.parse(pausedTimes);
    parsedPausedTimes[id] = videoRef.current?.ended ? 0 : Math.floor(videoRef.current?.currentTime || 0);
    localStorage.setItem('pausedTimes', JSON.stringify(parsedPausedTimes));
  }, [id]);

  const emit = useCallback((message: string, data?: any) => {
    if(socketRef.current) {
      socketRef.current.emit(message, data);
    }
  }, []);
  
  const handlePlay = useCallback(() => {
    const video = videoRef.current;
    if(video?.paused) {
      playVideo();
      emit('play', {currentTime: video.currentTime});
      setLastEvent({
        user: {
          id: socketId,
          user,
        },
        event: 'play',
        currentTime: video.currentTime,
      });
    } else {
      pauseVideo();
      emit('pause', {currentTime: video?.currentTime});
      video && setLastEvent({
        user: {
          id: socketId,
          user,
        },
        event: 'pause',
        currentTime: video.currentTime,
      });
    }
  }, [playVideo, pauseVideo, emit, socketId, user]);

  const changeTime = useCallback((time: number) => {
    if(videoRef.current) {
      videoRef.current.currentTime = time;
      handleMouseMove(); // to show controls on progress change from touch devices
    }
  }, []);

  const handleChangeTime = useCallback((time: number) => {
    if(videoRef.current) {
      changeTime(time);
      emit('change-time', {currentTime: time});
      setLastEvent({
        user: {
          id: socketId,
          user,
        },
        event: 'change-time',
        currentTime: time,
      });
      console.log('Changed time to', videoRef.current?.currentTime);
    }
  }, [changeTime, emit, socketId, user]);

  const handleReleaseTime = useCallback((time: number) => {
    console.log('Released time at', time);
    emit('change-time', {currentTime: time});
  }, [emit]);

  const handleChangeSubtitles = (lang: SubtitleLang) => {
    localStorage.setItem('lang', lang);
    setLang(lang);
    if(videoRef.current) {
      const tracks = videoRef.current.textTracks;
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i];
        if(track.language === lang) {
          track.mode = 'showing';
        } else {
          track.mode = 'disabled';
        }
      }
    }
  };

  const addReaction = useCallback((name: ReactionType, user: User, position?: number, size?: number) => {
    const id = Math.random() + Date.now() + '';
    const newReaction = {
      id,
      name,
      user,
      position,
      size,
    };
    setReactions(prevReactions => [...prevReactions.slice(-19), newReaction]);
  }, []);

  const refreshUsers = useCallback((users: User[]) => {
    setUsers(users);
  }, []);

  const handleConnect = useCallback(() => {
    const user = getSavedUser();
    if(!user && !socketRef.current) {
      console.log('Show edit user', user, socketRef.current);
      setShowEditUser(true);
      return;
    }

    if(!socketRef.current?.connected) {
      setConnectStatus(ConnectStatus.connecting);
      socketRef.current = io(WEBSOCKETS_HOST, {
        reconnectionAttempts: 10,
        timeout: 10000,
      });
    }

    socketRef.current.on('connect', () => {
      console.log('Connected', socketRef.current?.id);
      emit('join', {room: id, user});
      setSocketId(socketRef.current?.id || '');
    });

    socketRef.current.on('connect_error', (error) => {
      console.log('Connect error', error);
    });

    socketRef.current.io.on('error', (error) => {
      console.log('Error', error);
    });

    socketRef.current.io.on('reconnect_attempt', (attempt) => {
      console.log('Reconnect attempt', attempt);
      if(attempt === 1) setConnectStatus(ConnectStatus.reconnecting);
    });

    socketRef.current.io.on('reconnect_failed', () => {
      console.log('Reconnect attempts failed');
      setConnectStatus(ConnectStatus.error);
    });

    socketRef.current.on('connected', (message) => {
      console.log(`Connected to room ${message.room}`);
      console.log(`Users in room ${message.users.map((user: any) => user.user)}`);
      refreshUsers(message.users);
      setConnectStatus(ConnectStatus.connected);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('Disconnected', reason);
      setConnectStatus(ConnectStatus.reconnecting);
    });

    socketRef.current.on('user-connected', (message) => {
      console.log(`User ${message.user.user} has connected to this room`);
      console.log(`Users in room ${message.users.map((user: any) => user.user)}`);
      refreshUsers(message.users);
    });

    socketRef.current.on('user-disconnected', (message) => {
      console.log(`User ${message.user.user} has disconnected from this room`);
      console.log(`Users in room ${message.users.map((user: any) => user.user)}`);
      refreshUsers(message.users);
    });

    socketRef.current.on('play', (message) => {
      console.log(`User ${message.user.user} plays at ${message.currentTime}`);
      setLastEvent({
        user: message.user,
        event: 'play',
        currentTime: message.currentTime,
      });
      playVideo();
    });

    socketRef.current.on('pause', (message) => {
      console.log(`User ${message.user.user} paused at ${message.currentTime}`);
      setLastEvent({
        user: message.user,
        event: 'pause',
        currentTime: message.currentTime,
      });
      pauseVideo();
    });

    socketRef.current.on('change-time', (message) => {
      console.log(`User ${message.user.user} changed time to ${message.currentTime}`);
      setLastEvent({
        user: message.user,
        event: 'change-time',
        currentTime: message.currentTime,
      });
      changeTime(message.currentTime);
    });

    socketRef.current.on('reaction', (message: any) => {
      console.log(`User ${message.user.user} reacted with ${message.reaction}`);
      addReaction(message.reaction, message.user, message.position, message.size);
    });

    socketRef.current.on('change-user', (message: any) => {
      console.log(`User ${message.user.user} changed user to ${message.user.user}`);
      refreshUsers(message.users);
    });

  }, [changeTime, pauseVideo, playVideo, addReaction, refreshUsers, emit, id]);

  const handleFullscreen = useCallback(() => {
    const fullscreenContainer = videoContainerRef.current;
    if(!fullscreenContainer) return;
    if(!fullscreen) {
      if(fullscreenContainer.requestFullscreen) {
        fullscreenContainer.requestFullscreen({ navigationUI: 'hide' });
        setFullscreen(true);
        window.screen.orientation.lock('landscape').catch(e => console.log(e));
      } if((fullscreenContainer as any).webkitRequestFullscreen) {
        (fullscreenContainer as any).webkitRequestFullscreen({ navigationUI: 'hide' });
        setFullscreen(true);
        window.screen.orientation.lock('landscape').catch(e => console.log(e));
      }
    } else {
      if(document.exitFullscreen) {
        document.exitFullscreen();
        setFullscreen(false);
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
        setFullscreen(false);
      }
    }
  }, [fullscreen]);

  const handleRewind = useCallback(() => {
    const video = videoRef.current;
    if(video) {
      handleChangeTime(video.currentTime - 5);
    }
  }, [handleChangeTime]);

  const handleForward = useCallback(() => {
    const video = videoRef.current;
    if(video) {
      handleChangeTime(video.currentTime + 5);
    }
  }, [handleChangeTime]);

  useEffect(() => {
    // when close fullscreen with browser function like esc/back/etc
    const fullscreenContainer = videoContainerRef.current;
    const handleFullscreenChange = () => {
      if(!(document.fullscreenElement || (document as any).webkitFullscreenElement)) {
        setFullscreen(false);
      }
    };
    fullscreenContainer?.addEventListener('fullscreenchange', handleFullscreenChange);
    fullscreenContainer?.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // control keys
    const handleKeyUp = (e: KeyboardEvent) => {
      e.preventDefault();
      if(document.activeElement?.tagName === 'INPUT') return;
      if(e.key === ' ' || e.code === 'Space') {
        handlePlay();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowLeft') {
        handleRewind();
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        handleForward();
      }
    };
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      fullscreenContainer?.removeEventListener('fullscreenchange', handleFullscreenChange);
      fullscreenContainer?.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePlay, handleForward, handleRewind]);

  const handleLoadedMetadata = () => {
    setLoadedMetadata(true);
    setVideoName(id.split('.').join(' '));
    if(videoRef.current) {
      const pausedTimes = localStorage.getItem('pausedTimes') || '{}';
      const parsedPausedTimes = JSON.parse(pausedTimes);
      videoRef.current.currentTime = Number(parsedPausedTimes[id] || 0) - 5;
    }
    setCurrentTime(videoRef.current?.currentTime ?? 0);
    setDuration(videoRef.current?.duration ?? 0);
    const tracks = videoRef.current?.textTracks || [];
    const newAvailableTracks = [];
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i];
      newAvailableTracks.push(track.language);
    }
    newAvailableTracks.push(SubtitleLang.off);
    setAvailableTracks(newAvailableTracks as SubtitleLang[]);
    const selectedLang = localStorage.getItem('lang') || newAvailableTracks[0];
    handleChangeSubtitles(selectedLang as SubtitleLang);
  };

  const handleTimeUpdate = useCallback(() => {
    setCurrentTime(videoRef.current?.currentTime ?? 0);
  }, []);

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(timeoutRef.current || 0);
    if(videoRef.current?.paused) return;
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleEditUser = useCallback((newUser: string) => {
    saveUser(newUser);
    setUser(newUser);
    setShowEditUser(false);
    if(socketRef.current?.connected) {
      emit('change-user', {user: newUser});
    } else {
      handleConnect();
    }
  }, [handleConnect, emit]);

  const handleEditUserClose = () => {
    setShowEditUser(false);
  };

  const handleReaction = useCallback((name: ReactionType) => {
    const position = Math.floor(Math.random() * 10);
    const size = Math.floor(Math.random() * 10);
    emit('reaction', {
      reaction: name,
      currentTime: videoRef.current?.currentTime,
      user,
      position,
      size,
    });
    addReaction(name, {id: socketId, user}, position, size);
  }, [addReaction, emit, socketId, user]);

  const handleEnded = () => {
    pauseVideo();
  };

  return (
    <div
      className={`relative flex items-center overflow-hidden bg-black ${!showControls ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      // onTouchStart={handleMouseMove}
      ref={videoContainerRef}
    >
      <div className="w-full h-full flex justify-center">
        {!canPlay &&
          <div className="absolute flex items-center justify-center w-full h-full">
            <div className="w-[4rem] h-[4rem] animate-spin border-[0.4rem] border-purple-900/75 border-b-transparent rounded-full">
            </div>
          </div>
        }
        <video
          ref={videoRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
          crossOrigin="anonymous"
          onCanPlay={() => setCanPlay(true)}
          onWaiting={() => setCanPlay(false)}
          onEnded={handleEnded}
        >
          <source src={`${MEDIA_HOST}/media/${id}.mp4`} type="video/mp4" />
          <track src={`${MEDIA_HOST}/media/${id}.es.vtt`} kind="subtitles" srcLang="es" />
          <track src={`${MEDIA_HOST}/media/${id}.en.vtt`} kind="subtitles" srcLang="en" />
        </video>
      </div>
      {reactions.map(reaction => (
        <Reaction
          key={reaction.id}
          id={reaction.id}
          name={reaction.name}
          user={reaction.user}
          position={reaction.position}
          size={reaction.size}
        />
      ))}
      {loadedMetadata && showControls &&
        <div className="absolute top-0 left-0 w-full h-full">
          {videoName &&
            <div className="flex justify-between absolute top-0 left-0 right-0 px-2 py-4 from-transparent to-purple-900/50 bg-gradient-to-t select-none">
              <div className="text-xs">
                {videoName}
              </div>
              {users.length > 0 &&
                <Users
                  socketId={socketId}
                  users={users}
                  currentTime={currentTime}
                  lastEvent={lastEvent}
                  onEditUser={() => setShowEditUser(true)}
                />
              }
            </div>
          }
          <Controls
            currentTime={currentTime}
            duration={duration}
            availableLangs={availableTracks}
            lang={lang}
            play={play}
            fullscreen={fullscreen}
            connectStatus={connectStatus}
            onPlay={handlePlay}
            onChangeTime={handleChangeTime}
            onReleaseTime={handleReleaseTime}
            onConnect={handleConnect}
            onChangeSubtitles={handleChangeSubtitles}
            onFullscreen={handleFullscreen}
            onRewind={handleRewind}
            onForward={handleForward}
            onReaction={handleReaction}
          />
        </div>
      }
      {showEditUser &&
        <EditUser
          user={user}
          onChange={handleEditUser}
          onClose={handleEditUserClose}
        />
      }
    </div>
  );
};
