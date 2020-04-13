export class Evaluacion {
  evaluacionId: number;
  cedulaDocente: string;
  fecha: Date;
  nota: number;
  descripcion: string;
  applytoall : boolean;
  workflowstate: string;
  addattempt : boolean;
  attemptnumber : number
  userid : number;
  assignmentid: number;
  assignmentName: string;
  corregido: boolean = false;
  idDocenteQueCorrigio: number = null;
  fechaCorreccion: number = 0;
  esGrupal: boolean;
}

export enum TipoArchivo {
  PRIVADO,
  CURSO,
  COMPARTIDO,
}

export class Archivo {
  id: number;
  nombre: string;
  directorioMatefun?: string;
  moodleFilePath: string;
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
  tipo: TipoArchivo;
  esCompartido : boolean;
  puedeCompartir :boolean;

  constructor(){
  	
  }

}