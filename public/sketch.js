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
	socket = io.connect('http://192.168.0.114:3001');
	socket.on('player',newMessage);
	createObstacles()
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
		sphere(10,10,100);
		pop();
	}
	this.applyForce=function(forcex,forcey,forcez){
		this.acc.add(createVec(forcex,forcey,forcez));
	}
}
function Client(){
	this.p=new Player()
	this.look=createVec(0,0,0);
	this.angles={th:0,ph:0,len:1000}
	this.draw=function(){
		this.p.draw()
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
		movSpeed.setMag(1);
		movSide.setMag(1);
		console.log(movSpeed.toString())
		if (dir==="b"){
			this.p.applyForce(movSpeed.x,0,movSpeed.z);
		}else if (dir==="f") {
			this.p.applyForce(-movSpeed.x,0,-movSpeed.z);
		}else if (dir==="r") {
			this.p.applyForce(movSide.x,0,movSide.z);
		}else if (dir==="l") {
			this.p.applyForce(-movSide.x,0,-movSide.z);
		}
	}
}
var obstacles=[]
function createObstacles(){
	for (var i=0; i<height; i+=80){
		for (var o=0; o<width; o+=80){
			obstacles.push(new Obstacle(i,o))
		}
	}
}
function newMessage(data){
	players[data.id]=data.data
}
function sendMessage(data,reason='info'){
	if (data instanceof p5.Vector){
		var x=data.x;
		var y=data.y;
		var z=data.z;
		socket.emit(reason,{x,y,z})
	}else{
		socket.emit(reason,data);
	}
}
function procKeys(){
	if (keyIsDown(ascii("a")))client.move("r");
	if (keyIsDown(ascii("d")))client.move("l");
	if (keyIsDown(ascii("w")))client.move("f");
	if (keyIsDown(ascii("s")))client.move("b");
	if (keyIsDown(ascii("e")))client.move("u");
	if (keyIsDown(ascii("q")))client.move("d");
	if (keyIsDown(RIGHT_ARROW ))client.angles.ph+=HALF_PI/16;
	if (keyIsDown(LEFT_ARROW  ))client.angles.ph-=HALF_PI/16;
	if (keyIsDown(UP_ARROW    ))client.angles.th+=HALF_PI/16;
	if (keyIsDown(DOWN_ARROW  ))client.angles.th-=HALF_PI/16;
	if (keyIsDown(ascii("m")  ))client.angles.len+=16;
	if (keyIsDown(ascii("n")  ))client.angles.len-=16;
}
function drawPlayers(){
	for (player in players)
		ellipse(players[player].p.pos.x,players[player].p.pos.y,10,10);
}
function drawObstacles(){
	for (o in obstacles){
		obstacles[o].draw()
	}
}
var client=new Client(0,0,-1000)
function draw() {
	translate(-client.p.pos.x,-client.p.pos.y,-client.p.pos.z)
	background(0);
	strokeWeight(1);
	//sendMessage(client,'player');
	procKeys()
	client.placeCam()
	client.p.tick()
	client.draw()
	drawPlayers()
	drawObstacles()
}
