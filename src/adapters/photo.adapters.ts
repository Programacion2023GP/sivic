import type { Photo } from "../domain/models/photo.domain";

interface RawPhoto {
  albumId: number;
  id: number;
  title: string;
  url: string;
  thumbnailUrl: string;
}

export const adaptPhotos = (raw: RawPhoto[]): Photo[] => {
  return raw.map(p => ({
    albumId: p.albumId,
    id: p.id,
    title: p.title,
    url: p.url,
    thumbnailUrl: p.thumbnailUrl
  }));
};
