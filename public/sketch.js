var socket;
var pos
var spos;
var players={}
function Obstacle(xpos,ypos){
	this.pos=createVector(xpos,ypos);
	this.draw=function(){
		rect(this.pos.x,this.pos.y,10,10);
	}
}
var obstacles=[]
function  createObstacles(){
	for (var i=0; i<height; i+=20){
		for (var o=0; o<width; o+=20){
			obstacles.push(new Obstacle(i,o))
		}

	}
}
function setup() {
	createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://localhost:3001');
	socket.on('player',newMessage);
	pos=createVector(0,0);
	createObstacles()
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
	if (keyIsDown(LEFT_ARROW))pos.x -= 5;
	if (keyIsDown(RIGHT_ARROW))pos.x += 5;
	if (keyIsDown(UP_ARROW))pos.y -= 5;
	if (keyIsDown(DOWN_ARROW))pos.y += 5;
}
function drawPlayers(){
	for (player in players)
		ellipse(players[player].x,players[player].y,10,10);
}
function drawObstacles(){
	for (o in obstacles){
		obstacles[o].draw()
	}
}
function draw() {
	sendMessage(pos,'player');
	clear()
	procKeys()
	translate(width/2,height/2);
	translate(-pos.x,-pos.y);
	fill(255);
	ellipse(pos.x,pos.y,10,10)
	drawObstacles()
	drawPlayers()
}
