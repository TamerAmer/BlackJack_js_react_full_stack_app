import React, { useEffect, useState } from "react"
import Game from "../components/Game"
import PlayerList from "../components/PlayerList"
import PlayerForm from "../components/PlayerForm"
import Dealer from "../components/Dealer"
import Player from "../components/Player"
import { getPlayers } from "../helpers/DBHelpers";
import { updatePlayer } from "../helpers/DBHelpers"

const GameContainer=() => {
    
    const [players, setPlayers] = useState([]);
    const [currentPlayer,setCurrentPlayer]=useState(null)
    const [playerHand,setPlayerHand]=useState([])
    const [dealerHand,setDealerHand]=useState([])
    const [playerMoney,setPlayerMoney]=useState(100)
    //const [playerBet,setPlayerBet]=useState(0)
    const [deck, setDeck] = useState( initialiseDeck() )

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

        return deck
    }

    const addPlayer = (player) => {
        //update the players list with object received from db
        //get all players and add our new player
        const newPlayers = [...players, player];
        //add player to list
        setPlayers(newPlayers);
        //remember this player has active/current player
        setCurrentPlayer(player);

        //once we have added player to front end list, we can start a game with this player
        gameFlow();

    }

    const gameFlow = () => { 

        //Betting phase goes here!
        console.log("game flow")
        //shuffle
        let shuffledDeck = shuffleDeck();
        //deal shuffle to dealer and players
        dealCards(shuffledDeck);
    }

    const shuffleDeck=() =>{
        console.log("shuffling deck");
        //make copy of array
        let shuffledDeck = deck.map(s =>s);        
        //random sort (this works)
        shuffledDeck.sort(() => Math.random() - 0.5)
        //
        setDeck(shuffledDeck);
        return shuffledDeck;
    }
    
    function dealCards(deck) {
        console.log("dealing cards");
        //shift takes from array and saves in variable
        //Player
        let twoCards = [];             
        twoCards.push( deck.shift() );
        twoCards.push( deck.shift() );
        setPlayerHand(twoCards);

        console.log("Player has " + handValuator(twoCards));

        //Dealer
        twoCards = [];        
        twoCards.push( deck.shift() );
        twoCards.push( deck.shift() );
        setDealerHand(twoCards);

        console.log("Dealer's first is " + twoCards[0]);
    }
    
    // const updatePlayerMoney = (playerToUpdate, moneyToRemove) => {
    //     playerToUpdate = players.at(-1);
    //     updatePlayer(playerToUpdate).currentMoney -= moneyToRemove
    //     console.log(playerToUpdate.name);
    // }

    const onBetSubmit = (betAmount) => {   
        if(currentPlayer == null)
        {
            console.log("no player asigned")
            return;
        }

       // let totalAmount=playerBet
       // totalAmount=totalAmount + Number(betAmount)
       // setPlayerBet(totalAmount)
        //setPlayerMoney(playerMoney - betAmount)
    }

    const onPlaceBet = () => {
       
        console.log("on place bet front end")
        //db
        //updatePlayer(players[2]) 
        
        }


    const onBetClear=() => {
        if(currentPlayer == null)
        {
            console.log("no player asigned")
            return;
        }

       // setPlayerBet(0)        
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
            

            console.log("Player is bust!");
            //remove player from game
            setCurrentPlayer(null);
        }


        console.log("Player now has " + playerHandValue );


    }

    const onStand = () => {

        if(currentPlayer == null)
        {
            console.log("no player asigned")
            return;
        }
        //start dealer logic
        //go to Dealer.js?
        console.log("On stand GameContainer");

        //go to dealer's turn (or next player) --->
        let dealerHandValue = handValuator(dealerHand);
        while (dealerHandValue < 17 )
        {
            let newDealerHand = [...dealerHand, deck.shift()];
            //set
            setDealerHand(newDealerHand);

            dealerHandValue = handValuator(newDealerHand);

            console.log("Dealer total = " + dealerHandValue);
        }

        if(dealerHandValue > 21)
        {
            dealerHandValue = -1;
        }

        console.log("Finished dealer while loop");
        //if we get passed the while loop -dealer has finished playing
        //show game end screen here

        //set to -2 so player always loses against dealer
        //working this out again unless we want to save to state?
        let playerHandValue = handValuator(playerHand);
        if(playerHandValue > 21)
        {
            playerHandValue = -2;
        }
        
        console.log("IF statement player hand value = " + playerHandValue);
        console.log("IF statement dealer hand value = " + dealerHandValue);
        if( playerHandValue > dealerHandValue)
        {
            //player wins
            console.log("Player wins!")
        }
        else if (dealerHandValue > playerHandValue)
        {
            //dealer wins
            console.log("Dealer wins!")
        }
        else
        {
            //a "push" happens, player gets money back
            console.log("Push - Player gets money back")
        }

        //next turn
        //clear cards
        setDealerHand([]);
        setPlayerHand([]);

        //go to betting phase
        gameFlow();

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
            <Player onPlaceBet={onPlaceBet} onBetSubmit={onBetSubmit} onBetClear={onBetClear} onHitMe={onHitMe} onStand={onStand} player={currentPlayer}/>}            

            <PlayerForm addPlayer={addPlayer}/>

            <Dealer dealerHand={dealerHand}/>
            
        </>
    );
};

export default GameContainer;