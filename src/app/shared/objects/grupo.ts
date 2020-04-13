import { Archivo } from './archivo';
import { Usuario } from './usuario';

export class Grupo {
  anio: number;
  grado: number;
  grupo: string;
  liceoId: number;
  archivos: Archivo[];
  alumnos: Usuario[];

  constructor(anio: number, grado: number, grupo: string,liceoId:number, archivos: Archivo[], alumnos:Usuario[]){
    this.anio = anio;
    this.grado = grado;
    this.grupo = grupo;
    this.liceoId = liceoId;
    this.archivos = archivos;    
    this.alumnos = alumnos;  	
  }

}