import { adaptPhotos } from "../adapters/photo.adapters";
import type { Photo } from "../domain/models/photo.domain";
import type { PhotoRepository } from "../domain/repositories/Photo.repositories";

export class PhotoAPI implements PhotoRepository {
 async  getAll():Promise<Photo[]>{
    const res = await fetch("https://jsonplaceholder.typicode.com/photos");
    const data = await res.json();
     return adaptPhotos(data);
  }
  // async getAll(): Promise<Photo[]> {
  //   const res = await fetch("https://jsonplaceholder.typicode.com/photos");
  //   const data = await res.json();
  //   return adaptPhotos(data);
  // }

}
