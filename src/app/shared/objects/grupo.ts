import { Archivo } from './archivo';
import { Usuario } from './usuario';

export class Grupo {
  anio: number;
  grado: number;
  grupo: string;
  liceoId: number;
  archivos: Archivo[];
  alumnos: Usuario[];
  nombreCurso: string;

  constructor(anio: number, grado: number, grupo: string,liceoId:number, archivos: Archivo[], alumnos:Usuario[], nombreCurso: string){
    this.anio = anio;
    this.grado = grado;
    this.grupo = grupo;
    this.liceoId = liceoId;
    this.archivos = archivos;    
    this.alumnos = alumnos;
    this.nombreCurso = nombreCurso;
  }

}