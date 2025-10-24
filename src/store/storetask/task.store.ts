import { create } from "zustand";
import type { Task } from "../../domain/models/task/task.domain";
import type { TaskRepository } from "../../domain/repositories/task/task.repositories";


interface TaskStore {
    tasks:Task[],
    loading:boolean,
    error:string | null,
    fetchTasks :(repo:TaskRepository)=>Promise<void>,
}

export const useTaskStore = create<TaskStore>((set)=>({
    tasks:[],
    loading:false,
    error:null,
    fetchTasks:async(repo:TaskRepository) => {
        set({loading:true})
        try {
            const data = await repo.getAll()
            if (data.ok ==true) {
                set({tasks:data.data,loading:false})
            }
            set({loading:false})
        } catch (error:unknown) {
            let message = "";
            if (error instanceof Error) {
            message = error.message
            }
            set({error:message,loading:false})
        }
    },
}))