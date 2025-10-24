import { create } from "zustand";
import type { Comment } from "../domain/models/comments.domain";
import type { CommentRepository } from "../domain/repositories/comment.repositories";

interface CommentState {
    comments: Comment[];
    loading: boolean;
    error: string | null;
    fetchComments: (repo: CommentRepository) => Promise<void>;
}

export const useCommentStore = create<CommentState>((set) => ({
    comments: [],
    loading: false,
    error: null,
    fetchComments: async (repo: CommentRepository) => {
        set({ loading: true, error: null })
        try {
            const data = await  repo.getAll()
            set({ comments: data, loading: false })
        } catch (error: unknown) {
            let message = "Error fetching comments";

            // Narrowing: si es un Error real
            if (error instanceof Error) {
                message = error.message;
            }

            set({ error: message, loading: false });

        }
    },
}))

// export const useCommentStore = create<CommentState>((set) => ({
//   comments: [],
//   loading: false,
//   error: null,
//   fetchComments: async (repo: CommentRepository) => {
//     set({ loading: true, error: null });
//     try {
//       const data = await repo.getAll();
//       set({ comments: data, loading: false });
//     } catch (err: any) {
//       set({ error: err.message || "Error fetching comments", loading: false });
//     }
//   },
// }));
