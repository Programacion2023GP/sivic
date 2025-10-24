import type { Photo } from "../models/photo.domain";

export interface PhotoRepository {
  getAll(): Promise<Photo[]>;
}
