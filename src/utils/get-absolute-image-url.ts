import { getBaseURL } from './get-base-url';

export const getAbsoluteImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const normalized = path.startsWith('/') ? path.slice(1) : path;
  return `${getBaseURL()}/${normalized}`;
};

/** Resolves product image URL - handles both relative filenames and absolute URLs in DB */
export const getProductImageUrl = (url: string | null | undefined) => {
  if (!url) return null;
  const path =
    url.startsWith('http://') || url.startsWith('https://') ? url : `media/products/${url}`;
  return getAbsoluteImageUrl(path);
};
