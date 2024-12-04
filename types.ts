import { ObjectId, OptionalId } from "mongodb";

export type Usuario={
    id:string;
    nombre: string;
    email: string;
    created_at: Date;
}
export type UsuarioModel=OptionalId<{
    nombre: string;
    email: string;
    created_at: Date;

}>
export type Proyecto={
    id: string;
    nombre: string;
    description: string;
    start_date: Date;
    end_date: Date;
    user_id: string;
}
export type ProyectoModel=OptionalId<{
    nombre: string;
    description: string;
    start_date: Date;
    end_date: Date;
    user_id: ObjectId;
}>

export type Tarea={
    id:string;
    title: string;
    description: string;
    status: string;
    created_at: Date;
    due_date: Date;
    projectId: string;
}

export type TareaModel=OptionalId<{
    title: string;
    description: string;
    status: string;
    created_at: Date;
    due_date: Date;
    projectId: ObjectId;
}>


