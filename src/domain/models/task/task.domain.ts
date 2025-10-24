export interface Task {
userId:number,
id:number,
title:string,
completed:boolean
}

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: Error };

