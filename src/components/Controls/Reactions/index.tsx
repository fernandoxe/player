import { ReactionType } from '../../../interfaces';

export interface ReactionsProps {
  onReaction: (reaction: ReactionType) => void;
};

export const Reactions = ({onReaction}: ReactionsProps) => {
  const reaction = (name: ReactionType) => {
    onReaction(name);
  };

  return(
    <div className="flex gap-4 text-lg leading-none">
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.love)}
      >
        ❤️
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.hahaha)}
      >
        😂
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.sad)}
      >
        😢
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.pleading)}
      >
        🥺
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.angry)}
      >
        😠
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.cry)}
      >
        😭
      </button>
      <button
        className="outline-none"
        onClick={() => reaction(ReactionType.thinking)}
      >
        🤔
      </button>
    </div>
  );
};
