import { Component, ViewChild, HostListener, ComponentRef, ElementRef, Input, Output} from '@angular/core';
import { NgbPopoverConfig, NgbPopover} from '@ng-bootstrap/ng-bootstrap';
import { NgbPopoverWindow } from '@ng-bootstrap/ng-bootstrap/popover/popover';
import { GHCIService } from '../../shared/services/ghci.service'; 
@Component({
    moduleId: module.id,
    selector: 'canvas-component',
    templateUrl: './canvas.component.html',
    host: {
        '(window:resize)': 'onResize($event)'
    }
})

export class CanvasComponent {
    //addEventListener('mousemove', tellPos, false);
    public constructor(private ghciService: GHCIService) {
        ghciService.messages.subscribe(
            canvas=>{
                this.limpiarCanvas();
                if(canvas.tipo == 'canvas'){
                    this.objetos = JSON.parse(canvas.resultado);
                    this.elementosAnimacion = [];
                    this.frameAnimacion = 0;

                    this.dibujarObjetos();
                }else if (canvas.tipo == 'animacion'){
                    this.elementosAnimacion = canvas.resultado.map(res => JSON.parse(res));
                    this.frameAnimacion = 0;
                    this.animando = true;
                    this.animar();
                }else if (canvas.tipo == 'graph'){
                    var jsonCanvas = JSON.parse(canvas.resultado);
                    var fun = this.generarFuncion(jsonCanvas);
                    this.objetos = [{tipo:'grafica',ecuacion: eval(fun), color:'black',thickness: 2}]
                    this.dibujarObjetos();
                }
            }
            ,
            error=>{
                this.objetos = [];
            })
    }
    animar_:boolean = true;
    objetos:any = [];
    evaluacionVertical:boolean = true;
    elementosAnimacion:any = [];
    frameAnimacion:number = 0;
    animando: boolean = true;
    mostrarEjes: boolean = true;
    mostrarGrilla: boolean = true;
    //Todo, abscisa y ordenada
    tipoZoom = "Todo";
    tipoZoomDesc = "Zoom en ambos ejes";
    timeOutRef:number;
    timer: number = 1000;
    public setTimer(t){
        if(t>40 && t < 1500){
            this.timer = t;
        }
    }

    @ViewChild('canvasElement') canvasRef: ElementRef;

    @ViewChild('popover') popover: NgbPopover;

    onResize(event){
        if(this.canvasRef.nativeElement.offsetParent){
            var pixelRatio = window.devicePixelRatio || 1;
            if(pixelRatio > 2){
                pixelRatio = 2;
            }else if (pixelRatio < 1){
                pixelRatio = 1;
            }
            
            this.canvasRef.nativeElement.width = this.canvasRef.nativeElement.offsetParent.offsetWidth * pixelRatio * 0.94;
            this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.offsetParent.offsetHeight * pixelRatio * 0.94;
            var relacionAspecto = this.canvasRef.nativeElement.width/this.canvasRef.nativeElement.height;
            this.Graph(relacionAspecto);
            this.dibujarObjetos();
        }
    }

    exportImg(){
        function dlCanvas() {
            var canvas :any;
            canvas = document.getElementById('myCanvas');
            var dt = canvas.toDataURL('image/png');
            /* Change MIME type to trick the browser to downlaod the file instead of displaying it */
            dt = dt.replace(/^data:image\/[^;]*/, 'data:application/octet-stream');

            /* In addition to <a>'s "download" attribute, you can define HTTP-style headers */
            dt = dt.replace(/^data:application\/octet-stream/, 'data:application/octet-stream;headers=Content-Disposition%3A%20attachment%3B%20filename=Canvas.png');

            this.href = dt;
        };
        document.getElementById("dl").addEventListener('click', dlCanvas, false);
        document.getElementById("dl").click();
    }
    ngAfterViewInit() {

        // Make it visually fill the positioned parent
        this.canvasRef.nativeElement.width = this.canvasRef.nativeElement.offsetParent.offsetWidth * 0.94;
        this.canvasRef.nativeElement.height = this.canvasRef.nativeElement.offsetParent.offsetHeight * 0.94;
        var relacionAspecto = this.canvasRef.nativeElement.width/this.canvasRef.nativeElement.height;
        this.Graph(relacionAspecto);

        this.dibujarObjetos();
    }

