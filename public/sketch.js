var socket;
var players={}
var useWebGL=false
function createVec(xpos=0,ypos=0){
	var x=new p5.Vector();
	x.set(xpos,ypos);
	return x
}
function setup() {
	if (useWebGL)createCanvas(windowWidth, windowHeight,WEBGL);
	else createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://192.168.0.114:3001');
	socket.on('player',newMessage);
	createObstacles()
}
function Obstacle(xpos,ypos){
	this.pos=createVector(xpos,ypos);
	this.draw=function(){
		rect(this.pos.x,this.pos.y,10,10);
	}
}
function Player(xpos,ypos){
	if (xpos)
		this.pos=createVector(xpos,ypos);
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
		ellipse(this.pos.x,this.pos.y,10,10);
	}
	this.applyForce=function(forcex,forcey){
		this.acc.add(createVec(forcex,forcey));
	}
}
function Client(){
	this.p=new Player()
	this.draw=function(){
		this.p.draw()
	}
}
var obstacles=[]
function  createObstacles(){
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
		socket.emit(reason,{x,y})
	}else{
		socket.emit(reason,data);
	}
}
function procKeys(){
	if (keyIsDown(LEFT_ARROW))client.p.applyForce(-1,0);
	if (keyIsDown(RIGHT_ARROW))client.p.applyForce(1,0);
	if (keyIsDown(UP_ARROW))client.p.applyForce(0,-1);
	if (keyIsDown(DOWN_ARROW))client.p.applyForce(0,1);
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
var client=new Client()
function draw() {

	background(255);
	client.p.tick()
	sendMessage(client,'player');
	clear()
	procKeys()
	if (!useWebGL)translate(width/2,height/2);
	translate(-client.p.pos.x,-client.p.pos.y)
	fill(255);
	client.draw()
	drawObstacles()
	drawPlayers()
}
