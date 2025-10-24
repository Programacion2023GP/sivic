import { adaptComments } from "../adapters/comment.adapters";
import type { Comment } from "../domain/models/comments.domain";
import type { CommentRepository } from "../domain/repositories/comment.repositories";

export class CommentApi implements CommentRepository {
    async getAll(): Promise<Comment[]> {
        const res = await fetch("https://jsonplaceholder.typicode.com/comments");
        const data = await res.json()
        return adaptComments(data)
    }
}