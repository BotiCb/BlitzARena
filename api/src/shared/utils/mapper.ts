export const isObjectId = (id: string): boolean => {
  return /^[a-fA-F0-9]{24}$/.test(id);
};

export const extractGameIdFromUrl = (url: string): string => {
  const regex = /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
  const match = url.match(regex);
  return match ? match[0] : null;
};
