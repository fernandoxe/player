import { ReactComponent as PlayIcon } from '../../icons/play_fill.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause_fill.svg';
import { ReactComponent as GroupIcon } from '../../icons/group_fill.svg';
import { ReactComponent as SubtitlesIcon } from '../../icons/subtitles_fill.svg';
import { ReactComponent as FullscreenIcon } from '../../icons/fullscreen_fill.svg';
import { ReactComponent as FullscreenExitIcon } from '../../icons/fullscreen_exit_fill.svg';
import { ReactComponent as FirstPageIcon } from '../../icons/first_page_fill.svg';
import { ReactComponent as LastPageIcon } from '../../icons/last_page_fill.svg';
import { useCallback, useState } from 'react';
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
  play: boolean;
  fullscreen: boolean;
  connect: 'connected' | 'connecting' | 'disconnected' | 'error';
  onPlay: () => void;
  onChangeTime: (time: number) => void;
  onReleaseTime: (time: number) => void;
  onChangeSubtitles: (lang: SubtitleLang) => void;
  onConnect: () => void;
  onFullscreen: () => void;
  onRewind: () => void;
  onForward: () => void;
}

export const Controls = ({
  currentTime,
  duration,
  availableLangs,
  lang,
  play,
  fullscreen,
  onPlay,
  onChangeTime,
  onReleaseTime,
  onChangeSubtitles,
  onConnect,
  onFullscreen,
  onRewind,
  onForward,
}: ControlsProps) => {
  const [showSubtitlesMenu, setShowSubtitlesMenu] = useState(false);
  
  const handlePlay = () => {
    onPlay();
  };

  const handleSubtitles = () => {
    const newShowSubtitlesMenu = !showSubtitlesMenu;
    setShowSubtitlesMenu(newShowSubtitlesMenu);
  };

  const handleConnect = () => {
    onConnect()
  };

  const handleFullscreen = () => {
    onFullscreen();
  };

  const handleChangeLang = (lang: SubtitleLang) => {
    setShowSubtitlesMenu(false);
    onChangeSubtitles(lang);
  };

  const handleProgressChange = (time: number) => {
    onChangeTime(time);
  };

  const handleProgressRelease = useCallback((time: number) => {
    onReleaseTime(time);
  }, [onReleaseTime]);

  const handleRewind = () => {
    onRewind();
  };

  const handleForward = () => {
    onForward();
  };

  return (
    <div className="flex flex-col gap-4 px-2 py-4 from-purple-900/80 to-transparent bg-gradient-to-t absolute left-0 bottom-0 w-full select-none cursor-default">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handlePlay}
          >
            {!play &&
              <PlayIcon />
            }
            {play &&
              <PauseIcon />
            }
          </button>
        </div>
        <div className="text-xs">
          {getTime(currentTime, duration)}
        </div>
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handleRewind}
          >
            <FirstPageIcon />
          </button>
        </div>
        <div className="w-6 h-6">
          <button
            className="outline-none"
            onClick={handleForward}
          >
            <LastPageIcon />
          </button>
        </div>
        <div className="w-6 h-6 grow flex justify-end">
          <button
            className="outline-none w-6"
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
            {!fullscreen &&
              <FullscreenIcon />
            }
            {fullscreen &&
              <FullscreenExitIcon />
            }
          </button>
        </div>
      </div>
      {showSubtitlesMenu &&
        <div className="absolute bottom-[3.25rem] right-0">
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