    @HostListener('document:click', ['$event'])
    private documentClicked(event: MouseEvent): void {

        // Popover is open
        if (this.popover && this.popover.isOpen()) {

            // Not clicked on self element
            if (!(this.popover as any)._elementRef.nativeElement.contains(event.target)) {

                // Hacking typescript to access private member
                const popoverWindowRef: ComponentRef<NgbPopoverWindow> = (this.popover as any)._windowRef;

                // If clicked outside popover window
                if (!popoverWindowRef.location.nativeElement.contains(event.target)) {
                    this.popover.close();
                }
            }
        }
    }

    play(){
        this.animando = true;
        this.animar();
    }

    pause(){
        this.animando = false;
    }

    private mostrarOcultarEjes = function(){
        this.mostrarEjes = !this.mostrarEjes;
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();
    }

    private mostrarOcultarGrilla = function(){
        this.mostrarGrilla = !this.mostrarGrilla;
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();
    }

    private mostrarEvaluacionVertical = function(){
        this.evaluacionVertical = !this.evaluacionVertical;
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();
    }

    public limpiarCanvas = function(){
        this.animar_ = false; 
        clearTimeout(this.timeOutRef);
        this.objetos = [];
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        if(this.mostrarEjes || this.mostrarGrilla){
            this.drawXAxis(this.context);
            this.drawYAxis(this.context);
        }
    }

    public centrarCanvas = function(){
        this.maxX = 10;
        this.maxY = 10/this.aspectRatio;
        this.minX = -10;
        this.minY = -10/this.aspectRatio;

        this.rangeX = this.maxX - this.minX;
        this.rangeY = this.maxY - this.minY;

        this.unitsPerTickX = 1;
        this.unitsPerTickY = 1;

        this.unitX = this.canvasRef.nativeElement.width / this.rangeX;
        this.unitY = this.canvasRef.nativeElement.height / this.rangeY;
        this.centerY = (-this.minY / this.rangeY) * this.canvasRef.nativeElement.height;
        this.centerX = (-this.minX / this.rangeX) * this.canvasRef.nativeElement.width;
        this.iteration = (this.maxX - this.minX) / this.precision;
        this.scaleX = this.canvasRef.nativeElement.width / this.rangeX;
        this.scaleY = this.canvasRef.nativeElement.height / this.rangeY;

        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();
    }

    public cambiarTipoZoom = function(){
        //Todo, Abscisa y Ordenada
        if(this.tipoZoom == "Todo"){
            this.tipoZoom = "Abscisa";
            this.tipoZoomDesc = "Zoom en abscisa";
        }else if (this.tipoZoom == "Abscisa"){
            this.tipoZoom = "Ordenada";
            this.tipoZoomDesc = "Zoom en ordenada";
        }else{
            this.tipoZoom = "Todo";
            this.tipoZoomDesc = "Zoom en ambos ejes";
        }
    }
    

    private generarFuncion = function(graph:any){
        var funcionString="";
        var grafica;
        for(var fun of graph.funs){
            funcionString = "var "+fun.fun + " = function("+fun.args.join()+"){\n return "+this.generarExpresion(fun.bdy)+"}\n"+funcionString;

            if(fun.fun == graph.graph){
                funcionString += "return "+fun.fun+"("+fun.args.join()+");\n"
                grafica = fun;
            }
        }
        funcionString = "("+grafica.args.join()+",delta,hayPunto)=>{\n"+funcionString+"}";
        return funcionString;
    }

    private generarExpresion = function(exp:any){
        var expresion = "";
        if(exp.kind == "cnd"){
            expresion = " ("+this.generarExpresion(exp.cond)+"?"+this.generarExpresion(exp.exp1)+":"+this.generarExpresion(exp.exp2)+") ";
        }else if(exp.kind == "bop"){
            if(exp.op == "=="){
                expresion = " Math.abs(("+this.generarExpresion(exp.exp1)+") - ("+this.generarExpresion(exp.exp2)+")) < delta && hayPunto() ";
            }else if (exp.op == "/="){
                expresion = " Math.abs(("+this.generarExpresion(exp.exp1)+") - ("+this.generarExpresion(exp.exp2)+")) > delta ||  Math.abs(("+this.generarExpresion(exp.exp1)+") - ("+this.generarExpresion(exp.exp2)+")) < delta && !hayPunto()  ";
            }else if (exp.op == "^"){
                expresion = " Math.pow("+this.generarExpresion(exp.exp1)+","+this.generarExpresion(exp.exp2)+") ";
            }else{
                expresion = " ("+this.generarExpresion(exp.exp1)+")"+exp.op+"("+this.generarExpresion(exp.exp2)+") ";
            }
        }else if(exp.kind == "uop"){
            expresion = " "+exp.op+" "+this.generarExpresion(exp.exp)+" ";
        }else if(exp.kind == "app"){
            if(exp.fun == 'cos'){
                exp.fun = 'Math.cos'
            }else if(exp.fun == 'sen'){
                exp.fun = 'Math.sin'
            }else if(exp.fun == 'red'){
                exp.fun = 'Math.round'
            }
            expresion = " "+exp.fun+"("+exp.args.map(e => this.generarExpresion(e)).join()+") ";
        }else if(exp.kind == "tup"){
            expresion = " ("+exp.exps.map(e => this.generarExpresion(e)).join()+") ";
        }else if(exp.kind == "lit"){
            expresion = " "+exp.val+" ";
        }else if(exp.kind == "var"){
            expresion = " "+exp.var+" ";
        }else{
            expresion = " undefined ";
        }

        return expresion;
    }

