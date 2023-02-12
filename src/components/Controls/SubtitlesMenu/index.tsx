import { SubtitleLang } from '../../../interfaces';

export interface SubtitlesMenuProps {
  availableLangs: SubtitleLang[];
  lang: SubtitleLang;
  onChange: (lang: SubtitleLang) => void;
}

export const SubtitlesMenu = ({availableLangs, lang, onChange}: SubtitlesMenuProps) => {

  const handleSelectSubtitle = (selected: SubtitleLang) => {
    onChange(selected);
  };
  
  return (
    <div className="flex flex-col bg-purple-900 bg-opacity-50">
      {availableLangs.map(langItem =>
        <div
          key={langItem}
          className={`px-4 hover:bg-purple-900 hover:bg-opacity-100 ${lang === langItem ? 'bg-purple-900 bg-opacity-75' : ''}`}
          onClick={() => handleSelectSubtitle(langItem)}
        >
          {langItem}
        </div>
      )}
    </div>
  );
};
