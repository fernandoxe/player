import { useEffect, useRef, useState } from 'react';
import { ReactionType } from '../../../../interfaces';

export interface ReactionProps {
  id: string;
  name: ReactionType;
  user?: string;
  position?: number;
}

export const Reaction = ({id, name, user, position}: ReactionProps) => {
  const [active, setActive] = useState<boolean>(true);
  const timeout = useRef<NodeJS.Timeout | null>();

  useEffect(() => {
    timeout.current = setTimeout(() => {
      setActive(false);
    }, 3000);

    return () => {
      clearTimeout(timeout.current as NodeJS.Timeout);
    };
  }, []);

  if(!active) {
    return null;
  }

  return(
    <div className={`absolute h-full top-0 left-2 flex items-end animate-bubble select-none`} style={{marginLeft: `${position}vw`}}>
      <div className="flex items-center">
        <div className="text-[3.7vw]">
          {name}
        </div>
        <div className="text-[1.75vw] leading-none bg-purple-900/40 px-1 py-0.5 rounded-sm">
          {user}
        </div>
      </div>
    </div>
  );
};
