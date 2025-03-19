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

let playerActionTime = 20000; //players have 20s to act
let lastPlayerAction = 0;
let myTextSize = 16;
let suits = ["spades", "hearts", "diamonds", "clubs"];
let values = ["A", "02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K"];
let cards = {};
let clickReleased = true;
let guests;
let my;
let myHand = [];
let gameState;
const CARD_SIZE = 64; //the image files of the cards are 64x64 pixels
const CARD_WIDTH_MODIFIER = 0.625; //the card images only have a width of ~0.625x their height
const TABLE_SIZE = 4; //maximum amount of players at the table
const SHOE_SIZE = 6; //amount of decks used in the shoe
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 40;

function preload() {
  //preload card images
  for (let suit of suits){
    for (let value of values){
      let key = `${suit}-${value}`;
      cards[key] = loadImage(`cards/card_${suit}_${value}.png`);
    }
  }
  cards.back = loadImage('cards/card_back.png');
  
  //setup p5.party
  partyConnect(
    "wss://demoserver.p5party.org", 
    "blackjack"
  );
  gameState = partyLoadShared("gameState", {});
  my = partyLoadMyShared({seat: -1, results: ['none'], bets: [], hands: [], currentHand: 0, money: 1000, wager: 100, lastWin: 0, originalBet: 0, originalMoney: 1000});
  guests = partyLoadGuestShareds();
}

function setup() {
  createCanvas(800, 800);
  windowResized();

  partyToggleInfo(true);
  findSeat();
  if(partyIsHost() && !gameState.hasOwnProperty('gameStarted')){

    setupGame();
    // dealCards();
  }
}

function draw() {
  background(220);

  //only the host runs the logic of the game
  if(partyIsHost()){
    gameLogic();

  }
  if (gameState.gameStarted){
    drawGameUI();

    //force player to stand after 20s of no action
    if (!isMyTurn(my) || !gameState.dealt){
      lastPlayerAction = millis();
    }
    else if (millis() - lastPlayerAction > playerActionTime){
      lastPlayerAction = millis();
      stand();
    }
  }
  if (gameState.dealt){
    updateMoney();
    updateHands();
  }
}

function drawGameUI() {
  background(34, 139, 34);
  
  drawDealerHand();
  drawPlayerHands();
  drawButtons();
  drawBettingInfo();
  drawResults();
}

function drawDealerHand() {
  let x = width/2 - scaleFactor.cardSize*CARD_WIDTH_MODIFIER;
  let y = height/20 * scaleFactor.y;
  let score = '';
  if (gameState.dealerPlay){
    score = `: ${calculateHandValue(gameState.dealerHand)}`;
  }
  fill(255);
  textSize(myTextSize);
  textAlign(CENTER, TOP);
  text("Dealer's Hand" + score, width / 2, y + scaleFactor.cardSize);
  drawCards(gameState.dealerHand, x, y);
}

function drawPlayerHands() {
  for (let i = 0; i < guests.length; i++) {
    let player = guests[i];
    let seat = player.seat;
    if (isUserAtTable(player) && isUserPlaying(player)) {
      let playAreaWidth = width/(TABLE_SIZE+1);
      let x = playAreaWidth * (seat + 1);
      let y = height - 4*height/20;
      let amountOfHands = player.hands.length;

      fill(255);
      textAlign(LEFT, TOP);
      text(`Player ${seat+1}`, x, y + scaleFactor.cardSize);

      for (let j = 0; j < amountOfHands; j++){
        let handAreaWidth = playAreaWidth/amountOfHands;
        let handX = x - playAreaWidth/2 + handAreaWidth * j + handAreaWidth/2;
        let isDoubled = false;
        if (player.bets[j] === 2*player.originalBet){
          isDoubled = true;
        }
        drawStackedCards(player.hands[j], handX, y, isDoubled);
        drawHandInfo(player, j, handX + scaleFactor.cardSize/2, y + scaleFactor.cardSize + myTextSize);
      }
    }
  }
}

