import { formatDistanceToNow, format, isToday, isYesterday, differenceInMinutes, differenceInHours } from 'date-fns';
import { fr } from 'date-fns/locale';

export const formatRelativeDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const minutesDiff = differenceInMinutes(now, date);
  const hoursDiff = differenceInHours(now, date);
  
  if (minutesDiff < 1) {
    return "À l'instant";
  }
  
  if (minutesDiff < 60) {
    return `Il y a ${minutesDiff} min`;
  }
  
  if (hoursDiff < 24) {
    return `Il y a ${hoursDiff}h`;
  }
  
  if (isToday(date)) {
    return `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  if (isYesterday(date)) {
    return `Hier à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  return formatDistanceToNow(date, { 
    addSuffix: true, 
    locale: fr 
  });
};

export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: fr });
  }
  
  if (isYesterday(date)) {
    return `Hier ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  return format(date, 'dd/MM HH:mm', { locale: fr });
};

export const formatFullDate = (dateString: string): string => {
  const date = new Date(dateString);
  return format(date, "d MMMM yyyy 'à' HH:mm", { locale: fr });
};

export const formatPropertyDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  
  const minutesDiff = differenceInMinutes(now, date);
  const hoursDiff = differenceInHours(now, date);
  
  if (minutesDiff < 1) {
    return "Publié à l'instant";
  }
  
  if (minutesDiff < 60) {
    return `Publié il y a ${minutesDiff} min`;
  }
  
  if (hoursDiff < 24) {
    return `Publié il y a ${hoursDiff}h`;
  }
  
  if (isToday(date)) {
    return `Publié aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  if (isYesterday(date)) {
    return `Publié hier à ${format(date, 'HH:mm', { locale: fr })}`;
  }
  
  return `Publié le ${format(date, 'd MMM yyyy', { locale: fr })}`;
};
