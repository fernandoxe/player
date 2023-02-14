import { useEffect, useRef, useState } from 'react';
import { SubtitleLang } from '../../interfaces';
import { Controls } from '../Controls';

const MEDIA_HOST = process.env.REACT_APP_MEDIA_HOST;

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
  const [loadedMetadata, setLoadedMetadata] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lang, setLang] = useState(SubtitleLang.off);
  const [showControls, setShowControls] = useState(true);
  const [availableTracks, setAvailableTracks] = useState<SubtitleLang[]>([]);
  const [play, setPlay] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
 
  const handlePlay = () => {
    const video = videoRef.current;
    if(video?.paused) {
      video?.play();
      setPlay(true);
    } else {
      video?.pause();
      setPlay(false);
    }
  };

  const handleChangeTime = (time: number) => {
    if(videoRef.current) videoRef.current.currentTime = time;
    console.log('changed time to', videoRef.current?.currentTime);
    handleMouseMove(); // to show controls on progress change from touch devices
  };

  const handleReleaseTime = (time: number) => {
    console.log('relesased time at', time);
  };

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

  const handleConnect = () => {

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

  useEffect(() => {
    // when close fullscreen with browser function like esc/back/etc
    const fullscreenContainer = videoContainerRef.current;
    const handleFullscreenChange = (e: Event) => {
      if(!(document.fullscreenElement || (document as any).webkitFullscreenElement)) {
        setFullscreen(false);
      }
    };
    fullscreenContainer?.addEventListener('fullscreenchange', handleFullscreenChange);
    fullscreenContainer?.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    // control keys
    const handleKeyUp = (e: KeyboardEvent) => {
      if(e.key === ' ' || e.code === 'Space') {
        console.log('key up space', e.key);
        handlePlay();
      } else if (e.code === 'ArrowLeft' || e.code === 'ArrowLeft') {
        console.log('key up left', e.key);
        const video = videoRef.current;
        if(video) {
          video.currentTime -= 5;
          console.log(video.currentTime);
        }
      } else if (e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        console.log('key up right', e.key);
        const video = videoRef.current;
        if(video) {
          video.currentTime += 5;
          console.log(video.currentTime);
        }
      }
    };
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      fullscreenContainer?.removeEventListener('fullscreenchange', handleFullscreenChange);
      fullscreenContainer?.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleLoadedMetadata = () => {
    setLoadedMetadata(true);
    if(videoRef.current) videoRef.current.currentTime = 8; // TODO: remove
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

  const handleRewind = () => {
    const video = videoRef.current;
    if(video) {
      video.currentTime -= 5;
      console.log(video.currentTime);
    }
  };

  const handleForward = () => {
    const video = videoRef.current;
    if(video) {
      video.currentTime += 5;
      console.log(video.currentTime);
    }
  };

  return (
    <div
      className={`relative flex items-center bg-black ${!showControls ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
      // onTouchStart={handleMouseMove}
      ref={videoContainerRef}
    >
      <div>
        <video
          ref={videoRef}
          onLoadedMetadata={handleLoadedMetadata}
          onTimeUpdate={handleTimeUpdate}
        >
          <source src={`${MEDIA_HOST}/media/${id}.mp4`} type="video/mp4" />
          <track src={`${MEDIA_HOST}/media/${id}.es.vtt`} kind="subtitles" srcLang="es" />
          <track src={`${MEDIA_HOST}/media/${id}.en.vtt`} kind="subtitles" srcLang="en" />
        </video>
      </div>
      {loadedMetadata && showControls &&
        <div className="absolute top-0 left-0 w-full h-full">
          <Controls
            currentTime={currentTime}
            duration={duration}
            availableLangs={availableTracks}
            lang={lang}
            play={play}
            fullscreen={fullscreen}
            onPlay={handlePlay}
            onChangeTime={handleChangeTime}
            onReleaseTime={handleReleaseTime}
            onConnect={handleConnect}
            onChangeSubtitles={handleChangeSubtitles}
            onFullscreen={handleFullscreen}
            onRewind={handleRewind}
            onForward={handleForward}
          />
        </div>
      }
    </div>
  );
};