import { UsuarioModel, TareaModel, ProyectoModel } from "./types.ts";
import { Usuario, Tarea, Proyecto } from "./types.ts";


// Convertimos un documento de MongoDB a un Usuario
export const fromModelUsuario = (usuarioDB: UsuarioModel): Usuario => {
    if (!usuarioDB._id) {
        throw new Error("El documento de usuario no tiene un _id válido.");
    }

    return {
        id: usuarioDB._id.toString(),
        nombre: usuarioDB.nombre,
        email: usuarioDB.email,
        created_at: usuarioDB.created_at,
    };
};

// Convertimos un documento de MongoDB a un Proyecto
export const fromModelProyecto = (proyectoDB: ProyectoModel): Proyecto => {
    if (!proyectoDB._id) {
        throw new Error("El documento de proyecto no tiene un _id válido.");
    }


    return {
        id: proyectoDB._id.toString(),
        nombre: proyectoDB.nombre,
        description: proyectoDB.description,
        start_date: proyectoDB.start_date,
        end_date: proyectoDB.end_date,
        user_id: proyectoDB.user_id.toString(), 
    };
};

export const fromModelTarea = (tareaDB: TareaModel): Tarea => {
    if (!tareaDB._id) {
        throw new Error("El documento de tarea no tiene un _id válido.");
    }

    if (!tareaDB.projectId) {
        throw new Error("El documento de tarea no tiene un projectId válido.");
    }

    return {
        id: tareaDB._id.toString(),
        title: tareaDB.title,
        description: tareaDB.description,
        status: tareaDB.status,
        created_at: tareaDB.created_at,
        due_date: tareaDB.due_date,
        projectId: tareaDB.projectId.toString(),
    };
};




