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

let clickReleased = true;
let guests;
let my;
let myHand = [];
let gameState;
const TABLE_SIZE = 4; //maximum amount of players at the table
const SHOE_SIZE = 6; //amount of decks used in the shoe

function preload() {
  //setup p5.party
  partyConnect(
    "wss://demoserver.p5party.org", 
    "blackjack"
  );
  gameState = partyLoadShared("gameState", {});
  my = partyLoadMyShared({seat: -1, results: ['none'], bets: [100], hands: [], currentHand: 0});
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
  if (mouseIsPressed){
    clickReleased = false;
  }
  drawGameUI();
}

function drawGameUI() {
  background(34, 139, 34); // Green background like a casino table
  
  drawDealerHand();
  drawPlayerHands();
  drawButtons();
  drawBettingInfo();
}

function drawDealerHand() {
  fill(255);
  textSize(24 * min(scaleFactor.x, scaleFactor.y));
  textAlign(CENTER, CENTER);
  text("Dealer's Hand", width / 2, 50 * scaleFactor.y);
  drawCards(gameState.dealerHand, width / 2 - (gameState.dealerHand.length * 30), 80);
}

function drawPlayerHands() {
  for (let i = 0; i < guests.length; i++) {
    let player = guests[i];
    if (isUserAtTable(player) && isUserPlaying(player)) {
      let x = width / (TABLE_SIZE + 1) * (i + 1);
      let y = height - 150 * scaleFactor.y;
      fill(255);
      textAlign(CENTER, CENTER);
      text("Player " + (i + 1), x, y - 30);
      drawCards(player.hand, x - (player.hand.length * 30), y);
    }
  }
}

function drawCards(hand, x, y) {
  for (let i = 0; i < hand.length; i++) {
    fill(255);
    rect(x + i * 40, y, 60, 90, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20 * min(scaleFactor.x, scaleFactor.y));
    text(hand[i].value + "\n" + hand[i].suit, x + i * 40 + 30, y + 45);
  }
}

function drawButtons() {
  let buttonY = height - 80 * scaleFactor.y;
  drawButton(100, buttonY, 100, 40, "Hit", hit);
  drawButton(220, buttonY, 100, 40, "Stand", stand);
  drawButton(340, buttonY, 100, 40, "Double", doubleDown);
  drawButton(460, buttonY, 100, 40, "Split", splitCards);
}

function drawBettingInfo() {
  fill(255);
  textSize(20 * min(scaleFactor.x, scaleFactor.y));
  textAlign(LEFT, TOP);
  text("Bet: " + my.bets[my.currentHand] + "\nResult: " + my.results[my.currentHand], 20, 20);
}


function drawButton(x, y, w, h, label, action) {
  let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  //button style
  fill(isHovered ? "red" : "green"); // Change color when hovered
  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, 10);

  //text style
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(16*min(scaleFactor.x, scaleFactor.y));
  text(label, x + w / 2, y + h / 2);

  //when the button is clicked
  if (isHovered && mouseIsPressed && clickReleased) { //CALLED WITHOUT DELAY
    action();
    clickReleased = false;
  }
}

function mouseReleased(){
  clickReleased = true;
}

function gameLogic(){

}

function findSeat(){
  //find an empty seat at the table. filling from lowest to highest
  for (let i = 0; i < TABLE_SIZE; i++){
    if (!isSeatTaken(i)){
      my.seat = i;
      return;
    }
  }
}

