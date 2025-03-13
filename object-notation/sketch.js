// Arrays and object notation assignment
// William Sherwood
// March 20, 2025
//
// Extra for Experts:
// This project incorporates p5 party

let scaleFactor ={
  width: 800,
  height: 800,
  x: 1,
  y: 1,
};

let guests;
let my;
let myHand = [];
let gameState;
let tableSize = 4; //maximum amount of players at the table
let shoeSize = 6; //amount of decks used in the shoe

function preload() {
  //setup p5.party
  partyConnect(
    "wss://demoserver.p5party.org", 
    "blackjack"
  );
  gameState = partyLoadShared("gameState", {});
  my = partyLoadMyShared({seat: -1, result: 'none'});
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(800, 800);

  findSeat();
  if(partyIsHost() && !gameState.hasOwnProperty('gameStarted')){

    setupGame();
    dealCards();
  }
}

function draw() {
  background(220);

  //only the host runs the logic of the game
  if(partyIsHost()){
    //gameLogic();

  }
}

function gameLogic(){

}

function findSeat(){
  //find an empty seat at the table. filling from lowest to highest
  for (let i = 0; i < tableSize; i++){
    if (!isSeatTaken(i)){
      my.seat = str(i);
      return;
    }
  }
}

function isSeatTaken(i){
  //check if a given seat at the table is taken
  for (let player of guests){
    if (player.seat === str(i)){
      return true;
    }
  }
  return false;
}

function isUserAtTable(player){
  //check if the user is sitting at the table and should be dealt cards
  return player.seat >= 0;
}

function isUserPlaying(player){
  //check if the user has cards in their hand
  return player.hasOwnProperty('hand');
}

function currentPlayer(){
  //returns the current players who's seat is next to act
  for (let player of guests){
    if (player.seat === str(gameState.currentTurn)){
      return player;
    }
  }
  return {};
}

// function generateId(){
//   return str(floor(random(10**8)));
// }

function setupGame(){
  //setup the shared gameState object and the deck
  let deck = shuffleDeck(createDeck());
  partySetShared(gameState, {
    deck,
    dealerHand: [],
    currentTurn: 0,
    gameStarted: true,
  });
}

function createDeck(){
  //create an array of objects for each card in a standard deck
  let suits = ["spades", "hearts", "diamonds", "clubs"];
  let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  let deck = [];

  //create a deck consisting of as many 52-card decks as specified by the shoe size
  for (let i = 0; i < shoeSize; i++){
    for (let suit of suits){
      for (let value of values){
        deck.push({value, suit});
      }
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

function drawCard(){
  //draws a card from the deck
  return gameState.deck.pop();
}

function dealCards(){
  //deal the initial two cards to every player and the dealer
  for (let player of guests){
    if (isUserAtTable(player)){
      player.hand = [drawCard(), drawCard()];
    }
  }
  gameState.dealerHand = [drawCard(), drawCard()];
  checkBlackjack();
}

function checkBlackjack(){
  //check if any of the players or the dealer got blackjack

  //check for player blackjacks
  for (let player of guests){
    if (calculateHandValue(player.hand) === 21 && isUserPlaying(player)){
      player.result = 'blackjack';
    }
  }

  //check for dealer blackjacks
  if (calculateHandValue(gameState.dealerHand) === 21){
    gameState.currentTurn = tableSize;
    checkDealerTurn();
  }
}

function checkDealerTurn(){
  //check if all players have completed their actions and it is now the dealers turn
  skipEmptySeats();
  if (gameState.currentTurn >= tableSize){
    dealerPlay();
  }
}

function skipEmptySeats(){
  //pass over any empty seats until the next occupied seat is reached
  for (let i = 0; i < tableSize; i++){
    if (!isUserPlaying(currentPlayer())){
      gameState.currentTurn++;
    }
    else{
      return;
    }
  }
}

function hit(){
  //the player draws another card
  if (!isMyTurn() || my.result === 'bust') return;
  my.hand.push(drawCard());
  checkBust(my.hand)
}

function stand(){
  //the player ends their turn
  if (!isMyTurn()) return;
  gameState.currentTurn++;
  checkDealerTurn();
}

function bust(){
  //the player has gone over 21
  my.result = 'bust';
  checkDealerTurn();

}

function checkBust(hand){
  //check if the given hand has busted by going over 21
  if (calculateHandValue(hand) > 21) {
    bust();
    gameState.currentTurn++;
  }
}

function calculateHandValue(hand){
  //find the value of the hand
  let sum = 0;
  let aces = 0;
  
  //add the value of each card to the hand total
  for (let card of hand){
    if (card.value === 'A'){
      sum += 11;
      aces++;
    }
    else if(['K','Q','J'].includes(card.value)){
      sum += 10;
    }
    else {
      sum += int(card.value);
    }
  }

  //account for aces being either 1 or 11
  while (sum > 21 && aces > 0){
    sum -= 10;
    aces--;
  }
  return sum;
}

function dealerPlay(){
  //the dealer draws cards until it reaches 17
  while (calculateHandValue(gameState.dealerHand) < 17){
    gameState.dealerHand.push(drawCard());
  }
  determineWinners();
}

function determineWinners(){
  //deterime the outcome of each player's hand
  let dealerScore = calculateHandValue(gameState.dealerHand);
  for (let player of guests){
    if (isUserPlaying(player)){
      let playerScore = calculateHandValue(player.hand);
      if (player.result !== 'bust' && player.result !== 'blackjack'){
        if (dealerScore > playerScore){
          player.result = 'lose';
        }
        else if (dealerScore === playerScore){
          player.result = 'push';
        }
        else{
          player.result = 'win';
        }
      }
      //if both the player and dealer got blackjack then the hand is a push
      if (player.result === 'blackjack' && dealerHand === 21 && gameState.dealCards.length === 2){
        player.result = 'push';
      }
    }
  }
}

function isMyTurn(){
  //check if it is this users turn to act
  return Object.keys(guests)[gameState.currentTurn] === my.seat;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
}
