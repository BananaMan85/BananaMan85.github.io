// Arrays and object notation assignment
// William Sherwood
// March 20, 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

let scaleFactor ={
  width: 800,
  height: 800,
  x: 1,
  y: 1,
};

let shared;
let players;
let myHand = [];
let gameState = {};

function preload() {
  partyConnect(
    "wss://demoserver.p5party.org", 
    "blackjack"
  );
  shared = partyLoadShared("shared", {});
}

function setup() {
  createCanvas(800, 800);
}

function draw() {
  background(220);

  if(partyIsHost()){
    gameLogic();
  }
}

function gameLogic(){

}

function setupGame(){
  let deck = shuffleDeck(createDeck());
  shared.gameState = {
    deck,
    dealerHand: [],
    currentTurn: 0,
    gameStarted: true,
  };
}

function createDeck(){
  //create an array of objects for each card in a standard deck
  let suits = ["spades", "hearts", "diamonds", "clubs"];
  let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];
  for (let suit of suits){
    for (let value of values){
      deck.push({value, suit});
    }
  }
  return deck;
}

function shuffleDeck(deck){
//randomize the order of the objects in the deck array
  for (let i = deck.length - 1; i > 0; i--){
    let j = floor(random(i+1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
}