    private animar = function(){
        this.animar_ =  true;
        if(this.mostrarEjes || this.mostrarGrilla){
            this.drawXAxis(this.context);
            this.drawYAxis(this.context);
        }

        this.objetos = [];
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        if(this.mostrarEjes || this.mostrarGrilla){
            this.drawXAxis(this.context);
            this.drawYAxis(this.context);
        }

        this.objetos = this.elementosAnimacion[this.frameAnimacion];        
        this.dibujarObjetos();
        if(this.animando){
            this.timeOutRef =  setTimeout(function(){
                if(this.animando){
                    this.frameAnimacion ++;
                    if(this.frameAnimacion>=this.elementosAnimacion.length){
                        this.frameAnimacion = 0;
                    }
                    if(this.animar_){
                        this.animar();    
                    }
                }
            }.bind(this),this.timer);
        }
    }

    private dibujarObjetos = function(){
        if(this.mostrarEjes || this.mostrarGrilla){
            this.drawXAxis(this.context);
            this.drawYAxis(this.context);
        }
        for(let obj of this.objetos){
            if(obj.tipo == 'circulo'){
                this.drawCircle(obj.x, obj.y, obj.r, obj.color,obj.rotacion);
            }else if(obj.tipo == 'grafica'){
                this.drawEquation(obj.ecuacion, obj.color,obj.thickness)
            }else if (obj.tipo == 'rectangulo'){
                this.drawRect(obj.x,obj.y,obj.w,obj.h,obj.color,obj.rotacion);
            }else if (obj.tipo == 'texto'){
                this.drawText(obj.x, obj.y, obj.text, obj.size, obj.color,obj.rotacion);
            }else if (obj.tipo == 'poligono'){
                this.drawPolyline(true,obj.puntos,obj.color, obj.rotacion);
            }else if (obj.tipo == 'lineas'){
                this.drawPolyline(false,obj.puntos,obj.color, obj.rotacion);
            }
        }
    }

    public Graph = function(relacionAspecto) {
        this.config = {
            canvasId: 'myCanvas',
            minX: -10,
            minY: -10/relacionAspecto,
            maxX: 10,
            maxY: 10/relacionAspecto,
            unitsPerTickX: 1,
            unitsPerTickY: 1
        }
        this.aspectRatio = relacionAspecto;
        this.canvas = this.canvasRef;
        this.minX = this.config.minX;
        this.minY = this.config.minY;
        this.maxX = this.config.maxX;
        this.maxY = this.config.maxY;
        this.unitsPerTickX = this.config.unitsPerTickX;
        this.unitsPerTickY = this.config.unitsPerTickY;
        // constants
        this.axisColor = '#aaa';
        this.font = '8pt Calibri';
        this.tickSize = 10;

        // relationships
        this.context = this.canvasRef.nativeElement.getContext('2d');

        this.rangeX = this.maxX - this.minX;
        this.rangeY = this.maxY - this.minY;


        this.unitX = this.canvasRef.nativeElement.width / this.rangeX;
        this.unitY = this.canvasRef.nativeElement.height / this.rangeY;
        this.centerY = Math.round(Math.abs(this.minY / this.rangeY) * this.canvasRef.nativeElement.height);
        this.centerX = Math.round(Math.abs(this.minX / this.rangeX) * this.canvasRef.nativeElement.width);
        this.precision = 1000;
        this.iteration = (this.maxX - this.minX) / this.precision;
        this.scaleX = this.canvasRef.nativeElement.width / this.rangeX;
        this.scaleY = this.canvasRef.nativeElement.height / this.rangeY;
    };



