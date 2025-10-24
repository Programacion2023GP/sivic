import type { Result, Task } from "../../models/task/task.domain";

export interface TaskRepository {
    getAll(): Promise<Result<Task[]>>,
    getTask ():Promise<Result<Task>>,
    getTaskByUser ():Promise<Result<Task[]>>,
    getAddTask ():Promise<Task>,
    getUpdateTask (id:Task['id'],task:Omit<Partial<Task>,'id'>):Promise<Result<Task>>,
    getDeleteTask (id:Task['id']):Promise<void>,
}