const PlayAgain = ({turnEndMessage, onPlayAgain}) => {

    const handlePlayAgain = () => {
        onPlayAgain();
    }

    return(
        <>
            <h1 className="turn-end-msg">{turnEndMessage}</h1>
            <button className="play-again" onClick={handlePlayAgain}>Play Another Turn</button>
        </>
    )
}

export default PlayAgain;