    private drawXAxis = function(context: any) {
        context.save();

        // draw tick marks
        let xPosIncrement = this.unitsPerTickX * this.unitX;
        //let xPos, unit;
        context.font = this.font;
        context.textAlign = 'center';
        context.textBaseline = 'top';

        // draw left tick marks
        let xPos = this.centerX - xPosIncrement;
        let unit = -1 * this.unitsPerTickX;
        if(this.mostrarGrilla){
            context.beginPath();
            context.strokeStyle = "#EEEEEE";;
            context.lineWidth = 1;
            context.moveTo(this.centerX, 0);
            context.lineTo(this.centerX, this.canvasRef.nativeElement.height);
            context.stroke();
        }

        while (xPos > 0) {
            if(this.mostrarGrilla){
                context.beginPath();
                context.strokeStyle = "#EEEEEE";;
                context.lineWidth = 1;
                context.moveTo(xPos, 0);
                context.lineTo(xPos, this.canvasRef.nativeElement.height);
                context.stroke();

            }
            if(this.mostrarEjes){
                context.beginPath();
                context.strokeStyle = this.axisColor;
                context.lineWidth = 2;
                context.moveTo(xPos, this.centerY - this.tickSize / 2);
                context.lineTo(xPos, this.centerY + this.tickSize / 2);
                context.stroke();
                context.fillText(unit + '', xPos, this.centerY + this.tickSize / 2 + 3);
            }
            unit = parseFloat((unit-this.unitsPerTickX).toFixed(2));
            xPos = Math.round(xPos - xPosIncrement);
        }

        // draw right tick marks
        xPos = this.centerX + xPosIncrement;
        unit = this.unitsPerTickX;
        while (xPos < this.canvas.nativeElement.width) {
            if(this.mostrarGrilla){
                context.beginPath();
                context.strokeStyle = "#EEEEEE";;
                context.lineWidth = 1;
                context.moveTo(xPos, 0);
                context.lineTo(xPos, this.canvasRef.nativeElement.height);
                context.stroke();

            }
            if(this.mostrarEjes){
                context.beginPath();
                context.strokeStyle = this.axisColor;
                context.lineWidth = 2;
                context.moveTo(xPos, this.centerY - this.tickSize / 2);
                context.lineTo(xPos, this.centerY + this.tickSize / 2);
                context.stroke();
                context.fillText(unit + '', xPos, this.centerY + this.tickSize / 2 + 3);
            }
            unit = parseFloat((unit+this.unitsPerTickX).toFixed(2));
            xPos = Math.round(xPos + xPosIncrement);
        }
        if(this.mostrarEjes){
            context.beginPath();
            context.strokeStyle = this.axisColor;
            context.lineWidth = 2;
            context.moveTo(0, this.centerY);
            context.lineTo(this.canvasRef.nativeElement.width, this.centerY);
            context.stroke();
            context.moveTo(this.canvasRef.nativeElement.width, this.centerY);
            context.lineTo(this.canvasRef.nativeElement.width-12, this.centerY-5);
            context.stroke();
            context.moveTo(this.canvasRef.nativeElement.width, this.centerY);
            context.lineTo(this.canvasRef.nativeElement.width-12, this.centerY+5);
            context.stroke();
        }
        context.restore();
    };

