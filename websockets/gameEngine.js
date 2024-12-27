exports.createGameEngine = () => {
    const initGame = (gameFromDB) => {
        const game = {
            ...gameFromDB,
            boardMatrix: Array.from({ length: gameFromDB.board.cols }, () =>
                Array.from({ length: gameFromDB.board.rows }, () => ({
                    content: null,
                    flipped: true,
                    matched: false,
                }))
            ),
            flippedCards: [],
            turnCount: 0,
            gameStatus: 'PL',
            scores: {},
            turnOrder: [],
            currentPlayerIndex: 0,
            displayPlayerIndex: 0,
            hasImages: false,
            pendingFlipback: false,
            lastFlipTimestamp: null,
            shouldCancelFlipback: false,
            lastPlayWasMatch: false
        };

        game.players.forEach((player, index) => {
            game.scores[index + 1] = 0;
        });

        game.turnOrder = Array.from({ length: game.players.length }, (_, i) => i);

        game.maxPairs = (game.board.cols * game.board.rows) / 2;

        shuffleArray(game.turnOrder);

        const cardValues = Array.from({ length: game.maxPairs }, (_, i) => i + 1)
            .flatMap(value => [value, value]); // Create pairs
        shuffleArray(cardValues); // Shuffle pairs

        // Populate the board matrix with card values
        let valueIndex = 0;
        for (let col = 0; col < game.board.cols; col++) {
            for (let row = 0; row < game.board.rows; row++) {
                game.boardMatrix[col][row].content = cardValues[valueIndex++];
            }
        }

        return game;
    };

    const shuffleArray = (array) => {
        return array.sort(() => Math.random() - 0.5);
    };

    // Check if the board is complete (no further plays are possible)
    const isBoardComplete = (game) => game.boardMatrix.flat().every(card => card.matched);

    // Returns whether the game has ended or not
    const gameEnded = (game) => game.gameStatus === 'E'; // 'E' for "Ended"

    // Declare winner based on the player with the most pairs
    const declareWinner = (game) => {
        let winner = null;
        let maxScore = 0;

        // Find player with the highest score
        for (let player = 1; player <= game.players.length; player++) {
            if (game.scores[player] > maxScore) {
                maxScore = game.scores[player];
                winner = player;
            }
        }

        game.winner = winner;
        game.gameStatus = 'E';

        console.log(`Player ${winner} wins with ${maxScore} pairs!`);
    };

    const advanceToNextPlayer = (game) => {
        const nextIndex = (game.currentPlayerIndex + 1) % game.players.length;
        game.currentPlayerIndex = nextIndex;
        game.displayPlayerIndex = nextIndex;
    };

    const handlePendingCards = (game) => {
        if (game.pendingFlipback) {
            // Flip back all unmatched cards
            game.flippedCards.forEach(card => {
                const cardData = game.boardMatrix[card.colIndex][card.rowIndex];
                if (!cardData.matched) {
                    cardData.flipped = true;
                }
            });
            
            // Clear the flipped cards array
            game.flippedCards = [];
            game.pendingFlipback = false;
            game.lastFlipTimestamp = null;
            game.shouldCancelFlipback = false;
            
            // Only move to next player if last play wasn't a match
            if (!game.lastPlayWasMatch) {
                game.currentPlayerIndex = game.displayPlayerIndex;
            }
            game.lastPlayWasMatch = false;
        }
    };

    const canPlayerPlay = (game, playerSocketId) => {
        const nextPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
        const currentPlayerSocketId = game.players[game.turnOrder[game.currentPlayerIndex]].socketId;
        const nextPlayerSocketId = game.players[game.turnOrder[nextPlayerIndex]].socketId;
        
        // Current player can always play if they haven't flipped 2 cards yet
        if (playerSocketId === currentPlayerSocketId && game.flippedCards.length < 2) {
            return true;
        }
        
        // Next player can play if current player has flipped 2 unmatched cards
        if (playerSocketId === nextPlayerSocketId && 
            game.flippedCards.length === 2 && 
            game.pendingFlipback && 
            !game.lastPlayWasMatch) {
            return true;
        }
        
        return false;
    };

    const flipCard = (game, playerSocketId, rowIndex, colIndex) => {
        const playerIndex = game.players.indexOf(playerSocketId) + 1;
        if (playerIndex === -1) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (gameEnded(game)) {
            return {
                errorCode: 11,
                errorMessage: 'Game has already ended!'
            };
        }

        if (!canPlayerPlay(game, playerSocketId)) {
            return {
                errorCode: 12,
                errorMessage: 'Invalid play: It is not your turn!'
            };
        }

        const card = game.boardMatrix[colIndex][rowIndex];
        if (!card.flipped) return {
            errorCode: 13,
            errorMessage: 'This card is already flipped!'
        };

        const isNextPlayer = playerSocketId !== game.players[game.turnOrder[game.currentPlayerIndex]].socketId;
        if (isNextPlayer && game.pendingFlipback) {
            game.shouldCancelFlipback = true;
            handlePendingCards(game);
        }

        card.flipped = false;
        game.flippedCards.push({ rowIndex, colIndex, playerSocketId });

        if (game.flippedCards.length === 2) {
            game.turnCount++;
            
            const match = checkMatch(game);
            game.lastPlayWasMatch = match;
            if (!match) {
                // Immediately update the display turn
                game.displayPlayerIndex = (game.currentPlayerIndex + 1) % game.players.length;
                // Set the pending flipback flag and timestamp
                game.pendingFlipback = true;
                game.lastFlipTimestamp = Date.now();
                return { status: 'PENDING_FLIPBACK' };
            } else {
                // If it's a match, clear flippedCards but keep the cards face-up
                game.flippedCards = [];
            }
        }

        return true;
    };

    const checkMatch = (game) => {
        const [card1, card2] = game.flippedCards;
        const card1Data = game.boardMatrix[card1.colIndex][card1.rowIndex];
        const card2Data = game.boardMatrix[card2.colIndex][card2.rowIndex];

        if (card1Data.content === card2Data.content) {
            card1Data.matched = true;
            card2Data.matched = true;
            game.scores[game.turnOrder[game.currentPlayerIndex]+1]++;
            game.flippedCards = [];

            if (game.scores[game.turnOrder[game.currentPlayerIndex]] >= game.maxPairs) {
                game.gameStatus = 'E';
                declareWinner(game);
            }

            if (isBoardComplete(game) && game.gameStatus !== 'E') {
                game.gameStatus = 'E';
                declareWinner(game);
            }
            return true;
        }
        
        return false;
    };

    const quit = (game, playerSocketId) => {
        const playerIndex = game.players.indexOf(playerSocketId) + 1;
        if (playerIndex === -1) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (gameEnded(game)) {
            return {
                errorCode: 11,
                errorMessage: 'Game has already ended!'
            };
        }

        game.winner = playerSocketId === game.players[0] ? 2 : 1;
        game.gameStatus = 'E';
        return true;
    };

    const close = (game, playerSocketId) => {
        const playerIndex = game.players.indexOf(playerSocketId) + 1;
        if (playerIndex === -1) {
            return {
                errorCode: 10,
                errorMessage: 'You are not playing this game!'
            };
        }

        if (!gameEnded(game)) {
            return {
                errorCode: 14,
                errorMessage: 'Cannot close a game that has not ended!'
            };
        }

        return true;
    };

    const resolveFlipback = (game) => {
        if (!game.pendingFlipback || !game.lastFlipTimestamp) {
            return false;
        }

        // If flipback was cancelled, just return true to clear the timeout
        if (game.shouldCancelFlipback) {
            return true;
        }

        // Check if enough time has passed
        const currentTime = Date.now();
        if (currentTime - game.lastFlipTimestamp < 2000) {
            return false;
        }

        handlePendingCards(game);

        if (isBoardComplete(game) && game.gameStatus !== 'E') {
            game.gameStatus = 'E';
            declareWinner(game);
        }

        return true;
    };

    return {
        initGame,
        gameEnded,
        resolveFlipback,
        flipCard,
        quit,
        close
    };
};
