import { ReactComponent as PersonIcon } from '../../icons/person_fill.svg';
import { ReactComponent as PauseIcon } from '../../icons/pause_fill.svg';
import { ReactComponent as PlayIcon } from '../../icons/play_fill.svg';
import { ReactComponent as LineEndCircleIcon } from '../../icons/line_end_circle_fill.svg';
import { User } from '../../interfaces';
import { getTimeFormatted } from '../../services';

export interface UsersProps {
  users: User[];
  socketId: string;
  currentTime: number;
  lastEvent?: {user: User; event: string; currentTime: number};
  onEditUser: () => void;
};

export const Users = ({users, socketId, currentTime, lastEvent, onEditUser}: UsersProps) => {
  const timeColor = Math.floor(currentTime) !== Math.floor(lastEvent?.currentTime || 0) ? 'text-pink-600' : '';
  
  const handleEditUser = (id: string) => {
    if (id === socketId) onEditUser();
  };

  return(
    <div className="flex flex-col gap-1 text-xs">
      {users.map(user => (
        <div
          className="flex gap-1"
          key={user.id}
        >
          <div className="w-4 h-4">
            {user.id === lastEvent?.user.id && lastEvent.event === 'pause' &&
              <div className={`relative`}>
                {currentTime &&
                  <div className={`absolute top-0 left-0 -translate-x-full pr-1 ${timeColor}`}>
                    {getTimeFormatted(lastEvent.currentTime)}
                  </div>
                }
                <PauseIcon />
              </div>
            }
            {user.id === lastEvent?.user.id && lastEvent.event === 'play' &&
              <PlayIcon />
            }
            {user.id === lastEvent?.user.id && lastEvent.event === 'change-time' &&
              <LineEndCircleIcon />
            }
          </div>
          <div className="w-4 h-4">
            <PersonIcon />
          </div>
          <div
            className={`${user.id === socketId ? 'font-bold cursor-pointer' : ''}`}
            onClick={() => handleEditUser(user.id)}
          >
            {user.user}
          </div>
        </div>
      ))}
    </div>
  );
};
