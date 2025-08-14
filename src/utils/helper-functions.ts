export const formatDateForLocal = (date: Date) => {
  return date.toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
  });
};

export const formatToShortDate = (time: Date): string => {
  const year = time.getFullYear();
  const month = String(time.getMonth() + 1).padStart(2, '0');
  const day = String(time.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
