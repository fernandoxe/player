import { useCallback, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ReactionType, SubtitleLang } from '../../interfaces';
import { Controls } from '../Controls';
import { EditUser } from '../EditUser';
import { Reaction } from '../Controls/Reactions/Reaction';

const MEDIA_HOST = process.env.REACT_APP_MEDIA_HOST;
const WEBSOCKETS_HOST = process.env.REACT_APP_WEBSOCKETS_HOST || '/';

export interface VideoProps {
  id: string;
}

/*
::cue {
  background: transparent;
  font-family: 'Inria Sans', sans-serif;
  font-size: 3.7vw;
  // line-height: 2rem;
  text-shadow:
    1px 1px 3px #000,
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000;
}
*/

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
  const [reactions, setReactions] = useState<{id: string; name: ReactionType, user?: string, position?: number}[]>([]);

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
    parsedPausedTimes[id] = Math.floor(videoRef.current?.currentTime || 0);
    localStorage.setItem('pausedTimes', JSON.stringify(parsedPausedTimes));
  }, [id]);
  
  const handlePlay = useCallback((fromKey?: string) => {
    const video = videoRef.current;
    console.log(fromKey, 'paused?', video?.paused);
    if(video?.paused) {
      console.log('handle play play');
      playVideo();
      emit('play', {currentTime: video.currentTime});
    } else {
      console.log('handle play pause');
      pauseVideo();
      emit('pause', {currentTime: video?.currentTime});
    }
  }, [playVideo, pauseVideo]);

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
      console.log('changed time to', videoRef.current?.currentTime);
    }
  }, [changeTime]);

  const handleReleaseTime = useCallback((time: number) => {
    console.log('relesased time at', time);
    emit('change-time', {currentTime: time});
  }, []);

  const handleChangeSubtitles = (lang: SubtitleLang) => {
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

  const addReaction = useCallback((name: ReactionType, user?: string, position?: number) => {
    const id = Math.random() + Date.now() + '';
    const newReaction = {
      id,
      name,
      user,
      position,
    };
    setReactions(prevReactions => [...prevReactions.slice(-19), newReaction]);
  }, []);

  const handleConnect = useCallback(() => {
    const username = localStorage.getItem('username') || '';
    if(!username && !socketRef.current) {
      setShowEditUser(true);
      return;
    }
    if(!socketRef.current) socketRef.current = io(WEBSOCKETS_HOST);

    socketRef.current.on('connect', () => {
      console.log('Connected');
      emit('join', {room: id});
    });

    socketRef.current.on('connected', (message) => {
      console.log(`Connected to room ${message.room}`);
      console.log(`Users in room ${message.usersInRoom.map((user: any) => user.user)}`);
    });

    socketRef.current.on('user-connected', (message) => {
      console.log(`User ${message.user} has connected to this room`);
      console.log(`Users in room ${message.usersInRoom.map((user: any) => user.user)}`);
    });

    socketRef.current.on('user-disconnected', (message) => {
      console.log(`User ${message.user} has disconnected from this room`);
      console.log(`Users in room ${message.usersInRoom.map((user: any) => user.user)}`);
    });

    socketRef.current.on('play', (message) => {
      console.log(`User ${message.user} plays at ${message.currentTime}`);
      playVideo();
    });

    socketRef.current.on('pause', (message) => {
      console.log(`User ${message.user} paused at ${message.currentTime}`);
      pauseVideo();
    });

    socketRef.current.on('change-time', (message) => {
      console.log(`User ${message.user} changed time to ${message.currentTime}`);
      changeTime(message.currentTime);
    });

    socketRef.current.on('reaction', (message: any) => {
      console.log(`User ${message.user} reacted with ${message.reaction}`);
      addReaction(message.reaction, message.user, message.position);
    });
  }, [changeTime, id, pauseVideo, playVideo, addReaction]);

  const emit = (message: string, data?: any) => {
    if(socketRef.current) {
      const username = localStorage.getItem('username') || '';
      socketRef.current.emit(message, {user: username, ...data});
    }
  };

  const handleFullscreen = () => {
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
  };

  const handleRewind = useCallback(() => {
    const video = videoRef.current;
    if(video) {
      handleChangeTime(video.currentTime - 5);
      console.log(video.currentTime);
    }
  }, [handleChangeTime]);

  const handleForward = useCallback(() => {
    const video = videoRef.current;
    if(video) {
      handleChangeTime(video.currentTime + 5);
      console.log(video.currentTime);
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
      console.log('key up', e.key);
      if(e.key === ' ' || e.code === 'Space') {
        handlePlay('from key');
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
    if(videoRef.current) {
      const pausedTimes = localStorage.getItem('pausedTimes') || '{}';
      const parsedPausedTimes = JSON.parse(pausedTimes);
      videoRef.current.currentTime = Number(parsedPausedTimes[id] || 0) - 5;
    } 
    console.log(videoRef.current?.currentTime);
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
    handleChangeSubtitles(newAvailableTracks[0] as SubtitleLang);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(videoRef.current?.currentTime ?? 0);
  };

  const handleMouseMove = () => {
    setShowControls(true);
    clearTimeout(timeoutRef.current || 0);
    timeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  const handleEditUser = (user: string) => {
    localStorage.setItem('username', user);
    setShowEditUser(false);
    handleConnect();
  };

  const handleEditUserClose = () => {
    setShowEditUser(false);
  };

  const handleReaction = (name: ReactionType) => {
    const user = localStorage.getItem('username') || '';
    const position = Math.floor(Math.random() * 3);
    emit('reaction', {
      reaction: name,
      currentTime: videoRef.current?.currentTime,
      user,
      position,
    });
    addReaction(name, user, position);
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
        />
      ))}
      {loadedMetadata && showControls &&
        <div className="absolute top-0 left-0 w-full h-full">
          <Controls
            currentTime={currentTime}
            duration={duration}
            availableLangs={availableTracks}
            lang={lang}
            play={play}
            fullscreen={fullscreen}
            connect={'disconnected'}
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
          onChange={handleEditUser}
          onClose={handleEditUserClose}
        />
      }
    </div>
  );
};