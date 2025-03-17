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

let suits = ["spades", "hearts", "diamonds", "clubs"];
let values = ["A", "02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K"];
let cards = {
  hearts: {},
  diamonds: {},
  spades: {},
  clubs: {},
};
let clickReleased = true;
let guests;
let my;
let myHand = [];
let gameState;
const TABLE_SIZE = 4; //maximum amount of players at the table
const SHOE_SIZE = 6; //amount of decks used in the shoe

function preload() {
  //preload card images
  for (let suit of suits){
    for (let value of values){
      cards[suit][value] = loadImage("/cards/card_" + suit +"_" + value + ".png");
    }
  }
  

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
  windowResized();

  partyToggleInfo(true);
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

  drawGameUI();
  image(cards.clubs[0], width/2, height/2);
}

function drawGameUI() {
  background(34, 139, 34);
  
  drawDealerHand();
  drawPlayerHands();
  drawButtons();
  drawBettingInfo();
}

function drawDealerHand() {
  fill(255);
  textSize(24 * scaleFactor.min);
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
      drawStackedCards(player.hand, x, y);
    }
  }
}

function drawStackedCards(hand, x, y){
  for (let i = 0; i < hand.length; i++){
    let offset = i*20;
    fill(255);
    rect(x + offset, y, 60*scaleFactor.min, 90*scaleFactor.min, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20 * scaleFactor.min);
    text(hand[i].value + "\n" + hand[i].suit, x + offset + 30, y + 45);
  }
}

function drawCards(hand, x, y) {
  for (let i = 0; i < hand.length; i++) {
    fill(255);
    rect(x + i * 40, y, 60*scaleFactor.min, 90*scaleFactor.min, 10);
    fill(0);
    textAlign(CENTER, CENTER);
    textSize(20 * scaleFactor.min);
    text(hand[i].value + "\n" + hand[i].suit, x + i * 40 + 30, y + 45);
  }
}

function drawButtons() {
  let buttonY = height - 80 * scaleFactor.y;
  let buttonX = 120 * scaleFactor.x;
  let buttonWidth = 100 * scaleFactor.min;
  let buttonHeight = 40 * scaleFactor.min;
  drawButton(buttonX*0 + 100*scaleFactor.x, buttonY, buttonWidth, buttonHeight, "Hit", hit);
  drawButton(buttonX*1 + 100*scaleFactor.x, buttonY, buttonWidth, buttonHeight, "Stand", stand);
  drawButton(buttonX*2 + 100*scaleFactor.x, buttonY, buttonWidth, buttonHeight, "Double", doubleDown);
  drawButton(buttonX*3 + 100*scaleFactor.x, buttonY, buttonWidth, buttonHeight, "Split", splitCards);
}

function drawBettingInfo() {
  fill(255);
  textSize(20 * scaleFactor.min);
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
  textSize(16*scaleFactor.min);
  text(label, x + w / 2, y + h / 2);

  //when the button is clicked
  if (isHovered && mouseIsPressed && clickReleased) {
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
    if (player.seat === gameState.currentTurn){
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
    dealerPlay: false,
  });
}

function createDeck(){
  //create an array of objects for each card in a standard deck
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
    for (let i = 0; i < player.hands.length; i++){
      if (calculateHandValue(player.hands[i]) === 21 && isUserPlaying(player)){
        player.results[i] = 'blackjack';
      }
    }
    skipBlackjackHands(player);
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
}

function skipBlackjackHands(player){
  while (player.results[player.currentHand] === 'blackjack'){
    player.currentHand++;
    player.hand = player.hands[player.currentHand];
  }
  if (player.currentHand >= player.hands.length && isMyTurn(player)){
    gameState.currentTurn++;
    checkDealerTurn();
  }
}

function hit(){
  //the player draws another card
  if (!isMyTurn(my) || my.results[my.currentHand] === 'bust') return;
  my.hand.push(drawCard());
  checkBust(my.hand);
}

function stand(){
  //the player ends their turn
  if (!isMyTurn(my)) return;

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
  if (!isMyTurn(my) || my.hand.length !== 2) return;
  
  my.bets[my.currentHand] *= 2;
  my.hand.push(drawCard());

  checkBust(my.hand);
  if (my.results[my.currentHand] !== 'bust'){
    stand();
  }
}

function splitCards(){
  //the player splits their hand into two seperate hands by matching their original bet. only possible when dealt two cards of the same value
  if (!isMyTurn(my) || my.hand.length !== 2) return;

  let [card1, card2] = my.hand;
  if (card1.value !== card2.value) return;

  //duplicate the original bet and seperate cards into two and deal each new hand an additional card
  my.bets.push(my.bets[0]);
  my.results.push('none');
  my.hands[my.currentHand] = [card1, drawCard()];
  my.hands.splice(my.currentHand, 0, [card2, drawCard()]);

  my.hand = my.hands[my.currentHand];
  checkBlackjack();
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
  gameState.dealerPlay = true;
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
          if (dealerScore > playerScore && dealerScore <= 21){
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
    player.currentHand = 0;
  }
}

function isMyTurn(player){
  //check if it is this users turn to act
  return gameState.currentTurn === player.seat;
}

function windowResized() {
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
  scaleFactor.min = min(scaleFactor.x, scaleFactor.y);
}
