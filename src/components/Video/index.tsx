import { useRef, useState } from 'react';
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
  const [loadedMetadata, setLoadedMetadata] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lang, setLang] = useState(SubtitleLang.off);
  const [showControls, setShowControls] = useState(true);
  const [availableTracks, setAvailableTracks] = useState<SubtitleLang[]>([]);
 
  const handlePlay = (play: boolean) => {
    const video = videoRef.current;
    if(play) {
      video?.play();
    } else {
      video?.pause();
    }
  };

  const handleChangeTime = (time: number) => {
    if(videoRef.current) videoRef.current.currentTime = time;
    console.log('changed time to', videoRef.current?.currentTime);
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

  const handleFullscreen = (fullscreen: boolean) => {

  };

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

  return (
    <div
      className={`relative ${!showControls ? 'cursor-none' : ''}`}
      onMouseMove={handleMouseMove}
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
      {loadedMetadata &&
        <div className="absolute top-0 left-0 w-full h-full">
          <Controls
            currentTime={currentTime}
            duration={duration}
            availableLangs={availableTracks}
            lang={lang}
            onPlay={handlePlay}
            onChangeTime={handleChangeTime}
            onReleaseTime={handleReleaseTime}
            onConnect={handleConnect}
            onChangeSubtitles={handleChangeSubtitles}
            onFullscreen={handleFullscreen}
          />
        </div>
      }
    </div>
  );
};