import { API_URL } from './client';
import { ApiError, problemText } from './request';
import type { Asset, Crop, Ratio } from './types';

export const RATIO_LABELS: Record<Ratio, string> = {
  square: '1:1 Square',
  portrait: '4:5 Feed',
  landscape: '1.91:1 Landscape',
  story: '9:16 Story',
};
const SHAPES: Record<Ratio, number> = { square: 1, portrait: 4 / 5, landscape: 1200 / 628, story: 9 / 16 };

/** Address of an image file. `v` changes when a crop changes, so browsers fetch the new one. */
export const assetFileUrl = (accountId: string, asset: Asset, file: Ratio | 'original') =>
  `${API_URL}/v1/ad-accounts/${accountId}/assets/${asset.id}/file/${file}?v=${encodeURIComponent(asset.updatedAt)}`;

export async function uploadAsset(accountId: string, file: File): Promise<Asset> {
  const form = new FormData();
  form.append('file', file);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/v1/ad-accounts/${accountId}/assets`, {
      method: 'POST',
      body: form,
      credentials: 'include',
    });
  } catch {
    throw new ApiError('Upload failed. Check your connection and try again.', 0);
  }
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(problemText(body), response.status);
  return body as Asset;
}

/** Largest crop of this shape centred in the image (same rule as the API). */
export function centreCrop(width: number, height: number, ratio: Ratio): Crop {
  const shape = SHAPES[ratio];
  let cropWidth = width;
  let cropHeight = Math.round(width / shape);
  if (cropHeight > height) {
    cropHeight = height;
    cropWidth = Math.round(height * shape);
  }
  return {
    left: Math.floor((width - cropWidth) / 2),
    top: Math.floor((height - cropHeight) / 2),
    width: cropWidth,
    height: cropHeight,
  };
}

export const shapeOf = (ratio: Ratio) => SHAPES[ratio];
