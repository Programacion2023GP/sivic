import type { Photo } from "../domain/models/photo.domain";
import type { PhotoRepository } from "../domain/repositories/Photo.repositories";


export const getPhotos = async (repo: PhotoRepository ): Promise<Photo[]> => {
  return await repo.getAll();
};
