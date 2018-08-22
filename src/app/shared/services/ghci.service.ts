import { Injectable,ViewChild,ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs/Rx';
import { WebsocketService } from './websocket.service';
import { AuthenticationService } from './authentication.service';
import { GHCI_URL } from '../config';


declare var $:any;
declare var that :any ;
const regex = /^color (errores|input|output|logs) (\d)$/g;

import 'tippy.js/dist/tippy';

@Injectable()
export class GHCIService {
	public messages: Subject<any> = new Subject<any>();
	private connection = undefined;
	private cons = undefined;
	private modoAvanzado: boolean = false;     // indica si debe mostrarse todo lo que ocurre en el intérprete.
	private clear:boolean = false;
	private error :string ="";
	private warnings: any = [];
	private codemirrorRef :any = null;
	private warningStepReaded :number = 0;
	private waitingForError : boolean = false;
	private waitingForWarning : boolean = false;
	private waitingForWarning2 : boolean = false;
	private warningText :string = "";
	private lastError : number = -1;
	private lastWarning :number = -1;

	private console_error_class : string = "jqconsole-asd";

	consoleBuffer = [];

	constructor(private authService:AuthenticationService,private router: Router){
		console.log("contructor ghci");
		this.conectarWS(GHCI_URL, authService.getUser().cedula, authService.getToken());
		setInterval( this.checkConnection.bind(this), 5000);	
		setInterval( this.doPing.bind(this), 30000);	
	}

	setCodemirrorRef(instance){
		this.codemirrorRef = instance;
	}

	clearWarnings(){
		this.warnings = [];
	}

	getWarnings(){
		return this.warnings;
	}

	loadFile(fileId, dependencias) {
		this.waitingForWarning = true;
		var message = {
			'token': this.authService.getToken(),
			'load': fileId,
			'dependencias' :[]

		};
		for(var i in dependencias){
			message.dependencias.push(dependencias[i]);
		};
		this.connection.send(JSON.stringify(message));
	}
	reiniciarInterprete(){
		var message = {
			'token': this.authService.getToken(),
			'restart': ''
		};
		console.log(message);
		this.connection.send(JSON.stringify(message));
	}

	regex: string  = '/(<svg.*\s*.*<\/svg>)/g';
	
	consoleRef:any;

	conectarWS(wsUrl, cedula, token){
		if(cedula && token && (!this.connection || this.connection.readyState == WebSocket.CLOSED)){
			this.connection = new WebSocket(wsUrl+"/"+cedula+"/"+token);

			this.connection.onopen = function(){
				console.log('Conexión con web socket exitosa');
			}
			this.connection.onclose = function(reason){
				//Codigo que indica la falta de permisos (sesion expirada por ejemplo)
				if(reason.code == 1008){
					this.router.navigate(['/login']);
				}
				console.log('Conexión con web socket cerrada',reason);
			}.bind(this)
			this.connection.onmessage = this.onMessage.bind(this);
		}
	}

	desconectarWS(){
		if(this.connection){
			this.connection.close();
		}
	}

	logConsole(text){
		if(this.consoleRef){
			this.consoleRef.Write(text, 'jqconsole-logs'); 
		}else{
			this.consoleBuffer.unshift({text: text, type:'jqconsole-logs'})
			setTimeout(this.checkConsole.bind(this),100);
		}
	}

	outputConsole(text){
		if(this.consoleRef){
			this.consoleRef.Write(text, 'jqconsole-output'); 
		}else{
			this.consoleBuffer.unshift({text: text, type:'jqconsole-output'})
			setTimeout(this.checkConsole.bind(this),100);
		}
	}

	errorConsole(text){
		if(this.consoleRef){
			this.consoleRef.Write(text, 'jqconsole-errors'); 
		}else{
			this.consoleBuffer.unshift({text: text, type:'jqconsole-errors'})
			setTimeout(this.checkConsole.bind(this),100);
		}
	}
	hayError(text){
		var line = -1;
		if(this.waitingForError){
			var line = this.lastError;
			if(this.codemirrorRef!==null){
				var makeMarker = function() {
					var marker = document.createElement("div");
					marker.id = "error_" + line.toString();
					marker.style.width = "15px";
					marker.title = JSON.parse(text).resultado.split("OUT")[1].trim();
					marker.style.height = "15px";
					marker.style.marginLeft = "-5px";
					marker.style.cursor = "pointer";
					marker.style["background-image"] = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAHlBMVEW7AAC7AACxAAC7AAC7AAAAAAC4AAC5AAD///+7AAAUdclpAAAABnRSTlMXnORSiwCK0ZKSAAAATUlEQVR42mWPOQ7AQAgDuQLx/z8csYRmPRIFIwRGnosRrpamvkKi0FTIiMASR3hhKW+hAN6/tIWhu9PDWiTGNEkTtIOucA5Oyr9ckPgAWm0GPBog6v4AAAAASUVORK5CYII=')";
					marker.innerHTML = "<a href='@' title='cuidado , advertencia matefun'></a>";
					return marker;
				}
				this.codemirrorRef.setGutterMarker(line, "breakpoints", makeMarker());
				this.waitingForError = false;
				this.lastError = -1;
			}
		}else {
			try{
				var line = Number(JSON.parse(text).resultado.split("en línea")[1].split(",")[0].trim())-1;
				this.waitingForError = true;	
				this.lastError = line;

			}catch(err){
			}
			return false;

		}

	}
	
	resetGutters(){
		if(this.codemirrorRef!==null){
			this.codemirrorRef.clearGutter("breakpoints");
		}
	}
	
	hayWarnings(text){
		
		var line = -1;
		var m = JSON.parse(text);
		
		if(this.warningStepReaded===1){
			try{
				var warningText2 = m.resultado.split("OUT")[1].trim();
				this.warningStepReaded = 2;
				this.warningText = this.warningText + '\n\n' +  warningText2;

				var line = this.lastWarning;
				var title = this.warningText;

				var columna = title.split("columna:")[1].split("}")[0];
				var warningTextToShow = title.split("}")[1];

				var warningFinalText = "En columna " + columna + ": " + warningTextToShow;

				if(this.codemirrorRef!==null){
					var makeMarker = function() {
						var marker = document.createElement("div");
						marker.style.width = "15px";
						marker.style.height = "15px";
						marker.style.marginLeft = "-5px";
						marker.style.cursor = "pointer";
						marker.innerHTML = "<a href='@' title='cuidado , advertencia matefun'></a>";
						marker.title = warningFinalText;
						marker.style["background-image"] = "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAANlBMVEX/uwDvrwD/uwD/uwD/uwD/uwD/uwD/uwD/uwD6twD/uwAAAADurwD2tQD7uAD+ugAAAAD/uwDhmeTRAAAADHRSTlMJ8mN1EYcbmiixgACm7WbuAAAAVklEQVR42n3PUQqAIBBFUU1LLc3u/jdbOJoW1P08DA9Gba8+YWJ6gNJoNYIBzAA2chBth5kLmG9YUoG0NHAUwFXwO9LuBQL1giCQb8gC9Oro2vp5rncCIY8L8uEx5ZkAAAAASUVORK5CYII=')";
						marker.innerHTML = "";
						return marker;
					}
					this.codemirrorRef.setGutterMarker(line, "breakpoints", makeMarker());
				}

			}catch(err){

			}
		}

		if(this.warningStepReaded===0){

			try{

				var line = m.resultado.split("OUTAdvertencia:")[1].trim().split("línea:")[1].split(" ")[1]-1;
				this.lastWarning = line;
				this.warnings.push(line);
				var warningText = m.resultado.split("OUTAdvertencia:")[1].trim();
				this.warningStepReaded = 1;
				this.warningText = warningText;
				if(this.waitingForWarning){

					this.outputConsole('El programa contiene advertencias\n');
					this.waitingForWarning = false;	
				}
				

			} catch(err){

			}

		}

		
	}

	onMessage(e){
		if(this.modoAvanzado){
			this.logConsole('Respuesta: ' + e.data + '\n');
		}
		if(this.clear){
			this.clearConsole();
		}
		var server_message = e.data;

		if(this.hayError(server_message)){
			this.error = "Error";
		} else {
			this.error = "";
		}
		
		this.hayWarnings(server_message);

		if(this.warningStepReaded==2){
			this.warningStepReaded = 0;
			return;
		} else if(this.warningStepReaded==1){
			return;
		}

		var json_server_message = JSON.parse(server_message);
		if(json_server_message.tipo=='salida'){


			var line = json_server_message.resultado.trim();
			if(line.startsWith("OUT")){
				this.outputConsole(line.substring(3) + '\n');     
			}else if(line.startsWith("IN")){
				var promptText = line.substring(3);
				if(this.consoleRef===undefined){
					this.renderConsole();
				}
				this.consoleRef.SetPromptLabel(promptText);
				this.consoleRef.SetPromptText('');
				this.startPrompt.bind(this);
				this.startPrompt();
			}

			

		} else if (json_server_message.tipo=='error'){
			if(this.modoAvanzado){
				this.errorConsole(json_server_message.resultado  + '\n');	
			}
		} else if (json_server_message.tipo == 'prompt'){
			// console.log(json_server_message.resultado);
			// console.log(this.consoleRef);
			// console.log(this.consoleRef.SetPromptLabel);
			// this.consoleRef.SetPromptLabel.bind(this);
			this.consoleRef.SetPromptLabel(json_server_message.resultado+'>');
			this.consoleRef.SetPromptText('');
			this.startPrompt.bind(this);
			this.startPrompt();
			// console.log(x);
		}else if (json_server_message.tipo == 'canvas' || json_server_message.tipo == 'animacion' || json_server_message.tipo == 'graph'){
			document.getElementById("FigurasBtn").click()
			this.focusConsole();
			this.messages.next(json_server_message);
		}

	}

	checkConsole(){
		if(this.consoleRef){
			while(this.consoleBuffer.length > 0){
				var bufferedMessage = this.consoleBuffer.pop();
				this.consoleRef.Write(bufferedMessage.text,bufferedMessage.type);
			}
		}else{
			setTimeout(this.checkConsole.bind(this),500);
		}
	}

	checkConnection(){
		var usuario = this.authService.getUser();
		var token = this.authService.getToken();
		if(usuario && token && (!this.connection || this.connection.readyState == WebSocket.CLOSED)){
			this.conectarWS(GHCI_URL, usuario.cedula, token);
		}		
	}

	doPing(){
		var token = this.authService.getToken();
		if(this.connection && this.connection.readyState == WebSocket.OPEN && token){
			var message = {
				'token': token,
				'ping': ''
			};
			this.connection.send(JSON.stringify(message));
		}		
	}

	sendLine(line) {
		if(line.trim()!==""){
			var message = {
				'token': this.authService.getToken(),
				'comando': line
			};
			console.log(message);
			if(this.connection && this.connection.readyState == WebSocket.OPEN){
				this.connection.send(JSON.stringify(message));
			}else{
				this.errorConsole("Sin conexión al servidor...\n");
			}
		}
	}

	startPrompt() {
		// Start the prompt with history enabled.
		this.jqconsole.Prompt(true, this.callback.bind(this));
	};

	focusConsole(){
		this.jqconsole.Focus();
	};

	clearConsole(){
		this.consoleRef.Reset();
		this.startPrompt.bind(this);
		this.startPrompt();
		this.clear = false;
	};

	callback(input){
		// Output input with the class jqconsole-output. 
		var ejecutar: boolean;
		ejecutar = this.procesarInput(input);
		if(ejecutar) {
			if(this.modoAvanzado){
				this.logConsole("Ejecutar: " + input + '\n');
			}
			this.sendLine.bind(this);
			this.sendLine(input);
		}
		this.startPrompt.bind(this);
		this.startPrompt();
	}

	procesarInput(input){
		var _input: string;
		var send: boolean = false;
		_input = input.trim().toLocaleLowerCase();
		if(_input==="limpiar"){
			this.clearConsole();
		} else if(_input==="modo avanzado") {
			this.modoAvanzado= true;
			this.logConsole("Modo avanzado activado\n");
		} else if(_input==="modo normal"){
			this.modoAvanzado= false;
			this.logConsole("Modo avanzado desactivado\n");
		} else if(_input==="listar colores"){
			this.outputConsole("1 - Azul\n");
			this.outputConsole("2 - Rojo\n");
			this.outputConsole("3 - Verde\n");
			this.outputConsole("4 - Verde oscuro\n");
			this.outputConsole("5 - Blanco\n");
			this.outputConsole("6 - Naranja\n");
			this.outputConsole("7 - Gris\n");
			this.outputConsole("8 - Gris oscuro\n");
			this.outputConsole("9 - Marrón\n");
		} else if(_input.match(regex)!==null) {
			var _tipoTexto :string = _input.split(" ")[1];
			var _color : string = input.split(" ")[2];
			this.jqconsoleColor(_color,_tipoTexto);
			if(this.modoAvanzado){
				this.logConsole("Color " + _tipoTexto + " seleccionado\n");	
			}
		} else {
			send = true;
		}	
		return send;
	}

	getCSSColorName(n){
		if(n==="1"){
			return "rgb(77, 77, 255)";
		} else if(n==="2"){
			return "rgb(255, 26, 26)";
		} else if (n==="3"){
			return "rgb(0, 179, 60)";
		} else if(n==="4"){
			return "rgb(0, 77, 0)";
		} else if(n==="5"){
			return "rgb(255, 255, 255)";
		} else if(n==="6"){
			return "rgb(255, 133, 51)";
		} else if(n==="7"){
			return "rgb(204, 204, 179)";
		} else if(n==="8"){
			return "rgb(102, 102, 102)";
		} else if(n==="9"){
			return "rgb(101, 27, 27)";
		}
	}

	getJQConsoleClass(jqconsoletext){
		if(jqconsoletext==="input"){
			return '.jqconsole-prompt';
		} else if(jqconsoletext==="error"){
			return '.jqconsole-error';
		} else if (jqconsoletext==="logs"){
			return '.jqconsole-logs';
		} else if(jqconsoletext==="output"){
			return '.jqconsole-output';
		}
	}

	jqconsoleColor(color, clase){
		var cssColor:string = this.getCSSColorName(color);
		var jqConsoleClass: string = this.getJQConsoleClass(clase);


		var style = document.createElement('style');
		style.type = 'text/css';
		style.innerHTML = jqConsoleClass +' { color: ' + cssColor + '; }';
		document.getElementsByTagName('head')[0].appendChild(style);

		if(jqConsoleClass==='.jqconsole-prompt'){
			var style2 = document.createElement('style');
			style2.type = 'text/css';
			style2.innerHTML = '.jqconsole-old-prompt { color: ' + cssColor + '; }';
			document.getElementsByTagName('head')[0].appendChild(style2);
		}

	}

	consola: any=undefined;
	renderConsole(){
		if(this.jqconsole){
			$('#console').replaceWith(this.consola);
		}else{
			if ($("#console").jqconsole!=undefined){ // Check if element has been found
				this.jqconsole = $('#console').jqconsole('');
				this.consoleRef = this.jqconsole;
				this.startPrompt.bind(this);
				this.startPrompt();
			} else {
				this.rendered();
			}
			this.consola = $("#console");
		}
	}

	jqconsole:any = undefined;
	rendered(){
		setTimeout(this.renderConsole.bind(this),1000);
	}



}
