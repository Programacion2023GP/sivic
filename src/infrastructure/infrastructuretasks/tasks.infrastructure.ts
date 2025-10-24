import type { Result, Task } from "../../domain/models/task/task.domain";
import type { TaskRepository } from "../../domain/repositories/task/task.repositories";

const url = 'https://jsonplaceholder.typicode.com'
export class TaskApi implements TaskRepository {
    async getAll(): Promise<Result<Task[]>> {
        try {
            const response = await fetch(`${url}/todos`);
            const data: Task[] = await response.json()
            if (response.ok) {
                return { ok: true, data }
            }
            else {
                return { ok: false, error: new Error(`HTTP error: ${response.status}`) };
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                return { ok: false, error: err }
            } else {
                return { ok: false, error: new Error(String(err)) }
            }
        }

    }
    getTask(): Promise<Result<Task>> {
        throw new Error("Method not implemented.");
    }
    getTaskByUser(): Promise<Result<Task[]>> {
        throw new Error("Method not implemented.");
    }
    getAddTask(): Promise<Task> {
        throw new Error("Method not implemented.");
    }
    getUpdateTask(id: Task["id"], task: Omit<Partial<Task>, "id">): Promise<Result<Task>> {
        throw new Error("Method not implemented.");
    }
    getDeleteTask(id: Task["id"]): Promise<void> {
        throw new Error("Method not implemented.");
    }

}