function drawHandInfo(player, handIndex, x, y){
  let activeHand = '';
  if (player.currentHand === handIndex && isMyTurn(player)){
    activeHand = 'ACTIVE';
  }
  textAlign(CENTER,TOP);
  text(`${calculateHandValue(player.hands[handIndex])} \nBet: $${player.bets[handIndex]} \nResult: ${player.results[handIndex]} \n${activeHand}`, x, y);
}

function drawStackedCards(hand, x, y, isDoubled){
  for (let i = 0; i < hand.length; i++){
    let offset = i*scaleFactor.cardSize/4;
    let cardKey = `${hand[i].suit}-${hand[i].value}`;
    let card = cards[cardKey];

    //if the player has doubled down on the hand, draw the last card on its side
    if (isDoubled && i === hand.length-1){
      translate(x + offset + scaleFactor.cardSize*CARD_WIDTH_MODIFIER*2, y - offset,);
      rotate(HALF_PI);
      image(card, 0, 0, scaleFactor.cardSize, scaleFactor.cardSize);
    }
    else{
      image(card, x + offset, y - offset, scaleFactor.cardSize, scaleFactor.cardSize);
    }
    resetMatrix();
  }
}

function drawCards(hand, x, y) {
  //draw the cards in a hand side-by-side. This is used for the dealer's cards
  for (let i = 0; i < hand.length; i++) {
    let cardKey = `${hand[i].suit}-${hand[i].value}`;
    let card = cards[cardKey];

    //Hide one of the dealer's cards until all players have acted
    if (i === 0 && !gameState.dealerPlay){
      card = cards.back;
    }
    image(card, x + i*(scaleFactor.cardSize*CARD_WIDTH_MODIFIER), y, scaleFactor.cardSize, scaleFactor.cardSize);
  }
}

