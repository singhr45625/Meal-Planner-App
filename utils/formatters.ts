import { format, formatDistance, formatRelative, isToday, isYesterday, isThisWeek } from 'date-fns';

export const formatDate = (date: Date, formatString: string = 'MMM dd, yyyy'): string => {
  return format(date, formatString);
};

export const formatTime = (date: Date): string => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy • HH:mm');
};

export const formatRelativeTime = (date: Date): string => {
  if (isToday(date)) {
    return 'Today';
  } else if (isYesterday(date)) {
    return 'Yesterday';
  } else if (isThisWeek(date)) {
    return format(date, 'EEEE');
  } else {
    return format(date, 'MMM dd');
  }
};

export const formatCookingTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  }
};

export const formatCalories = (calories: number): string => {
  return `${calories.toLocaleString()} cal`;
};

export const formatServings = (servings: number): string => {
  return `${servings} ${servings === 1 ? 'serving' : 'servings'}`;
};