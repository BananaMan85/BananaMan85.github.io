let someTime = 2000;

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  
  if (millis()%(2*someTime) < someTime){
    background('white');
  }
  else{
    background('black');
  }
}