    private drawYAxis = function(context: any) {
        context.save();

        // draw tick marks
        let yPosIncrement = this.unitsPerTickY * this.unitY;
        //var yPos, unit;
        context.font = this.font;
        context.textAlign = 'right';
        context.textBaseline = 'middle';

        // draw top tick marks
        let yPos = this.centerY - yPosIncrement;
        let unit = this.unitsPerTickY;
        if(this.mostrarGrilla){
            context.beginPath();
            context.strokeStyle = "#EEEEEE";;
            context.lineWidth = 1;
            context.moveTo(0, this.centerY);
            context.lineTo(this.canvasRef.nativeElement.width, this.centerY);
            context.stroke();
        }
        while (yPos > 0) {
            if(this.mostrarGrilla){
                context.beginPath();
                context.strokeStyle = "#EEEEEE";;
                context.lineWidth = 1;
                context.moveTo(0, yPos);
                context.lineTo(this.canvasRef.nativeElement.width, yPos);
                context.stroke();
            }
            if(this.mostrarEjes){
                context.beginPath();
                context.strokeStyle = this.axisColor;
                context.lineWidth = 2;
                context.moveTo(this.centerX - this.tickSize / 2, yPos);
                context.lineTo(this.centerX + this.tickSize / 2, yPos);
                context.stroke();
                context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
            }
            unit = parseFloat((unit+this.unitsPerTickY).toFixed(2));
            yPos = Math.round(yPos - yPosIncrement);
        }

        // draw bottom tick marks
        yPos = this.centerY + yPosIncrement;
        unit = -1 * this.unitsPerTickY;
        while (yPos < this.canvasRef.nativeElement.height) {
            if(this.mostrarGrilla){

                context.beginPath();
                context.strokeStyle = "#EEEEEE";;
                context.lineWidth = 1;
                context.moveTo(0, yPos);
                context.lineTo(this.canvasRef.nativeElement.width, yPos);
                context.stroke();
            }
            if(this.mostrarEjes){
                context.beginPath();
                context.strokeStyle = this.axisColor;
                context.lineWidth = 2;
                context.moveTo(this.centerX - this.tickSize / 2, yPos);
                context.lineTo(this.centerX + this.tickSize / 2, yPos);
                context.stroke();
                context.fillText(unit, this.centerX - this.tickSize / 2 - 3, yPos);
            }
            unit = parseFloat((unit-this.unitsPerTickY).toFixed(2));
            yPos = Math.round(yPos + yPosIncrement);
        }
        if(this.mostrarEjes){
            context.beginPath();
            context.strokeStyle = this.axisColor;
            context.lineWidth = 2;
            context.moveTo(this.centerX, 0);
            context.lineTo(this.centerX, this.canvasRef.nativeElement.height);
            context.stroke();
            context.moveTo(this.centerX, 0);
            context.lineTo(this.centerX+5, 12);
            context.stroke();
            context.moveTo(this.centerX, 0);
            context.lineTo(this.centerX-5, 12);
            context.stroke();
        }
        context.restore();
    };

    private transformContext = function(context: any) {

        context.translate(this.centerX, this.centerY);
        // stretch grid to fit the canvas window, and
        //  invert the y scale so that that increments
        //  as you move upwards

        context.scale(this.scaleX, -this.scaleY);
    }

    public hayGraficas = function(){
        for(let obj of this.objetos){
            if(obj.tipo == 'grafica'){
                return true;
            }
        }
        return false;
    }

    public verticalLine = function(x:number, y:number){
        if(this.hayGraficas()){
            this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
            this.dibujarObjetos();
            var context = this.context;

            this.context.moveTo(x, 0);
            this.context.lineTo(x, this.canvasRef.nativeElement.height);

            var minimoX = -(this.centerX / this.scaleX);
            var minimoY = -(this.centerY / this.scaleY);

            var relativeX = (x/this.canvasRef.nativeElement.width)*this.rangeX + minimoX;

            for(let obj of this.objetos){
                if(obj.tipo == 'grafica'){
                    var relativeX = Math.trunc(relativeX*100)/100;
                    var interseccion = obj.ecuacion(relativeX,this.rangeX/500, ()=>{return true;});
                    var realY = - ((interseccion+minimoY)/this.rangeY)*this.canvasRef.nativeElement.height;
                    if(obj.color){
                        this.context.fillStyle = obj.color;
                    }
                    this.context.fillText("("+relativeX.toFixed(2)+","+interseccion.toFixed(2)+")",x+10,realY);
                    this.context.fillStyle = 'black';
                    this.context.fillRect(x-2.5,realY-2.5,5,5);
                }
            }

            this.context.stroke();
        }
    }

    public leaveCanvas = function(e:any){
        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();
    }

