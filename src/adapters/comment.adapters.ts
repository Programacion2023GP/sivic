import type { Comment } from "../domain/models/comments.domain";

interface RawComment {
 postId:number,
    id:number,
    name:string,
    email:string,
    body:string,
}
export const adaptComments = (comments:RawComment[]):Comment[]=>{
    return comments.map(it=>({
       postId:it.postId,
        id:it.id,
        name:it.name,
        email:it.email,
        body:it.body
    }));
}


