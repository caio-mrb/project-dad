exports.createLobby = () => { 
    const games = new Map()
    let id = 1

    const addGame = (user, socketId) => {
        leaveLobby(socketId);
        id++
        const game = {
            id: id,
            status: "PE",
            board: ([]),
            players: [
                { user: user, socketId: socketId }
            ],
            playerCapacity: 4,
        };
        games.set(id, game)
        return game
    }
    
    const removeGame = (id) => {
        games.delete(id)
        return games
    }

    const existsGame = (id) => {
        return games.has(id)
    }

    const setGameStatus = (id) => {
        const game = games.get(id);
        game.status = newState;
        updateGame(id, game);
    }

    const getGame = (id) => {
        return games.get(id)
    }

    const getGames = () => {
        return [...games.values()]
    }

    const updateGame = (id, updatedGame) => {
        if (games.has(id)) {
            games.set(id, updatedGame);
        }
    }

    const leaveLobby = (socketId) => {
        const gamesToUpdate = [...games.values()].filter(game =>
            game.players.some(player => player.socketId === socketId)
        );
    
        gamesToUpdate.forEach(game => {
            const playerIndex = game.players.findIndex(player => player.socketId === socketId);
    
            if (playerIndex !== -1) {
                const isOwner = game.players[0].socketId === socketId;
    
                if (isOwner) {
                    // If the player is the owner, delete the game
                    games.delete(game.id);
                } else {
                    // If the player is not the owner, remove them from the game
                    game.players.splice(playerIndex, 1);
                    updateGame(game.id, game); // Update the game in the lobby
                }
            }
        });
    
        return getGames();
    };

    return {
        getGames,
        getGame,
        addGame,
        setGameStatus,
        removeGame,
        existsGame,
        updateGame,
        leaveLobby
    }
}