    public moveGraph = function(e: any) {


        if (e.buttons === 1 && e.type == 'mousemove') {
            this.centerX += e.offsetX - this.lastPositionX;
            this.centerY += e.offsetY - this.lastPositionY;
            this.minX = -(this.centerX / this.scaleX);
            this.maxY = (this.centerY / this.scaleY);
            this.maxX = (this.canvasRef.nativeElement.width / this.scaleX) - (this.centerX / this.scaleX);
            this.minY = -((this.canvasRef.nativeElement.height / this.scaleY) - (this.centerY / this.scaleY));
            this.lastPositionX = e.offsetX;
            this.lastPositionY = e.offsetY;
            this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
            this.dibujarObjetos();
        } else if(e.type == 'touchend'){
            if(e.touches.length==1){
                this.lastPositionX = e.touches[0].clientX;
                this.lastPositionY = e.touches[0].clientY;
            }
        } else if(e.type == 'touchmove') {
            if(e.touches.length==1){
                this.centerX += e.touches[0].clientX - this.lastPositionX;
                this.centerY += e.touches[0].clientY - this.lastPositionY;
                this.minX = -(this.centerX / this.scaleX);
                this.maxY = (this.centerY / this.scaleY);
                this.maxX = (this.canvasRef.nativeElement.width / this.scaleX) - (this.centerX / this.scaleX);
                this.minY = -((this.canvasRef.nativeElement.height / this.scaleY) - (this.centerY / this.scaleY));
                this.lastPositionX = e.touches[0].clientX;
                this.lastPositionY = e.touches[0].clientY;
                this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
                this.dibujarObjetos();
            } else if(this.lastZoom && e.touches.length>1){
                this.lastPositionX = e.touches[0].clientX;
                this.lastPositionY = e.touches[0].clientY;
                var x = e.touches[1].clientX;
                var y = e.touches[1].clientY;
                var newZoom = Math.sqrt(Math.pow(this.lastPositionX - x,2)+Math.pow(this.lastPositionY - y,2));
                if(Math.abs(newZoom - this.lastZoom)>2){
                    //15 es un factor para que el zoom en el dispositivo sea natural. 
                    this.zoom((newZoom-this.lastZoom)/15);
                }
                this.lastZoom = newZoom;
            }
        } else if(e.type == 'touchstart'){
            this.lastPositionX = e.touches[0].clientX;
            this.lastPositionY = e.touches[0].clientY;
            if(e.touches.length>1){
                var x = e.touches[1].clientX;
                var y = e.touches[1].clientY;
                this.lastZoom = Math.sqrt(Math.pow(this.lastPositionX - x,2)+Math.pow(this.lastPositionY - y,2));
            }else{
                this.lastZoom = undefined;
            }
        } else {
            this.lastPositionX = e.offsetX;
            this.lastPositionY = e.offsetY;
        }

        if(this.evaluacionVertical){
            var rect = this.canvasRef.nativeElement.getBoundingClientRect();
            var x,y;
            if(e instanceof MouseEvent){
                x = e.clientX - rect.left;
                y = e.clientY - rect.top;
            }else if(e instanceof TouchEvent){
                x = e.touches[0].clientX - rect.left;
                y = e.touches[0].clientY - rect.top;
            }
            this.verticalLine(x,y);        
        }

        if(e instanceof TouchEvent){
            e.preventDefault();
        }

    }

    public zoomGraph = function(e: any) {
        // cross-browser wheel delta
        var e = window.event || e; // old IE support
        var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
        this.zoom(delta, e.clientX, e.clientY);
        return false;
    }

    public zoomMas = function(){
        this.zoom(1);
    }

    public zoomMenos = function(){
        this.zoom(-1);
    }

