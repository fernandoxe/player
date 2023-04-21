import { ReactionType } from '../../../interfaces';

export interface ReactionsProps {
  onReaction: (reaction: ReactionType) => void;
};

export const Reactions = ({onReaction}: ReactionsProps) => {
  const reaction = (name: ReactionType) => {
    onReaction(name);
  };

  return(
    <div className="flex gap-4 text-lg">
      <button
        onClick={() => reaction(ReactionType.love)}
      >
        ❤️
      </button>
      <button
        onClick={() => reaction(ReactionType.hahaha)}
      >
        😂
      </button>
      <button
        onClick={() => reaction(ReactionType.sad)}
      >
        😢
      </button>
      <button
        onClick={() => reaction(ReactionType.pleading)}
      >
        🥺
      </button>
      <button
        onClick={() => reaction(ReactionType.angry)}
      >
        😠
      </button>
      <button
        onClick={() => reaction(ReactionType.cry)}
      >
        😭
      </button>
      <button
        onClick={() => reaction(ReactionType.thinking)}
      >
        🤔
      </button>
    </div>
  );
};
