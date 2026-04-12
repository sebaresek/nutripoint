export const getBannerUrl = (id) => {
  const baseUrl = import.meta.env.VITE_DRIVE_BASE_URL;
  if (!id) return '';
  return `${baseUrl.trim()}${id.trim()}`;
};