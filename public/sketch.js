var socket;
var players={}
var useWebGL=true
function createVec(xpos=0,ypos=0,zpos=0){
	var x=new p5.Vector();
	x.set(xpos,ypos,zpos);
	return x
}
function ascii(char){
	return char.toUpperCase().charCodeAt(0);
}
function setup() {
	if (useWebGL)createCanvas(windowWidth, windowHeight,WEBGL);
	else createCanvas(windowWidth, windowHeight);
	createObstacles()
	noLoop();
	start("local")
}
function start(host){
	if (host==="local")
	socket = io.connect('http://localhost:25565');
	else if(host==="non")
	socket = io.connect('http://186.58.83.177:25565');
	else return;
	socket.on('player',newMessage);
	loop()
}
function Obstacle(xpos,ypos,zpos){
	this.pos=createVector(xpos,ypos,zpos);
	this.draw=function(){
		push();
		translate (this.pos.x,this.pos.y,this.pos.z);
		box(20,20,20)
		pop();
	}
}
function Player(xpos,ypos,zpos){
	if (xpos)
		this.pos=createVec(xpos,ypos,zpos);
	else
		this.pos=createVec(0,0);
	this.vel=createVec(0,0);
	this.acc=createVec(0,0);
	this.tick=function(){
		this.pos.add(this.vel);
		this.vel.add(this.acc);
		this.vel.mult(0.9)
		this.acc.setMag(0);
	}
	this.draw=function(){
		//ellipse(this.pos.x,this.pos.y,10,10);
		push();
		translate(this.pos.x,this.pos.y,this.pos.z);
		sphere(10,10,10);
		pop();
	}
	this.applyForce=function(forcex,forcey,forcez){
		this.acc.add(createVec(forcex,forcey,forcez));
	}
}
function Client(xpos,ypos,zpos){
	this.p=new Player(xpos,ypos,zpos)
	this.look=createVec(0,0,0);
	this.angles={th:-3.14/2,ph:0.5,len:1000}
	this.angacc={th:0,ph:0,len:0}
	this.wrap=function(value,point=TWO_PI){
		if (value>point)
			return 0
		if (value<0)
			return point
		return value
	}
	this.draw=function(){
		this.p.draw()
	}
	this.tick=function(){
		this.p.tick();
		this.angles.th+=this.angacc.th
		this.angles.ph+=this.angacc.ph
		this.angles.len+=this.angacc.len
		this.angacc.th*=0.9;
		this.angacc.ph*=0.9;
		this.angacc.len*=0.9;
		// this.angles.ph=this.wrap(this.angles.ph)
		// this.angles.th=this.wrap(this.angles.th,PI)
	}
	this.updateLook=function(){
		this.look=p5.Vector.fromAngles(this.angles.th,this.angles.ph,this.angles.len);
		this.look.sub(this.p.pos);
	}
	this.placeCam=function(){
		this.updateLook();
		// console.log(this.angles)
		camera(-this.p.pos.x,-this.p.pos.y,-this.p.pos.z, this.look.x, this.look.y, this.look.z, 0, 1, 0);
		push()
		translate(this.look.x, this.look.y, this.look.z)
		sphere(10,10,10);
		pop()
	}
	this.move=function(dir){
		this.updateLook()
		this.look.add(this.p.pos)
		movSpeed=this.look.copy()
		movSide=createVec(movSpeed.x,movSpeed.z);
		movSide.rotate(90);
		movSide=createVec(movSide.x,0,movSide.y)
		movSpeed.setMag(2);
		movSide.setMag(2);
		if (dir==="b"){
			this.p.applyForce(movSpeed.x,0,movSpeed.z);
		}else if (dir==="f") {
			this.p.applyForce(-movSpeed.x,0,-movSpeed.z);
		}else if (dir==="r") {
			this.p.applyForce(movSide.x,0,movSide.z);
		}else if (dir==="l") {
			this.p.applyForce(-movSide.x,0,-movSide.z);
		}else if (dir==="u") {
			this.p.applyForce(0,1,0);
		}else if (dir==="d") {
			this.p.applyForce(0,-1,0);
		}
	}
}
var obstacles=[]
function createObstacles(){
	var f=-height*2
	var t=height*2
	var sep=300
	for (var p=f; p<t; p+=sep)
	for (var i=f; i<t; i+=sep){
		for (var o=f; o<t; o+=sep){
			obstacles.push(new Obstacle(i,o,p))
		}
	}
	console.log(obstacles.length)
}
function newMessage(data){
	players[data.id]=data.data
}
function sendMessage(data,reason='info'){
	try{
	if (data instanceof p5.Vector){
		var x=data.x;
		var y=data.y;
		var z=data.z;
		socket.emit(reason,{x,y,z})
	}else{
		socket.emit(reason,data);
	}}
	catch(TypeError){
		console.log("Por favor especifique el host, ingrese \"start(\"non\")\"")
	}
}
function procKeys(){
	if (keyIsDown(ascii("a")))client.move("r");
	if (keyIsDown(ascii("d")))client.move("l");
	if (keyIsDown(ascii("w")))client.move("f");
	if (keyIsDown(ascii("s")))client.move("b");
	if (keyIsDown(ascii("e")))client.move("u");
	if (keyIsDown(ascii("q")))client.move("d");
	if (keyIsDown(RIGHT_ARROW ))client.angacc.ph-=HALF_PI/320;
	if (keyIsDown(LEFT_ARROW  ))client.angacc.ph+=HALF_PI/320;
	if (keyIsDown(UP_ARROW    ))client.angacc.th+=HALF_PI/320;
	if (keyIsDown(DOWN_ARROW  ))client.angacc.th-=HALF_PI/320;
	if (keyIsDown(ascii("m")  ))client.angacc.len+=16;
	if (keyIsDown(ascii("n")  ))client.angacc.len-=16;
}
function drawPlayers(){
	for (player in players)
		//ellipse(players[player].p.pos.x,players[player].p.pos.y,10,10);
		lightSource(players[player].p.pos.x,players[player].p.pos.y,players[player].p.pos.z,255,0,0)
}
function drawObstacles(){
	for (o in obstacles){
		obstacles[o].draw()
	}
}
var client=new Client(-1000,0,-1000)
function lightSource(x,y,z,r,g,b){
	push()
		//resetMatrix()
		translate(x,y,z);
		fill(r,g,b);
		noStroke()
		sphere(50,24,24);
		fill(255)
	pop()
	pointLight(r,g,b,x,y,z);

}
var phase=0;
function draw() {
	background(0);
	strokeWeight(1);
	sendMessage(client,'player');
	procKeys()
	ambientLight(10,10,10)
	client.placeCam()
	client.tick()
	client.draw()
	drawPlayers()
	lightSource(0,0,0,0,255,255);
	// rotateZ(map(noise(noise(phase)),0,1,0,TWO_PI))
	// rotateX(map(noise(phase),0,1,0,TWO_PI))
	// rotateY(map(noise(noise(noise(phase))),0,1,0,TWO_PI))
	phase+=mouseX/100000
	rotateX(phase)
	rotateZ(phase)
	rotateY(phase)
	drawObstacles()
}
