import { Injectable } from '@angular/core';
import { Archivo } from '../objects/archivo';
import { Grupo } from '../objects/grupo';

@Injectable()
export class SessionService {
	archivo: Archivo = new Archivo();
	archivos: any;
	dependencias :any;
	archivosList :any;
	directorioActual : any;
	grupos: Grupo[];

	public setArchivo(archivo){
		this.archivo = archivo;
	}
	public getArchivo(){
		return this.archivo;
	}
	public setArchivosTree(tree){
		this.archivos = tree;
	}
	public getArchivos(service){
		if(this.archivos!=undefined){
			return this.archivos;
		}
		if(service!==undefined){
			return this.archivos;	
		}		
	}

	public setGrupos(grupos: Grupo[]){
		this.grupos = grupos;
	}

	public getGrupos(){
		return this.grupos;
	}


	public setArchivosList(l){
		this.archivosList=l;
	}
	public getArchivosList(){
		return this.archivosList;
	}
	public getDependencias(){
		return this.dependencias;
	}
	public setDependencias(d){
		this.dependencias = d;
	}
	public reset(){
		this.archivo = new Archivo();
		this.archivos = [];
		this.dependencias = [];
		this.archivosList = [];
		this.grupos = undefined;
	}
	public setDirectorioActual(d){
		this.directorioActual = d;
	}

	public cargarDependencias(arch){
			
			var resultado = this.buildDependenciesTree(arch,[]);
			if(resultado["status"]==="miss"){
				return resultado;
			}
			var list = this.toList(resultado["dependencies"]);
			this.setDependencias(list);
			return resultado;
	}

	//logica necesaria para cargar un archivo. "resuelve las dependencias 'incluir'"
	buildDependenciesTree(pivot,archivosRecorridos){
		var content = pivot.contenido;
		var contentIncludes = this.extractIncludes(content);
		var hijos:any = [];
		var result : any = {};
		var resultObject = {};
		result.id = pivot.id;
		result.nombre = pivot.nombre;
		result.contenido = pivot.contenido;
		for(var i in contentIncludes){
			if(!archivosRecorridos.includes(contentIncludes[i])){
				try{
					var archivo = this.directorioActual.archivos.filter(
					function(a){
						return a.nombre === contentIncludes[i];
					}
					)[0];
					archivosRecorridos.push(pivot.nombre);	
				} catch(err){
					
				}
				if(archivo){
					var resultado_ = this.buildDependenciesTree(archivo,archivosRecorridos);
					if(resultado_["status"]==="ok"){
						hijos.push(resultado_["dependencies"]);						
					} else{
						return resultado_;
					}


				}else {
					resultObject["status"] = "miss";
					resultObject["nombre"] = contentIncludes[i];
					return resultObject;
				}
			}
		}
		result.hijos = hijos;
		resultObject["status"] = "ok";
		resultObject["dependencies"] = result;
		return resultObject;
	} 

	 toList(root){
		var result:any = [];
		result.push(root);
		for(var i in root.hijos){
			var sub = this.toList(root.hijos[i]);
			result  = result.concat(sub);
		}
		return result;
	}

	extractIncludes(contenido){
		var regex = /.*incluir\s*(\w*).*/gm;
		let m;
		var includes: any = [];

		while ((m = regex.exec(contenido)) !== null) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (m.index === regex.lastIndex) {
				regex.lastIndex++;
			}

			// The result can be accessed through the `m`-variable.
			m.forEach((match, groupIndex) => {
				if(groupIndex===1){
					includes.push(match);
				}
			});
		}
		return includes; 
	}
}
