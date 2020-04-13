import { Grupo } from './grupo';

const studentRoles = ["student"];
const teacherRoles = ["teacher","editingteacher","manager"];

export class Configuracion{
	themeEditor: string;
	fontSizeEditor: number;
	argumentoI:boolean;
    argumentoF:boolean;
    
    /*
    constructor (conf) {
        this.themeEditor = conf.themeEditor;
        this.fontSizeEditor = conf.fontSizeEditor;
        this.argumentoI = conf.argumentoI;
        this.argumentoF = conf.argumentoF;
    }
    */
}

export class MoodleRoleDTO {
	roleid: number;
	name: string;
    shortname: string;
    constructor(rol){
        this.roleid = rol.roleid;
        this.name = rol.name;
        this.shortname = rol.shortname;
    }
}

export class GrupoDTO {
    grupoId: number;
    grupo: string;
    nombreCurso: string;
    constructor (grp){
        this.grupoId = grp.grupoId;
        this.grupo = grp.grupo;
        this.nombreCurso = grp.nombreCurso;
    }
}

export class MoodleCourseDTO{
    id: number;
    fullname: string;
    shortname: string;
    roles : MoodleRoleDTO[];
    grupos : GrupoDTO[];
    constructor (course){
        this.id = course.id;
        this.fullname = course.fullname;
        this.shortname = course.shortname;
        this.roles = !course.roles ? [] : 
                     course.roles.map(r => new MoodleRoleDTO(r));
        this.grupos = !course.grupos ? [] : 
            course.grupos.map(r => new GrupoDTO(r));
    }
}

export class Usuario{
    moodleUserId: number;
	token: string;
	cedula: string;
    nombre: string;
    apellido: string;
    tipo: string;
    configuracion: Configuracion;
    todosLosCursos: MoodleCourseDTO[];
    archivos? : any[];
    gruposParaCorreccion: Grupo[];
    alumnosParaCorreccion: any;
    
    constructor(currentUser: any){
        this.moodleUserId = currentUser.moodleUserId;
        this.token = currentUser.token;
        this.cedula = currentUser.cedula;
        this.nombre = currentUser.nombre;
        this.apellido = currentUser.apellido;
        this.tipo = currentUser.tipo;        
        this.todosLosCursos = !currentUser.todosLosCursos ? [] :
                              currentUser.todosLosCursos.map( c => new MoodleCourseDTO(c) );

        this.configuracion = new Configuracion ();
        this.configuracion.argumentoF = currentUser.configuracion ? currentUser.configuracion.argumentoF : false;
        this.configuracion.argumentoI = currentUser.configuracion ? currentUser.configuracion.argumentoI : false;
        this.configuracion.fontSizeEditor = currentUser.configuracion ? currentUser.configuracion.fontSizeEditor : 12;
        this.configuracion.themeEditor = currentUser.configuracion ? currentUser.configuracion.themeEditor : 'dracula';
        this.gruposParaCorreccion = currentUser.gruposParaCorreccion ? currentUser.gruposParaCorreccion : null;
        this.alumnosParaCorreccion = currentUser.alumnosParaCorreccion ? currentUser.alumnosParaCorreccion : null;
    }

    static getUser() : Usuario{
        const user = JSON.parse(localStorage.getItem('currentUser'));
        return user ? new Usuario(user) : undefined;
    }

    static getGruposParaCorreccion() : Grupo[]{
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const usuario:Usuario =  user ? new Usuario(user) : undefined;
        return !!usuario && !!usuario.gruposParaCorreccion ? usuario.gruposParaCorreccion : undefined;
    }

    setGruposParaCorreccion (grupos: Grupo[]){
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const usuario:Usuario =  user ? new Usuario(user) : undefined;
        if (!!usuario) {
            console.log ('guarda grupos para correccion')
            usuario.gruposParaCorreccion = grupos;
            localStorage.setItem ('currentUser', JSON.stringify(usuario));
        }
    }

    setAlumnosParaCorreccion (alumnos: any){
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const usuario:Usuario =  user ? new Usuario(user) : undefined;
        if (!!usuario) {
            console.log ('guarda alumnos para correccion')
            usuario.alumnosParaCorreccion = alumnos;
            localStorage.setItem ('currentUser', JSON.stringify(usuario));
        }
    }

    esAlumno() : boolean{
        if (this.esAdmin() || this.esAdminLiceo())
            return false;
        return this.checkForRolesMatch(studentRoles);
    }
    
    esDocente() : boolean{
        if (this.esAdmin() || this.esAdminLiceo())
            return false;
        return this.checkForRolesMatch(teacherRoles);
    }

    esAdmin() : boolean{
        return this.tipo == "admin";
    }

    esAdminLiceo() : boolean{
        return this.tipo == "adminliceo";
    }

    getCursosConRolDocente() : MoodleCourseDTO[]{
        return this.todosLosCursos.filter (
            (c: MoodleCourseDTO) => c.roles.some(
            r => teacherRoles.some( opt => r.shortname===opt || r.name===opt)
        ));
    }

    checkForRolesMatch(userRoles){
        return this.todosLosCursos.some(
            c => c.roles.some (
                r => userRoles.some(
                    opt => r.shortname===opt || r.name===opt)));
    }

    cursosQueSoyAlumno() : MoodleCourseDTO[] {
        if (!this.todosLosCursos)
            return [];
        const options = ["student"];
        return this.todosLosCursos.filter (c => c.roles.some (r => options.some (opt => r.shortname===opt || r.name===opt )));
    }

}