    private zoom = function(delta:number, clientX?:number, clientY?:number){
        var deltaX = delta*this.rangeX / 20;
        var deltaY = delta*this.rangeY / 20;

        if ((this.tipoZoom == "Todo" 
            && ((this.rangeX < 0.1 && deltaX > 0 || this.rangeX > 10000 && deltaX < 0) 
                || (this.rangeY < 0.1 && deltaY > 0 || this.rangeY > 10000 && deltaY < 0)))
            || this.tipoZoom == "Abscisa" 
            && (this.rangeX < 0.1 && deltaX > 0 || this.rangeX > 10000 && deltaX < 0)
            || this.tipoZoom == "Ordenada" 
            && (this.rangeY < 0.1 && deltaY > 0 || this.rangeY > 10000 && deltaY < 0)) {
            return;
        }

        if(clientX && clientY){
            var rect = this.canvasRef.nativeElement.getBoundingClientRect();
            var x = clientX - rect.left;
            var y = clientY - rect.top;
            var minimoX = -(this.centerX / this.scaleX);
            var minimoY = -((this.canvasRef.nativeElement.height / this.scaleY) - (this.centerY / this.scaleY));
            var relativeX = (x/this.canvasRef.nativeElement.width)*this.rangeX + minimoX;
            var relativeY = (1-y/this.canvasRef.nativeElement.height)*this.rangeY + minimoY;
            var distRelX = (Math.abs(relativeX-this.minX)/Math.abs(this.maxX-this.minX));
            var distRelY = (Math.abs(relativeY-this.minY)/Math.abs(this.maxY-this.minY));

            if(this.tipoZoom == "Todo"){
                this.maxX -= deltaX*(1-distRelX);
                this.maxY -= deltaY*(1-distRelY);
                this.minX += deltaX*distRelX;
                this.minY += deltaY*distRelY;
            }else if(this.tipoZoom == "Abscisa"){
                this.maxX -= deltaX*(1-distRelX);
                this.minX += deltaX*distRelX;
            }else{
                this.maxY -= deltaY*(1-distRelY);
                this.minY += deltaY*distRelY;
            }
        }else{
            if(this.tipoZoom == "Todo"){
                this.maxX -= deltaX;
                this.maxY -= deltaY;
                this.minX += deltaX;
                this.minY += deltaY;
            }else if(this.tipoZoom == "Abscisa"){
                this.maxX -= deltaX;
                this.minX += deltaX;
            }else{
                this.maxY -= deltaY;
                this.minY += deltaY;
            }
        }

        this.rangeX = this.maxX - this.minX;
        this.rangeY = this.maxY - this.minY;

        if(this.rangeX >15){
            this.unitsPerTickX = Math.round(this.rangeX/15);
        }else if (this.rangeX > 4){
            this.unitsPerTickX = 1;
        }else if (this.rangeX > 1.5){
            this.unitsPerTickX = Math.round((this.rangeX/15)*10)/10;
        }else if (this.rangeX > 0.4){
            this.unitsPerTickX = 0.1;
        }else if (this.rangeX > 0.15){
            this.unitsPerTickX = Math.round((this.rangeX/15)*100)/100;
        }else{
            this.unitsPerTickX = 0.01;
        }


        if(this.rangeY >15){
            this.unitsPerTickY = Math.round(this.rangeY/15);
        }else if(this.rangeY > 4){
            this.unitsPerTickY = 1;
        }else if (this.rangeY > 1.5){
            this.unitsPerTickY = Math.round((this.rangeY/15)*10)/10;
        }else if (this.rangeY > 0.4){
            this.unitsPerTickY = 0.1;
        }else if (this.rangeY > 0.15){
            this.unitsPerTickY = Math.round((this.rangeY/15)*100)/100;
        }else {
            this.unitsPerTickY = 0.01;
        }

        this.unitX = this.canvasRef.nativeElement.width / this.rangeX;
        this.unitY = this.canvasRef.nativeElement.height / this.rangeY;
        this.centerY = (this.maxY / this.rangeY) * this.canvasRef.nativeElement.height;
        this.centerX = (-this.minX / this.rangeX) * this.canvasRef.nativeElement.width;
        this.iteration = (this.maxX - this.minX) / this.precision;
        this.scaleX = this.canvasRef.nativeElement.width / this.rangeX;
        this.scaleY = this.canvasRef.nativeElement.height / this.rangeY;

        this.context.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
        this.dibujarObjetos();

    }

    private drawCircle: any = function(x: number, y: number, radius: number, color:string, rotation: number) {

        let context = this.context;
        context.save();
        context.save();
        this.transformContext(context);

        context.beginPath();
        try {
            context.translate(0, 0);
            var degree = rotation * Math.PI / 180;
            var nuevoX = Math.cos(degree)*x-Math.sin(degree)*y;
            var nuevoY = Math.sin(degree)*x+Math.cos(degree)*y;

            context.rotate(-degree);

            this.context.arc(nuevoX, nuevoY, radius, 0, 2 * Math.PI, false);
            if(color){
                context.fillStyle = color;
                context.fill();
            }    

        } catch (e) {
            this.limpiarCanvas();
        }

        context.restore();
        context.lineJoin = 'round';
        context.lineWidth = this.thickness;
        context.strokeStyle = this.color;
        context.stroke();
        context.restore();

    }

    private drawText: any = function(x: number, y: number, text: string, size:number, color:string, rotation: number) {

        this.context.save();
        var minimoX = -(this.centerX / this.scaleX);
        var minimoY = -(this.centerY / this.scaleY);

        var realY = - ((y+minimoY)/this.rangeY)*this.canvasRef.nativeElement.height;
        var realX = ((x-minimoX)/this.rangeX)*this.canvasRef.nativeElement.width;
        if(color){
            this.context.fillStyle = color;
        }

        this.context.translate(realX, realY);
        var degree = rotation * Math.PI / 180;

        this.context.rotate(degree);

        this.context.font = (size*100)/this.rangeX+"pt Arial";
        this.context.textBaseline="middle";
        this.context.textAlign="center";
        this.context.fillText(text,0,0);
        this.context.restore();
    }

    private drawRect: any = function(x: number, y: number, width: number, height:number,color:string, rotation:number) {

        let context = this.context;
        context.save();
        context.save();
        this.transformContext(context);

        context.beginPath();
        try {
            context.translate(0, 0);
            var degree = rotation * Math.PI / 180;
            var nuevoX = Math.cos(degree)*x-Math.sin(degree)*y;
            var nuevoY = Math.sin(degree)*x+Math.cos(degree)*y;

            context.rotate(-degree);

            context.rect(nuevoX-width/2,nuevoY-height/2,width,height);
            if(color){
                context.fillStyle = color;
                context.fill();
            } 

            context.translate(this.centerX, this.centerY);
        } catch (e) {
            this.limpiarCanvas();
        }

        context.restore();
        context.lineJoin = 'round';
        context.lineWidth = this.thickness;
        context.strokeStyle = this.color;
        context.stroke();
        context.restore();
    }

