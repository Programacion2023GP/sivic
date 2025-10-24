import type { Comment } from "../models/comments.domain";

export interface CommentRepository {
    getAll():Promise<Comment[]>
}