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
      return new Response(JSON.stringify(usuarios), {status: 200});
    }
    else if(path==="/proyects"){
      const proyectos = await ProyectoCollection.find().toArray();
      return new Response(JSON.stringify(proyectos),{status: 200})
      
    }
    else if(path==="/tareas"){
      const tareas = await tareaCollection.find().toArray();
      return new Response(JSON.stringify(tareas),{status: 200})
    }
    else if (path === "/tasks/by-project") {
      const projectId = url.searchParams.get("project_id");
      if (!projectId) {
        return new Response(JSON.stringify({ error: "El parámetro 'project_id' es requerido" }), { status: 400 });
      }
      const tareas = await tareaCollection.find({ projectId: new ObjectId(projectId) }).toArray();
      return new Response(JSON.stringify(tareas), { status: 200 });
  }

  
}
  

else if(method === "POST"){
  
}

else if (method === "DELETE") {}



  return new Response (JSON.stringify({error: "Ruta no The requested resource was not found."}), {status: 404});
}

Deno.serve({ port: 3000 }, handler)