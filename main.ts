import { MongoClient, ObjectId } from "mongodb";
import { TareaModel ,ProyectoModel ,UsuarioModel } from "./types.ts";
import { fromModelProyecto,fromModelUsuario,fromModelTarea  } from "./utilts.ts";


const MONGO_URL = Deno.env.get("MONGO_URL")

if (!MONGO_URL) {
  console.error("MONGO_URL is not set");
  Deno.exit(1);
}

const client = new MongoClient(MONGO_URL);
await client.connect();
console.info("Connected to MongoDB"); 


const db = client.db("ModelosDeDatos");
const tareaCollection= db.collection<TareaModel>("Tareas");
const usuarioCollection= db.collection<UsuarioModel>("Usuario");
const ProyectoCollection= db.collection<ProyectoModel>("Proyecto");


const handler = async (req: Request): Promise<Response> => {
  const method = req.method; 
  const url = new URL(req.url);
  const path = url.pathname; 

  if (method === "GET") {
    if(path==="/users"){
      const usuarios = await usuarioCollection.find().toArray();
      const usuariosFormatted = usuarios.map(fromModelUsuario); 
      return new Response(JSON.stringify(usuariosFormatted),{status: 200})
    }
    else if(path==="/projects"){
      const proyectos = await ProyectoCollection.find().toArray();
      return new Response(JSON.stringify(proyectos),{status: 200})
      
    }
    else if(path==="/tasks"){
      const tareas = await tareaCollection.find().toArray();
      return new Response(JSON.stringify(tareas),{status: 200})
    }

  }
  else if(method === "POST"){
    if(path==="/users "){

      const user = await req.json();

      if(!user.nombre || !user.email ){
        return new Response ("Bad request",{status: 400});
      }

      const existUser = await usuarioCollection.findOne({ email: user.email });
      if (existUser) {
        return new Response("Email already exists", { status: 409 });
      }

      const {insertedId} = await usuarioCollection.insertOne ({
        nombre: user.nombre,
        email: user.email,
        created_at: new Date(),
      });

      return new Response(
        JSON.stringify({
          nombre: user.nombre,
          email: user.email,
          created_at: new Date(),
          id: insertedId
        }),{
          status: 201
        }
      );
    }
    
    else if(path==="/tasks"){
    const body=await req.json();
    if(!body.title||!body.description||!body.status||!body.due_date){
      return new Response(JSON.stringify({error:"Falta algun dato"}),{status:400});
    }
    const nuevaTarea = {
      title: body.title,
      description: body.description,
      status: body.status,
      created_at: new Date(), // Fecha actual
      due_date: new Date(body.due_date),//Fecha de vencimiento
      projectId: new ObjectId(body.projectId),
    };
   
    const resultado = await tareaCollection.insertOne(nuevaTarea);

    return new Response(
      JSON.stringify({
          id: resultado.insertedId.toString(), // Convertir ObjectId a string
          title: nuevaTarea.title,
          description: nuevaTarea.description,
          status: nuevaTarea.status,
          created_at: nuevaTarea.created_at.toISOString(),
          due_date: nuevaTarea.due_date.toISOString(),
          projectId: nuevaTarea.projectId.toString(),
        }),
      { status: 200 }
    );
  }
  
  else if(path === "/projects"){

    const body = await req.json();

    if (!body.nombre || !body.description || !body.start_date || !body.user_id) {
      return new Response(JSON.stringify({ error: "Campos requeridos: name, description, start_date, user_id."}), { status: 400 });
    }

    const user = await usuarioCollection.findOne({ _id: new ObjectId(body.user_id) });
    if (!user) {
        return new Response(JSON.stringify({ error: "Usuario no encontrado." }), { status: 404 });
    }

    const { insertedId } = await ProyectoCollection.insertOne({
        nombre: body.nombre,
        description: body.description,
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        user_id: new ObjectId(body.user_id)
    });

    return new Response(
        JSON.stringify({
            id: insertedId.toString(),
            name: body.name,
            description: body.description,
            start_date: new Date(body.start_date).toISOString(),
            end_date: null,
            user_id: body.user_id
        }), { status: 201 });

  }
} 

  else if (method === "DELETE") {
    if (path.startsWith("/users")) {

      const id = url.searchParams.get('id');
  
      if (!id) {
        return new Response(
          JSON.stringify({ error: "ID de usuario es requerido" }),
          { status: 400 }
        );
      }
  
      // Validar si el ID es válido
      if (!ObjectId.isValid(id)) {
        return new Response(
          JSON.stringify({ error: "ID no válido" }),
          { status: 400 }
        );
      }
  
      // Crear ObjectId y eliminar el documento
      const objectId = new ObjectId(id);
      const { deletedCount } = await usuarioCollection.deleteOne({ _id: objectId });
  
      if (deletedCount === 0) {
        return new Response(
          JSON.stringify({ error: "Usuario no encontrado" }),
          { status: 404 }
        );
      }
  
      return new Response(
        JSON.stringify({ message: "Usuario eliminado con éxito" }),
        { status: 200 }
      );
    }
    else if(path === "/tasks"){
      const taskId = url.searchParams.get("id");
      if (!taskId) {
          return new Response("ID de tarea requerido", { status: 400 });
      }
      const task = await tareaCollection.findOne({ _id: new ObjectId(taskId) });
      if (!task) {
          return new Response("Tarea no encontrada", { status: 404 });
      }
      const { deletedCount } = await tareaCollection.deleteOne({ _id: new ObjectId(taskId) });

      if (deletedCount === 0) {
          return new Response("Error al eliminar la tarea", { status: 404 });
      }
      return new Response("Tarea eliminada correctamente", { status: 200 });
    }

    else if (path === "/projects") {
      const projectId = url.searchParams.get("id");

      if (!projectId) {
          return new Response("ID de proyecto requerido", { status: 400 });
      }
      const project = await ProyectoCollection.findOne({ _id: new ObjectId(projectId) });

      if (!project) {
          return new Response("Proyecto no encontrado", { status: 404 });
      }
      const { deletedCount } = await ProyectoCollection.deleteOne({ _id: new ObjectId(projectId) });

      if (deletedCount === 0) {
          return new Response("Error al eliminar el proyecto", { status: 404 });
      }
      return new Response("Proyecto eliminado correctamente", { status: 200 });
  }
}

  

  return new Response (JSON.stringify({error: "Ruta no encontrada"}), {status: 404});
}

Deno.serve({ port: 3000 }, handler);
