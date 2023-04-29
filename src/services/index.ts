export const getTimeProgress = (current: number, duration: number) => {
  let currentString = new Date(current * 1000).toISOString().slice(11, 19);
  const durationFormatted = getTimeFormatted(duration);
  return `${currentString.slice(-durationFormatted.length)} / ${durationFormatted}`;
};

export const getTimeFormatted = (time: number) => {
  let timeString = new Date(time * 1000).toISOString().slice(11, 19);
  const [hours, minutes, seconds] = timeString.split(':');
  if(Number(hours) > 0) {
    return `${Number(hours)}:${minutes}:${seconds}`;
  } else {
    return `${Number(minutes)}:${seconds}`;
  }
};

export const getSavedUser = () => {
  return localStorage.getItem('user') || '';
};

export const saveUser = (user: string) => {
  localStorage.setItem('user', user);
};
