// Arrays and object notation assignment
// William Sherwood
// March 20, 2025
//
// Extra for Experts:
// This project incorporates p5 party
// It appears that some issues occur when multiple people are connected from several devices although it does work as intended when multiple instances are open on the same device

//scale factor to quickly modify the sizes of parts of the game based on the window size
let scaleFactor ={
  width: 800,
  height: 800,
  x: 1,
  y: 1,
};

//initialize variables and constants
let playerActionTime = 30000; //players have 30s to act
let lastPlayerAction = 0;
let hasClockReset = false;
let myTextSize = 16;
let suits = ["spades", "hearts", "diamonds", "clubs"];
let values = ["A", "02", "03", "04", "05", "06", "07", "08", "09", "10", "J", "Q", "K"];
let cards = {};
let clickReleased = true;
let guests;
let my;
let gameState;
const CARD_SIZE = 100; //the image files of the cards are 64x64 pixels
const CARD_WIDTH_MODIFIER = 0.625; //the card images only have a width of ~0.625x their height
const TABLE_SIZE = 4; //maximum amount of players at the table
const SHOE_SIZE = 6; //amount of decks used in the shoe
const BUTTON_WIDTH = 100;
const BUTTON_HEIGHT = 40;

function preload(){
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

function setup(){
  createCanvas(800, 800);
  windowResized();
  partyToggleInfo(false);

  //start the game
  if(partyIsHost() && !gameState.hasOwnProperty('gameStarted')){
    setupGame();
  }
}

function draw(){
  //only the host runs the logic of the game
  if(partyIsHost()){
    gameLogic();
  }

  //draw UI and update action clock
  if (gameState.gameStarted){
    drawGameUI();
    actionClock();
  }

  //keep hands and money properly in sync
  if (gameState.dealt){
    updateMoney();
    updateHands();
  }
}

function actionClock(){
  //forces player to stand after 30s of no action
  if (!isMyTurn(my) || !gameState.dealt){
    lastPlayerAction = millis();
    hasClockReset = false;
  }
  else if (!hasClockReset){
    lastPlayerAction = millis();
    hasClockReset = true;
  }
  else if (millis() - lastPlayerAction > playerActionTime){
    lastPlayerAction = millis();
    stand();
  }
}

function drawGameUI(){
  //draws the user interface
  background(34, 139, 34);
  
  drawDealerHand();
  drawPlayerHands();
  drawButtons();
  drawBettingInfo();
  drawResults();
}

function drawDealerHand(){
  //draws the dealer's hand and information

  let x = width/2 - scaleFactor.cardSize*CARD_WIDTH_MODIFIER;
  let y = scaleFactor.cardSize;
  let score = '';
  if (gameState.dealerPlay){
    score = `: ${calculateHandValue(gameState.dealerHand)}`;
  }

  //draws the dealers cards and hand total
  fill(255);
  textSize(myTextSize);
  textAlign(CENTER, TOP);
  text("Dealer's Hand" + score, width / 2, y + scaleFactor.cardSize);
  drawCards(gameState.dealerHand, x, y);
}

function drawPlayerHands(){
  //draws each of the active players' hands

  //for all the players connected, draw their hands if they were dealt cards
  for (let i = 0; i < guests.length; i++){
    let player = guests[i];
    let seat = player.seat;
    if (isUserAtTable(player) && isUserPlaying(player)){
      let playAreaWidth = width/(TABLE_SIZE+1);
      let x = playAreaWidth * (seat + 1);
      let y = height - scaleFactor.cardSize*2;
      let amountOfHands = player.hands.length;

      //show where the player's seat is
      fill(255);
      textAlign(CENTER, TOP);
      text(`Player ${seat+1}`, x + scaleFactor.cardSize/2, y + scaleFactor.cardSize);

      //draw each hand that the player has
      for (let j = 0; j < amountOfHands; j++){
        let handAreaWidth = playAreaWidth/amountOfHands;
        let handX = x - playAreaWidth/2 + handAreaWidth * j + handAreaWidth/2;

        //determine if the player doubled down on the hand
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
  //writes the information associated with the hand

  //determine if the hand is the current hand that is being played
  let activeHand = '';
  if (player.currentHand === handIndex && isMyTurn(player)){
    activeHand = 'ACTIVE';
  }

  //write the hand total, bet, result, and if the hand is the active hand
  textAlign(CENTER,TOP);
  text(`${calculateHandValue(player.hands[handIndex])} \nBet: $${player.bets[handIndex]} \nResult: ${player.results[handIndex]} \n${activeHand}`, x, y);
}

function drawStackedCards(hand, x, y, isDoubled){
  //draws the cards in a hand stacked on top of each other. This is used for the players' hands

  //draw each card in the hand
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

function drawCards(hand, x, y){
  //draw the cards in a hand side-by-side. This is used for the dealer's cards

  //draw each card in the hand
  for (let i = 0; i < hand.length; i++){
    let cardKey = `${hand[i].suit}-${hand[i].value}`;
    let card = cards[cardKey];

    //Hide one of the dealer's cards until all players have acted
    if (i === 0 && !gameState.dealerPlay){
      card = cards.back;
    }
    image(card, x + i*(scaleFactor.cardSize*CARD_WIDTH_MODIFIER), y, scaleFactor.cardSize, scaleFactor.cardSize);
  }
}

function drawButtons(){
  //draw the buttons for each action the player can take

  let buttonY = height/2;
  let buttonX = width/5; //4 buttons so divide screen into 5 parts
  let buttonWidth = BUTTON_WIDTH * scaleFactor.min;
  let buttonHeight = BUTTON_HEIGHT * scaleFactor.min;

  //draw the buttons for each action if the player is seated at the table
  if (my.seat >= 0){
    drawButton(buttonX*1 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Hit", hit);
    drawButton(buttonX*2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Stand", stand);
    drawButton(buttonX*3 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Double", doubleDown);
    drawButton(buttonX*4 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Split", splitCards);
  }
  //only draw the button to find a seat when the player is not seated
  else{
    drawButton(width/2 - buttonWidth/2, buttonY, buttonWidth, buttonHeight, "Find Seat", findSeat);
  }
}


function drawBettingInfo(){
  //writes the player's information such as their seat, wager, and bankroll

  let timer = ceil((lastPlayerAction-millis()+playerActionTime)/1000); //time until player is forced to stand
  let isHost = '';
  if (partyIsHost()){
    isHost = 'You are the host please keep tab active';
  }

  fill(255);
  textSize(myTextSize);
  textAlign(LEFT, TOP);
  text(`Player ${my.seat+1} \nWager: $${my.wager} \nMoney: $${my.money} \n\nBlackjack pays 3:2 \nDealer must stand on 17 and must draw to 16 \nUse scroll wheel to change wager \n\nClock: ${timer} \n\n${isHost}`, 20, 20);
}

function drawResults(){
  //displays if the player won or lost money on the hand

  //stop if the dealer has not played their turn yet or the player isn't at the table
  if (!gameState.roundDone || !isUserAtTable(my)){
    return;
  }

  fill('white');
  textAlign(CENTER, CENTER);
  textSize(myTextSize);
  let handResult;
  let dealerBlackjack = '';

  //calculate how much the player bet in total
  let sum = 0;
  for (let bet of my.bets){
    sum += bet;
  }
  
  //determine if the player won any money back and if the dealer had blackjack
  if (my.lastWin === sum){
    handResult = "Break Even";
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


function drawButton(x, y, w, h, label, action){
  //draws a button which runs a function when pressed

  let isHovered = mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;

  fill(isHovered ? color(141, 153, 174) : color(237, 242, 244)); //change colour when hovered
  stroke(0);
  strokeWeight(2);
  rect(x, y, w, h, 10);

  fill(0);
  textAlign(CENTER, CENTER);
  textSize(myTextSize);
  text(label, x + w/2, y + h/2);

  //when the button is clicked reset the action timer and run the button's function
  if (isHovered && mouseIsPressed && clickReleased){
    lastPlayerAction = millis();
    action();
    clickReleased = false;
  }
}

function mouseReleased(){
  //when mouse click is released allow buttons to be pressed again
  clickReleased = true;
}

function findSeat(){
  //finds an empty seat at the table. filling from lowest to highest

  for (let i = 0; i < TABLE_SIZE; i++){
    if (!isSeatTaken(i)){
      my.seat = i;
      return;
    }
  }
}

function isSeatTaken(seat){
  //checks if a given seat at the table is taken

  for (let player of guests){
    if (int(player.seat) === seat){
      return true;
    }
  }
  return false;
}

function isUserAtTable(player){
  //checks if the user is sitting at the table and should be dealt cards
  return player.seat >= 0;
}

function isUserPlaying(player){
  //checks if the user has cards in their hand
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

function hostChecksBlackjack(){
  //the host checks if any players' hands are blackjack and ends their turn if so
  for (let player of guests){
    if (player.checkBlackjack === true && currentPlayer() === player){
      checkBlackjack();
      player.checkBlackjack = false;
    }
  }
}

function hostChecksDealerTurn(){
  //the host checks if it is the dealer's turn to play
  if (!isUserPlaying(currentPlayer()) && !gameState.dealerPlay){
    gameState.lastCard = gameState.timer;
    checkDealerTurn();
  }

  if (gameState.dealerPlay && !gameState.roundDone){
    dealerPlay();
  }
}

function gameLogic(){
  //functions for the host to run every frame
  
  gameState.timer = millis();
  resetBoard();
  hostChecksBlackjack();
  hostChecksDealerTurn();
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
    resetTime: 5000, //5 second timer 
    lastReset: 0,
    cardTime: 500, //0.5 second timer
    lastCard: 0,
    reset: false,
    timer: 0,
  });
}

function resetBoard(){
  //reset the cards and bets of each player and the dealer

  //if the dealer has played and 5 seconds have passed
  if (gameState.timer - gameState.lastReset > gameState.resetTime && gameState.roundDone){
    gameState.lastReset = gameState.timer;
    for (let player of guests){
      player.bets = [];
      player.results = ['none'];
      player.hands = [];
      player.currentHand = 0;
      delete player.hand;
    }
    gameState.roundDone = false;
    gameState.dealerHand = 0;
    gameState.dealerPlay = false;
    gameState.currentTurn = 0;
    delete gameState.dealt;
  }
  dealCards();
}

function updateMoney(){
  //updates the player money to be in line with how much they bet in the current round

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
  //creates an array of objects for each card in a standard deck
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
  //randomizes the order of the objects in the deck array
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

  //stop if the cards have already been dealt
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

    //if the player is at the table and placed a valid bet, deal them cards
    if (isUserAtTable(player) && player.wager > 0 && player.wager <= player.money){
      player.bets[0] = player.wager;
      player.originalBet = player.wager;
      player.hand = [drawCard(), drawCard()];
      player.hands.push(player.hand);
      player.checkBlackjack = true; //mark the hand to be checked for a blackjack
    }
  }

  gameState.dealerHand = [drawCard(), drawCard()]; //give cards to the dealer
  gameState.dealt = true; //mark the round as having been dealt
}

function checkBlackjack(){
  //checks if any of the players or the dealer got blackjack

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
  //checks if all players have completed their actions and it is now the dealer's turn

  if (!isUserPlaying(currentPlayer()) && !gameState.roundDone){
    skipEmptySeats();
  }
  if (gameState.currentTurn >= TABLE_SIZE){
    updateMoney();
    dealerPlay();
  }
}

function skipEmptySeats(){
  //passes over any empty seats until the next occupied seat is reached

  for (let i = 0; i < TABLE_SIZE; i++){
    if (!isUserPlaying(currentPlayer()) && !gameState.roundDone){
      gameState.currentTurn++;
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
  //passes over any of the player's hands that have blackjack

  while (player.results[player.currentHand] === 'blackjack'){
    //move to the player's next hand
    player.currentHand++;
    if (player.currentHand < player.hands.length){
      player.hand = [...player.hands[player.currentHand]];
    }
  }
  
  //go to the next player's turn if the player is out of hands
  if (player.currentHand >= player.hands.length && isMyTurn(player)){
    gameState.currentTurn++;
  }
}

function hit(){
  //the player draws another card

  //stop if it not the player's turn
  if (!isMyTurn(my) || my.results[my.currentHand] === 'bust'){
    return;
  }

  //draw a card and check if it results in a bust
  my.hand.push(drawCard());
  checkBust(my.hand);
}

function stand(){
  //the player ends their turn

  //stop if it is not the player's turn
  if (!isMyTurn(my)){
    return;
  }

  //move to the player's next hand or to the next player
  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    gameState.currentTurn++;
  }
}

function doubleDown(){
  //the player doubles down by doubling their bet and drawing a single extra card

  //stop if it is not the player's turn or they have already drawn a card or they cannot afford to double down
  if (!isMyTurn(my) || my.hand.length !== 2 || my.money < my.originalBet){
    return;
  }

  //double the bet and draw a new card
  my.bets[my.currentHand] *= 2;
  my.hand.push(drawCard());
  my.hands[my.currentHand] = [...my.hand];

  //check if the hand busted and stand if not
  let thisHand = my.currentHand;
  checkBust(my.hand);
  if (my.results[thisHand] !== 'bust'){
    stand();
  }
}

function splitCards(){
  //the player splits their hand into two seperate hands by matching their original bet. only possible when dealt two cards of the same value

  //stop if it is not the player's turn or they have already drawn a card or they cannot afford to split
  if (!isMyTurn(my) || my.hand.length !== 2 || my.money < my.originalBet){
    return;
  }

  //stop if the player's cards are not the same value
  let [card1, card2] = my.hand;
  if (card1.value !== card2.value){
    return;
  }

  //duplicate the original bet and seperate cards into two and deal each new hand an additional card
  my.bets.push(my.originalBet);
  my.results.push('none');
  my.hands[my.currentHand] = [card1, drawCard()];
  my.hands.splice(my.currentHand, 0, [card2, drawCard()]);
  my.hand = [...my.hands[my.currentHand]];
  my.checkBlackjack = true; //mark the player to be checked for blackjacks
}

function bust(){
  //the player has gone over 21
  my.results[my.currentHand] = 'bust';

  //move to the player's next hand or to the next player
  if (my.hands.length-1 > my.currentHand){
    playNextHand();
  }
  else{
    gameState.currentTurn++;
  }
}

function checkBust(hand){
  //check if the given hand has busted by going over 21
  if (calculateHandValue(hand) > 21){
    bust();
  }
}

function calculateHandValue(hand){
  //finds the value of the hand
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
    else{
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
    if (calculateHandValue(gameState.dealerHand) < 17){
      if (gameState.timer - gameState.lastCard > gameState.cardTime){
        gameState.lastCard = gameState.timer;
        gameState.dealerHand.push(drawCard());
      }
      return;
    }
    gameState.roundDone = true;
    determineWinners();
  }
}

function determineWinners(){
  //deterimes the outcome of each player's hand

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
  gameState.lastReset = gameState.timer; //start the timer for the reset
}

function payoutWins(){
  //pays players for each hand that they won

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

function windowResized(){
  //when the size of the window is changed
  resizeCanvas(windowWidth, windowHeight);
  
  //change scale factor based on new window size
  scaleFactor.x = width/scaleFactor.width;
  scaleFactor.y = height/scaleFactor.height;
  scaleFactor.min = min(scaleFactor.x, scaleFactor.y);
  scaleFactor.cardSize = CARD_SIZE*scaleFactor.min;
  myTextSize = 16 * scaleFactor.min;
}