    private drawElipse: any = function(x: number, y: number, radiusX: number, radiusY: number, rotation: number) {

        let context = this.context;
        this.color = 'green';
        this.thickness = 3;

        context.save();
        context.save();
        this.transformContext(context);

        context.beginPath();
        try {
            this.context.ellipse(x, y, radiusX, radiusY, rotation * Math.PI / 180, 0, 2 * Math.PI);
        } catch (e) {
            this.limpiarCanvas();
        }
        context.restore();
        context.lineJoin = 'round';
        context.lineWidth = this.thickness;
        context.strokeStyle = this.color;
        context.stroke();
        context.restore();
    }

    private drawEquation: any = function(equation: any, color: string, thickness: number) {
        let context = this.context;
        context.save();
        context.save();
        this.transformContext(context);

        context.beginPath();
        context.lineWidth = thickness;
        try {
            var firstPoint = equation(this.minX);
            if(firstPoint>10e6){
                firstPoint = 10e6;
            }else if (firstPoint<-10e6){
                firstPoint = -10e6;
            }
            context.moveTo(this.minX, firstPoint);
            var move = true;
            var _x = undefined;
            var _y = undefined;
            var pendiente = undefined;
            var h = 1/this.precision;
            var delta = this.rangeX/this.precision;
            var anchoPunto = this.rangeX/200;
            for (var x = this.minX + this.iteration; x <= this.maxX; x += this.iteration) {
                try{

                    var punto = false;
                    var hayPunto = function(){
                        punto = true;
                        return true;
                    }
                    var y = equation(x,delta,hayPunto);
                    if(punto){
                        this.context.fillRect(x-anchoPunto/2,y-anchoPunto/2,anchoPunto,anchoPunto);
                        move = true;
                        punto = false;
                    }else{

                        if(pendiente != undefined){
                            var pendienteMas1 = Math.tan(Math.atan(pendiente)+Math.PI/8);
                            var pendienteMenos1 = Math.tan(Math.atan(pendiente)-Math.PI/8);

                            if(pendiente > 0 && pendienteMas1 < 0){
                                pendienteMas1 = 1e20;//Number.MAX_VALUE;//1000000;
                            }

                            if(pendiente < 0 && pendienteMenos1 > 0){
                                pendienteMenos1 = -1e20;//Number.MIN_VALUE;//-1000000;
                            }

                            var max = (x - _x)*pendienteMas1 - (y-_y);
                            var min = (x - _x)*pendienteMenos1 -(y-_y);

                            if(max < 0 || min > 0){ 
                                move = true;
                            }
                        }
                        if(_x){
                            pendiente = (y -_y)/(x-_x);
                        }

                        var copiaY = y;
                        if(y>10e6){
                            copiaY = 10e6;
                        }else if (y<-10e6){
                            copiaY = -10e6;
                        }
                        if(move){
                            context.moveTo(x,copiaY);
                            move = false;
                        }else{
                            context.lineTo(x, copiaY);
                        }
                    }
                    _x = x;
                    _y = y;
                }catch(e){
                    move = true;
                }
            }
        } catch (e) {
            this.limpiarCanvas();
        }

        context.restore();
        context.lineJoin = 'bevel';
        context.lineWidth = thickness;
        context.strokeStyle = color;
        context.stroke();
        context.restore();
    };

    private drawPolyline: any = function(polygon:boolean, puntos: any, color: string, rotation:number) {
        let context = this.context;
        context.save();
        context.save();
        this.transformContext(context);

        context.beginPath();
        try {
            if (puntos.length > 1){
                var inicio = puntos[0];
                context.moveTo(inicio[0], inicio[1]);
                for (let punto of puntos) {
                    context.lineTo(punto[0], punto[1]);
                }
                if(polygon){
                    context.lineTo(inicio[0], inicio[1]);
                }
            }
        } catch (e) {
            this.limpiarCanvas();
        }

        context.restore();
        context.lineJoin = 'round';
        context.strokeStyle = color;
        if(color){
            context.fillStyle = color;
            context.fill();
        } 
        context.strokeStyle = 'black';
        context.stroke();
        context.restore();
    };

}
