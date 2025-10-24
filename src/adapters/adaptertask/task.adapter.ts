import type { Task } from "../../domain/models/task/task.domain";

interface RawTask {
    userId: number,
    id: number,
    title: string,
    completed: boolean
}


export const adaptTasks = (tasks: RawTask[]): Task[] => {
    return tasks.map(it=>({
        completed:it.completed,
        id:it.id,
        title:it.title,
        userId:it.userId
    }))
}