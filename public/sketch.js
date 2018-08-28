var socket;
function setup() {
	createCanvas(windowWidth, windowHeight);
	socket = io.connect('http://localhost:3000');
	socket.on('info',newMessage);
}
function newMessage(data){
	//console.log(">",data);
	background(100,0,100);
	rect(data.x,data.y,10,10);
}
function sendMessage(data){
	//console.log("<",data);
	socket.emit('info',data);
}
function draw() {
	sendMessage({x:mouseX,y:mouseY});
}
