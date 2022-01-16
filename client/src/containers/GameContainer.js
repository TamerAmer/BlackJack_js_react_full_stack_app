import React, { useEffect, useState } from "react"
import Game from "../components/Game"
import PlayerList from "../components/PlayerList"
import PlayerForm from "../components/PlayerForm"
import Dealer from "../components/Dealer"
import Player from "../components/Player"
import { getPlayers } from "../helpers/DBHelpers";
import { updatePlayer } from "../helpers/DBHelpers"
import BetCounter from "../components/BetCounter"

const GameContainer=() => {
    
    const [players, setPlayers] = useState([]);
    const [currentPlayer,setCurrentPlayer]=useState(null)
    const [playerHand,setPlayerHand]=useState([])
    const [dealerHand,setDealerHand]=useState([])
    const [deck, setDeck] = useState()

   

    useEffect( () => {    
        console.log("use effect GameContainer");
        getPlayers().then((allPlayers)=>{
            setPlayers(allPlayers);
        });

      }, []);

    function initialiseDeck()
    {
        let deck=["AH","2H","3H","4H","5H","6H","7H","8H","9H","10H","JH","QH","KH",
        "AC","2C","3C","4C","5C","6C","7C","8C","9C","10C","JC","QC","KC",
        "AD","2D","3D","4D","5D","6D","7D","8D","9D","10D","JD","QD","KD",
        "AS","2S","3S","4S","5S","6S","7S","8S","9S","10S","JS","QS","KS"]

        const shuffledDeck = shuffleDeck(deck)
        setDeck(shuffledDeck)
    }

    const addPlayer = (player) => {
        //update the players list with object received from db
        //get all players and add our new player
        const newPlayers = [...players, player];
        //add player to list
        setPlayers(newPlayers);
        //remember this player has active/current player
        setCurrentPlayer(player);
        
        initialiseDeck()
    }

    const addBet = (player) => {
        
        //make a copy of players list so we can make changes
        const newPlayers = [...players];
        //find player and change current money to the 
        //passed player object's current money
        const playerToChange = newPlayers.find( obj => obj._id === player._id)
        
        playerToChange.currentMoney = player.currentMoney;
        playerToChange.stake = player.stake;

        //re set the players
        setPlayers(newPlayers);

        //ready to start game now we have a player and a bet!
        turnFlow();

    }

    const turnFlow = () => { 
        
        
        //Betting phase goes here!
        console.log("game flow")
        //shuffle
        //deal shuffle to dealer and players
        dealCards(deck);
    }

    const shuffleDeck=(deckToShuffle) =>{
        console.log("shuffling deck");
        //make copy of array
        let shuffledDeck = deckToShuffle.map(s =>s);        
        //random sort (this works)
        shuffledDeck.sort(() => Math.random() - 0.5)
        //
        return shuffledDeck;
    }
    
    function dealCards(deck) {
        console.log("dealing cards");
        //shift takes from array and saves in variable
        //Player
        // if(deck.length<25){
        //     setDeck(initialiseDeck())
        //     shuffleDeck()
        // }
        let twoCards = [];             
        twoCards.push( deck.shift() );
        twoCards.push( deck.shift() );
        setPlayerHand(twoCards);
        const handValue=handValuator(twoCards)
        
        console.log("Player has " + handValue);

        if(handValue===21){
            console.log("BLACKJACK!!!")
        }


        //Dealer
        twoCards = [];        
        twoCards.push( deck.shift() );
        twoCards.push( deck.shift() );
        setDealerHand(twoCards);

        console.log("Dealer's first is " + twoCards[0]);
        console.log("Dealer's second is " + twoCards[1]);
        if(handValue===21){
            onStand(playerHandValue)
        }
        // if(handValue===21){
        //     if (handValue === 21 && handValuator(twoCards)===21){
        //         console.log("Dealer's second is " + twoCards[1]);
        //         console.log("Dealer also has a BlackJack, its a push :(")            
        //     }
        //     dealCards(deck)
        // }

    }

    

    //player hit me   
    const onHitMe = () => {
        if(currentPlayer == null)
        {
            console.log("no player asigned")
            return;
        }
        //pass player card
        console.log("On hit me GameContainer")
        //create copy of hand and take from the deck
        let newPlayerHand = [...playerHand, deck.shift()];
        //if(newPlayerHand )
        //set
        setPlayerHand(newPlayerHand);

        //at this point we need to check if player is bust
        
        let playerHandValue = handValuator(newPlayerHand);  
        console.log("player hand value = " + playerHandValue)

        //check for bust
        if(playerHandValue > 21)
        {
            //Check for player money.. if 0 then setCurrentPlayer to null
            console.log("Player is bust!");
        }else{
            console.log("Player now has " + playerHandValue );
        }

        if(playerHandValue >= 21)
            onStand(playerHandValue);

    }
    //I think a change is needed to stop state change delays from causing miss fire bugs
    //If we instead pass a parameter in onStand() that takes in the playerHand and potentially the handValue we eliminate the need for state changes that can potentially mess up the program
    const onStand = (playerHandValue) => {

        if(currentPlayer == null)
        {
            console.log("no player asigned")
            return;
        }
        
         //dealer turn..
         const dealerHandValue = dealerTurn();

         // resolution
         turnResolution(playerHandValue, dealerHandValue);
        

    }

    const dealerTurn = () => {
        //start dealer logic
        //go to Dealer.js?
        console.log("On stand GameContainer");

        //go to dealer's turn (or next player) --->
        let dealerHandValue = handValuator(dealerHand);
        let newDealerHand;
        while (dealerHandValue < 17 )
        {
            newDealerHand = [...dealerHand, deck.shift()];
            //set
            dealerHandValue = handValuator(newDealerHand);

            console.log("Dealer total = " + dealerHandValue);
        }

        setDealerHand(newDealerHand);

        if(dealerHandValue > 21)
        {
            dealerHandValue = -1;
        }

        console.log("Finished dealer while loop");

        return dealerHandValue;
    }

    const turnResolution = (playerHandValue, dealerHandValue) => {

        //set to -2 so player always loses against dealer
        //working this out again unless we want to save to state?
       
        if(playerHandValue > 21)
        {
            playerHandValue = -2;
        }
        console.log("IF statement player hand value = " + playerHandValue);
        console.log("IF statement dealer hand value = " + dealerHandValue);
        if (playerHand.length==2 && playerHandValue==21){
            playerHandValue=22
        }
        
        if (dealerHand.length==2 && dealerHandValue==21){
            dealerHandValue=22
        }
        if(playerHandValue==22 && playerHandValue>dealerHandValue){
            const playerGotBlackjack = {
                'currentMoney': currentPlayer.currentMoney + (currentPlayer.stake *2.5)
            }
            setCurrentPlayer(playerGotBlackjack);
            updatePlayer(playerGotBlackjack, currentPlayer._id)
            .then((data) => {
                playerGotBlackjack._id = currentPlayer._id
            })

            console.log("Players wins with a BlackJack!!!")
            //2.5x bet amount in winning goes here
        }
        //check for blackjack on either the player side or the dealer side
        //if either have a blackjack set the handValue to 22
        //if player wins with blackjack give player 2.5x bet amount
        if( playerHandValue > dealerHandValue)
        {
            //player wins
            console.log("Player wins!")
            
            const playerWonMoney = {
                
                'currentMoney': currentPlayer.currentMoney + (currentPlayer.stake *2)
            }
            setCurrentPlayer(playerWonMoney);
            updatePlayer(playerWonMoney, currentPlayer._id)
            .then((data) =>
            {
                
                playerWonMoney._id = currentPlayer._id;
                //addBet(playerWonMoney);
            })
    
            //Give player 2x bet amount back in their money property
        }
        else if (dealerHandValue > playerHandValue)
        {
            //dealer wins
            console.log("Dealer wins!")
            // check if player has 0 money. If player has 0 money then
            // set player to null
        }
        else
        {
            //a "push" happens, player gets money back
            console.log("Push - Player gets money back")
            //Give player 1x bet amount back in their money property
        }

        //next turn
        //clear cards
        setDealerHand([]);
        setPlayerHand([]);

        //go to betting phase
        // gameFlow();
        console.log("Place Your Bets")
    }

    const handValuator = (arrayOfCards) => {

        let aces = []
        const cardValues=arrayOfCards.map((card) => {
            let firstChar = card.charAt(0)
            if (Number.isInteger(Number(firstChar))){
                firstChar=Number(firstChar)
                if(firstChar==1){
                    return(firstChar *10)
                }else{
                return(firstChar)
                }
            }else{
                if(firstChar=="A"){
                    //remember this ace
                    aces.push(card);
                    return(11)
                }
               else{
                    return(10)
                }
            }
        })
        let totalValue=0
        
        cardValues.map((value) => {
            totalValue=totalValue+value
        })

        for(let i = 0; i < aces.length; i++)
        {
            if (totalValue > 21)
            {
                console.log("reducing value");
                totalValue -= 10;
                console.log(totalValue);
            }
        }
        
        return(totalValue)
    }
      
    return(
        <>
            {currentPlayer == null ? 
            <PlayerList players={players}/> :             
            <Player onHitMe={onHitMe} onStand={onStand} player={currentPlayer} addBet={addBet}/>}            

            <PlayerForm addPlayer={addPlayer}/>

            <Dealer dealerHand={dealerHand}/>
            
        </>
    );
};

export default GameContainer;