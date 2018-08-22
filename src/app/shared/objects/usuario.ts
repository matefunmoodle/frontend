export class Configuracion{
	themeEditor: string;
	fontSizeEditor: number;
	argumentoI:boolean;
	argumentoF:boolean;
}

export class Usuario{
	token: string;
	cedula: string;
    nombre: string;
    apellido: string;
    tipo: string;
    configuracion: Configuracion;
}