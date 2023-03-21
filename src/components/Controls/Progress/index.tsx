import { ChangeEvent, useEffect, useRef, useState } from 'react';

export interface ProgressProps {
  currentTime: number;
  duration: number;
  onChange: (time: number) => void;
  onRelease: (time: number) => void;
}

export const Progress = ({currentTime, duration, onChange, onRelease}: ProgressProps) => {
  const rangeRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(currentTime);

  useEffect(() => {
    console.log('onRelease change');
    // when slider released
    const handleRelease = (e: Event) => {
      const newValue = Number((e.target as HTMLInputElement).value);
      console.log('release >>>>>>>>>>>', newValue);
      // setValue(newValue);
      onRelease(newValue);
    };

    const range = rangeRef.current;
    range?.addEventListener('change', handleRelease);

    return () => {
      range?.removeEventListener('change', handleRelease);
    };
  }, [onRelease]);

  useEffect(() => {
    setValue(currentTime);
  }, [currentTime]);

  // when slider change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    console.log('change', newValue);
    setValue(newValue);
    onChange(newValue);
  };

  return (
    <>
      <div className="relative flex h-1">
        <div className="absolute flex w-full h-full">
          <div
            className="bg-purple-700"
            style={{width: `${value * 100 / duration}%`}}
          >
          </div>
          <div className="bg-purple-300 grow">
          </div>
        </div>
        <input
          className="w-full appearance-none outline-none z-[1] bg-transparent"
          type="range"
          ref={rangeRef}
          value={value}
          min={0}
          max={duration}
          onChange={handleChange}
        />
      </div>
    </>
  );
};