function isSeatTaken(seat){
  //check if a given seat at the table is taken
  for (let player of guests){
    if (int(player.seat) === seat){
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
  for (let i = 0; i < SHOE_SIZE; i++){
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
  if (gameState.hasOwnProperty('dealt')) return;
  for (let player of guests){
    if (isUserAtTable(player)){
      player.hand = [drawCard(), drawCard()];
      player.hands.push(player.hand);
    }
  }
  gameState.dealerHand = [drawCard(), drawCard()];
  gameState.dealt = true;
  checkBlackjack();
}

function checkBlackjack(){
  //check if any of the players or the dealer got blackjack

  //check for player blackjacks
  for (let player of guests){
    for (let hand of player.hands){
      if (calculateHandValue(hand) === 21 && isUserPlaying(player)){
        player.results[player.currentHand] = 'blackjack';
      }
    }
  }

  //check for dealer blackjacks
  if (calculateHandValue(gameState.dealerHand) === 21){
    gameState.currentTurn = TABLE_SIZE;
    checkDealerTurn();
  }
}

function checkDealerTurn(){
  //check if all players have completed their actions and it is now the dealers turn
  skipEmptySeats();
  if (gameState.currentTurn >= TABLE_SIZE){
    dealerPlay();
  }
}

function skipEmptySeats(){
  //pass over any empty seats until the next occupied seat is reached
  for (let i = 0; i < TABLE_SIZE; i++){
    if (!isUserPlaying(currentPlayer())){
      gameState.currentTurn++;
    }
    else{
      return;
    }
  }
}

function playNextHand(){
  //when a player has split their cards move to their next hand after completing one
  my.currentHand++;
  my.hand = my.hands[my.currentHand];
  checkBlackjack();

  while (my.results[my.currentHand] === 'blackjack'){
    my.currentHand++;
    my.hand = my.hands[my.currentHand];
  }
  if (my.currentHand >= my.hands.length){
    gameState.currentTurn++;
    checkDealerTurn();
  }
}

function hit(){
  //the player draws another card
  if (!isMyTurn() || my.results[my.currentHand] === 'bust') return;
  my.hand.push(drawCard());
  checkBust(my.hand)
}

function stand(){
  //the player ends their turn
  if (!isMyTurn()) return;

  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    gameState.currentTurn++;
    checkDealerTurn();
  }
}

function doubleDown(){
  //the player doubles down by doubling their bet and drawing a single extra card
  if (!isMyTurn() || my.hand.length !== 2) return;
  
  my.bets[my.currentHand] *= 2;
  my.hand.push(drawCard());

  checkBust(my.hand);
  if (my.results[my.currentHand] !== 'bust'){
    stand();
  }
}

function splitCards(){
  //the player splits their hand into two seperate hands by matching their original bet. only possible when dealt two cards of the same value
  if (!isMyTurn() || my.hand.length !== 2) return;

  let [card1, card2] = my.hand;
  if (card1.value !== card2.value) return;

  my.bets.push(my.bets[0]);
  my.results.push('none');
  my.hands[my.currentHand] = [card1, drawCard()];
  my.hands.splice(my.currentHand, 0, [card2, drawCard()]);

  my.hand = my.hands[my.currentHand];
  checkBlackjack();
  while (my.results[my.currentHand] === 'blackjack'){
    my.currentHand++;
    my.hand = my.hands[my.currentHand];
  }
  if (my.currentHand >= my.hands.length){
    gameState.currentTurn++;
    checkDealerTurn();
  }
}

function bust(){
  //the player has gone over 21
  my.results[my.currentHand] = 'bust';

  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    gameState.currentTurn++;
    checkDealerTurn();
  }
}

function checkBust(hand){
  //check if the given hand has busted by going over 21
  if (calculateHandValue(hand) > 21) {
    bust();
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
    for (player.currentHand = 0; player.currentHand < player.hands.length; player.currentHand++){
      if (isUserPlaying(player)){
        let playerScore = calculateHandValue(player.hand);
        if (player.results[player.currentHand] !== 'bust' && player.results[player.currentHand] !== 'blackjack'){
          if (dealerScore > playerScore){
            player.results[player.currentHand] = 'lose';
          }
          else if (dealerScore === playerScore){
            player.results[player.currentHand] = 'push';
          }
          else{
            player.results[player.currentHand] = 'win';
          }
        }
        //if both the player and dealer got blackjack then the hand is a push
        if (player.results[player.currentHand] === 'blackjack' && dealerScore === 21 && gameState.dealerHand.length === 2){
          player.results[player.currentHand] = 'push';
        }
      }
    }
  }
}

function isMyTurn(){
  //check if it is this users turn to act
  return gameState.currentTurn === my.seat;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
}