function drawButtons() {
  //draw the buttons for each action the player can take
  let buttonY = height/2;
  let buttonX = width/5;
  let buttonWidth = BUTTON_WIDTH * scaleFactor.min;
  let buttonHeight = BUTTON_HEIGHT * scaleFactor.min;
  drawButton(buttonX*1 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Hit", hit);
  drawButton(buttonX*2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Stand", stand);
  drawButton(buttonX*3 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Double", doubleDown);
  drawButton(buttonX*4 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Split", splitCards);
}

function drawBettingInfo() {
  fill(255);
  textSize(myTextSize);
  textAlign(LEFT, TOP);
  text(`Player ${my.seat+1} \nWager: $${my.wager} \nMoney: $${my.money}`, 20, 20);
}

function drawResults(){
  if (!gameState.dealerPlay){
    return;
  }
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(myTextSize);
  let handResult;
  let dealerBlackjack = '';

  let sum = 0;
  for (let bet of my.bets){
    sum += bet;
  }
  
  if (my.lastWin === sum){
    handResult = "Push!";
  }
  else if (my.lastWin === 0){
    handResult = `You Lost`;
  }
  else{
    handResult = `You Win $${my.lastWin}!`;
  }
  if (calculateHandValue(gameState.dealerHand) === 21 && gameState.dealerHand.length === 2){
    dealerBlackjack = "Dealer Blackjack";
  }
  let timer = ceil((gameState.lastReset-gameState.timer+gameState.resetTime)/1000); //time until the board resets

  text(`${dealerBlackjack} \n${handResult} \n${timer}`, width/2, height/2 - BUTTON_HEIGHT*scaleFactor.min);
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
  textSize(myTextSize);
  text(label, x + w/2, y + h/2);

  //when the button is clicked
  if (isHovered && mouseIsPressed && clickReleased) {
    lastPlayerAction = millis();
    action();
    clickReleased = false;
  }
}

function mouseReleased(){
  clickReleased = true;
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

function hostChangesTurn(){
  for (let player of guests){
    if (player.advanceTurn === true){
      gameState.currentTurn++;
      player.advanceTurn = false;
    }
  }
}

function hostChecksBlackjack(){
  for (let player of guests){
    if (player.checkBlackjack === true){
      checkBlackjack();
      player.checkBlackjack = false;
    }
  }
}

function gameLogic(){
  resetBoard();
  hostChangesTurn();
  hostChecksBlackjack();
  checkDealerTurn();
  gameState.timer = millis();
}

function setupGame(){
  //setup the shared gameState object and the deck
  let deck = shuffleDeck(createDeck());
  partySetShared(gameState, {
    deck,
    dealerHand: [],
    currentTurn: 0,
    gameStarted: true,
    dealerPlay: false,
    resetTime: 5000,
    lastReset: 0,
    reset: false,
    timer: 0,
  });
}

function resetBoard(){
  //reset the cards and bets of each player and the dealer
  if (gameState.timer - gameState.lastReset > gameState.resetTime && gameState.dealerPlay){
    gameState.lastReset = gameState.timer;
    for (let player of guests){
      player.bets = [];
      player.results = ['none'];
      player.hands = [];
      player.currentHand = 0;
      player.advanceTurn = false;
      delete player.hand;
    }
    gameState.roundDone = false;
    gameState.dealerHand = 0;
    gameState.dealerPlay = false;
    gameState.currentTurn = 0;
    gameState.reset = false;
    delete gameState.dealt;
  }
  dealCards();
}

function updateMoney(){
  if (!gameState.dealerPlay){
    my.money = my.originalMoney;
    let sum = my.originalMoney;
    for (let bet of my.bets){
      sum -= bet;
    }
    my.money = sum;
  }
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
  let card = gameState.deck.pop();

  //reshuffles the shoe if it reaches below half
  if (gameState.deck.length < 52*SHOE_SIZE/2){
    gameState.deck = shuffleDeck(createDeck());
  }

  return card;
}

function dealCards(){
  //deal the initial two cards to every player and the dealer
  if (gameState.hasOwnProperty('dealt')){
    return;
  }
  for (let player of guests){
    player.originalMoney = player.money;

    //if a player runs out of money give them $50 to continue playing
    if (player.money <= 0){
      player.money = 50;
      player.originalMoney = 50;
    }
    if (isUserAtTable(player) && player.wager > 0 && player.wager <= player.money){
      player.bets[0] = player.wager;
      player.originalBet = player.wager;
      player.hand = [drawCard(), drawCard()];
      player.hands.push(player.hand);
    }
  }
  gameState.dealerHand = [drawCard(), drawCard()];
  gameState.dealt = true;
  my.checkBlackjack = true;
}

function checkBlackjack(){
  //check if any of the players or the dealer got blackjack

  //check for player blackjacks
  for (let player of guests){
    for (let i = 0; i < player.hands.length; i++){
      if (calculateHandValue(player.hands[i]) === 21 && player.hands[i].length === 2 && isUserPlaying(player)){
        player.results[i] = 'blackjack';
      }
    }
    skipBlackjackHands(player);
  }

  //check for dealer blackjacks
  if (calculateHandValue(gameState.dealerHand) === 21){
    gameState.currentTurn = TABLE_SIZE;
  }
}

function checkDealerTurn(){
  //check if all players have completed their actions and it is now the dealers turn
  skipEmptySeats();
  if (gameState.currentTurn >= TABLE_SIZE){
    updateMoney();
    dealerPlay();
  }
}

function skipEmptySeats(){
  //pass over any empty seats until the next occupied seat is reached
  for (let i = 0; i < TABLE_SIZE; i++){
    if (!isUserPlaying(currentPlayer()) && !gameState.roundDone){
      my.advanceTurn = true;
      hostChangesTurn();
    }
    else{
      return;
    }
  }
}

function updateHands(){
  //ensures information about hands match
  if (my.currentHand < my.hands.length){
    my.hand = [...my.hands[my.currentHand]];
    my.hands[my.currentHand] = my.hand;
  }
}

function playNextHand(){
  //when a player has split their cards move to their next hand after completing one
  updateHands();
  my.currentHand++;
  my.hand = [...my.hands[my.currentHand]];
  my.checkBlackjack = true;
}

function skipBlackjackHands(player){
  while (player.results[player.currentHand] === 'blackjack'){
    player.currentHand++;
    if (player.currentHand < player.hands.length){
      player.hand = [...player.hands[player.currentHand]];
    }
  }
  if (player.currentHand >= player.hands.length && isMyTurn(player)){
    my.advanceTurn = true;
  }
}

function hit(){
  //the player draws another card
  if (!isMyTurn(my) || my.results[my.currentHand] === 'bust'){
    return;
  }
  my.hand.push(drawCard());
  checkBust(my.hand);
}

function stand(){
  //the player ends their turn
  if (!isMyTurn(my)){
    return;
  }
  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    my.advanceTurn = true;
  }
}

function doubleDown(){
  //the player doubles down by doubling their bet and drawing a single extra card
  if (!isMyTurn(my) || my.hand.length !== 2 || my.money < my.originalBet) {
    return;
  }
  my.bets[my.currentHand] *= 2;
  my.hand.push(drawCard());
  my.hands[my.currentHand] = [...my.hand];

  let thisHand = my.currentHand;
  checkBust(my.hand);
  if (my.results[thisHand] !== 'bust'){
    stand();
  }
}

function splitCards(){
  //the player splits their hand into two seperate hands by matching their original bet. only possible when dealt two cards of the same value
  if (!isMyTurn(my) || my.hand.length !== 2 || my.money < my.originalBet) {
    return;
  }
  let [card1, card2] = my.hand;
  if (card1.value !== card2.value) {
    return;
  }
  //duplicate the original bet and seperate cards into two and deal each new hand an additional card
  my.bets.push(my.originalBet);
  my.results.push('none');
  my.hands[my.currentHand] = [card1, drawCard()];
  my.hands.splice(my.currentHand, 0, [card2, drawCard()]);

  my.hand = [...my.hands[my.currentHand]];
  my.checkBlackjack = true;
}

function bust(){
  //the player has gone over 21
  my.results[my.currentHand] = 'bust';

  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    my.advanceTurn = true;
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
  if (!gameState.roundDone){
    gameState.dealerPlay = true;
    while (calculateHandValue(gameState.dealerHand) < 17){
      gameState.dealerHand.push(drawCard());
    }
    gameState.roundDone = true;
    determineWinners();
  }
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
  payoutWins();
  gameState.lastReset = gameState.timer;
  gameState.reset = true;
}

function payoutWins(){
  for (let player of guests){
    player.lastWin = 0;
    for (let i = 0; i < player.bets.length; i++){
      if (player.results[i] === 'win'){
        player.lastWin += player.bets[i] * 2;
      }
      else if (player.results[i] === 'blackjack'){
        player.lastWin += player.bets[i] * (5/2);
      }
      else if (player.results[i] === 'push'){
        player.lastWin += player.bets[i];
      }
      else{
        player.lastWin += 0;
      }
    }
    player.money += player.lastWin;
  }
}

function mouseWheel(event){
  //change wager based on mouse scroll wheel
  
  let increment = 50;
  //increase wager by 50 when scrolling up and decrease when scrolling down
  if (event.delta < 0){
    my.wager += increment;
    my.wager %= my.money + increment;
  }
  else if(event.delta > 0){
    my.wager += -50 + my.money + increment;
    my.wager %= my.money + increment;
  }
  return false;
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
  scaleFactor.cardSize = CARD_SIZE*scaleFactor.min;
  myTextSize = 16 * scaleFactor.min;
}