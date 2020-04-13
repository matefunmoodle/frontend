export class Evaluacion{
  evaluacionId: number;
  cedulaDocente: string;
  fecha: Date;
  nota: number;
  descripcion: string;
}

export class Archivo {
  id: number;
  nombre: string;
  contenido: string;
  fechaCreacion: Date;
  cedulaCreador: string;
  editable: boolean;
  padreId: number;
  archivoOrigenId: number;
  archivos: Archivo[];
  directorio :boolean;
  estado: string;
  eliminado:boolean;
  evaluacion: Evaluacion;
  
  constructor(){
  	
  }

}