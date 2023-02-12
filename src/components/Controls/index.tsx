import { ReactComponent as PlayIcon } from '../../icons/play_fill.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause_fill.svg';
import { ReactComponent as GroupIcon } from '../../icons/group_fill.svg';
import { ReactComponent as SubtitlesIcon } from '../../icons/subtitles_fill.svg';
import { ReactComponent as FullscreenIcon } from '../../icons/fullscreen_fill.svg';
import { ReactComponent as FullscreenExitIcon } from '../../icons/fullscreen_exit_fill.svg';
import { useState } from 'react';
import { SubtitlesMenu } from './SubtitlesMenu';
import { SubtitleLang } from '../../interfaces';
import { Progress } from './Progress';

const getTime = (current: number, duration: number) => {
  let currentString = new Date(current * 1000).toISOString().slice(11, 19);
  let durationString = new Date(duration * 1000).toISOString().slice(11, 19);
  if(durationString.startsWith('00:0')) {
    currentString = currentString.slice(4);
    durationString = durationString.slice(4);
  } else if(durationString.startsWith('00:')) {
    currentString = currentString.slice(3);
    durationString = durationString.slice(3);
  } else if(durationString.startsWith('0')) {
    currentString = currentString.slice(1);
    durationString = durationString.slice(1);
  }
  return `${currentString} / ${durationString}`;
}

export interface ControlsProps {
  currentTime: number;
  duration: number;
  availableLangs: SubtitleLang[];
  lang: SubtitleLang;
  onPlay: (play: boolean) => void;
  onChangeTime: (time: number) => void;
  onReleaseTime: (time: number) => void;
  onChangeSubtitles: (lang: SubtitleLang) => void;
  onConnect: () => void;
  onFullscreen: (fullscreen: boolean) => void;
}

export const Controls = ({
  currentTime,
  duration,
  availableLangs,
  lang,
  onPlay,
  onChangeTime,
  onReleaseTime,
  onChangeSubtitles,
  onConnect,
  onFullscreen
}: ControlsProps) => {
  const [isPLay, setIsPlay] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(true);
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  
  const handlePlay = () => {
    const newIsPlay = !isPLay;
    setIsPlay(newIsPlay);
    onPlay(!newIsPlay);
  };

  const handleSubtitles = () => {
    const newShowSubtitlesMenu = !showSubtitlesMenu;
    setShowSubtitlesMenu(newShowSubtitlesMenu);
  };

  const handleConnect = () => {
    onConnect()
  };

  const handleFullscreen = () => {
    const newIsFullscreen = !isFullscreen;
    setIsFullscreen(newIsFullscreen);
    onFullscreen(!newIsFullscreen);
  };

  const handleChangeLang = (lang: SubtitleLang) => {
    setShowSubtitlesMenu(false);
    onChangeSubtitles(lang);
  };

  const handleProgressChange = (time: number) => {
    onChangeTime(time);
  };

  const handleProgressRelease = (time: number) => {
    onReleaseTime(time);
  };

  return (
    <div className="flex flex-col gap-2 p-2 bg-purple-900 bg-opacity-30 absolute left-0 bottom-0 w-full select-none">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handlePlay}
          >
            {isPLay &&
              <PlayIcon />
            }
            {!isPLay &&
              <PauseIcon />
            }
          </button>
        </div>
        <div className="grow text-xs">
          {getTime(currentTime, duration)}
        </div>
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handleConnect}
          >
            <GroupIcon />
          </button>
        </div>
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handleSubtitles}
          >
            <SubtitlesIcon />
          </button>
        </div>
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handleFullscreen}
          >
            {isFullscreen &&
              <FullscreenIcon />
            }
            {!isFullscreen &&
              <FullscreenExitIcon />
            }
          </button>
        </div>
      </div>
      {showSubtitlesMenu &&
        <div className="absolute bottom-10 right-0">
          <SubtitlesMenu
            availableLangs={availableLangs}
            lang={lang}
            onChange={handleChangeLang}
          />
        </div>
      }
      <div>
        <Progress
          currentTime={currentTime}
          duration={duration}
          onChange={handleProgressChange}
          onRelease={handleProgressRelease}
        />
      </div>
    </div>
  );
};
