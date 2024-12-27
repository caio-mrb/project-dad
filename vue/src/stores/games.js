import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/components/ui/toast/use-toast'
import { Images } from 'lucide-vue-next'

export const useGamesStore = defineStore('games', () => {
    const storeAuth = useAuthStore()
    const storeError = useErrorStore()
    const { toast } = useToast()
    const socket = inject('socket')

    const games = ref([])

    const totalGames = computed(() => games.value.length)

    // Use this function to update the game object in the games array
    const updateGame = (updatedGame) => {
        const gameIndex = games.value.findIndex((g) => g.id === updatedGame.id);

        if (gameIndex !== -1) {
            // Update only the specific fields of boardMatrix
            const existingGame = games.value[gameIndex];

            // Loop through the rows and columns to update flipped and matched
            updatedGame.boardMatrix.forEach((col, colIndex) => {
                col.forEach((newCell, rowIndex) => {
                    const existingCell = existingGame.boardMatrix[colIndex][rowIndex];

                    // Update only flipped and matched
                    existingCell.flipped = newCell.flipped;
                    existingCell.matched = newCell.matched;
                });
            });

            // Update the rest of the game properties (shallow merge)
            games.value[gameIndex] = { ...existingGame, ...updatedGame, boardMatrix: existingGame.boardMatrix };
        }
    }

    const setImages = (game) => {
        const glob = import.meta.glob('@/assets/cards-front/fruits/*.jpg', { eager: true });
        const fruitImages = Object.fromEntries(
            Object.entries(glob).map(([key, value]) => [extractNumberFromFilename(key), value.default || value])
        );

        function extractNumberFromFilename(path) {
            const match = path.match(/fruit(\d+)\.jpg/);
            return match ? parseInt(match[1], 10) : null;
        }

        // Initialize board by only replacing the content with corresponding images

        for (let row = 0; row < game.board.rows; row++) {
            for (let col = 0; col < game.board.cols; col++) {
                const cell = game.boardMatrix[col][row];
                if (cell) {
                    // Only replace the content property with the image path
                    const imageNumber = cell.content;
                    game.boardMatrix[col][row] = {
                        ...cell, // Keep all existing properties (flipped, matched)
                        content: fruitImages[imageNumber] // Only update content
                    };
                }
            }
        }

        game.hasImage = true;

        const gameIndex = games.value.findIndex((g) => g.id === game.id)
        if (gameIndex !== -1) {
            games.value[gameIndex] = { ...game } // shallow copy
        }
    }

    const getCurrentPlayer = (game) => {
        return game.players[game.turnOrder[game.displayPlayerIndex]].user
    }

    const getCurrentGame = (userId) => {
        // Iterate over all games to find the current game of the player based on socketId
        const game = games.value.find(g => {
            return g.players.some(player => player.user.id === userId); // Match based on socketId
        });

        return game || null; // Return the game if found, otherwise null
    };

    const webSocketServerResponseHasError = (response) => {
        if (response.errorCode) {
            storeError.setErrorMessages(response.errorMessage, [], response.errorCode)
            return true
        }
        return false
    }

    const removeGameFromList = (game) => {
        const gameIndex = games.value.findIndex((g) => g.id === game.id)
        if (gameIndex >= 0) {
            games.value.splice(gameIndex, 1)
        }
    }

    const alreadyInAnyGame = () => {
        return games.value.some(game =>
            game.players.some(player => player.socketId === socket.id)
        );
    };


    // fetch playing games from the Websocket server
    const fetchPlayingGames = () => {
        storeError.resetMessages()
        socket.emit('fetchPlayingGames', (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            games.value = response
        })
    }

    const play = (game, rowIndex, colIndex) => {
        storeError.resetMessages()
        socket.emit('play', {
            rowIndex: rowIndex,
            colIndex: colIndex,
            gameId: game.id
        }, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            updateGame(response)
        })
    }

    const quit = (game) => {
        storeError.resetMessages()
        socket.emit('quitGame', game.id, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            removeGameFromList(game)
        })
    }

    const close = (game) => {
        storeError.resetMessages()
        socket.emit('closeGame', game.id, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            removeGameFromList(game)
        })
    }

    socket.on('gameStarted', async (game) => {
        if (game.players[0].user.id === storeAuth.userId) {
            toast({
                title: 'Game Started',
                description: `Game #${game.id} has started!`,
            })
        }
        fetchPlayingGames()
    })

    socket.on('gameEnded', async (game) => {
        updateGame(game)
        // Player that created the game is responsible for updating on the database
        if (game.players[0].user.id === storeAuth.userId) {
            // Get if owner won by comparing owner's ID with winner's ID
            const wonValue = game.players[0].user.id === game.players[game.winner - 1].user.id
            const token = localStorage.getItem('token');
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            const APIresponse = await axios.put('multiplayergames/' + game.id, {
                won: wonValue,
                pairs: game.scores[1],                
                winner_user_id: game.players[game.winner - 1].user.id,
                winner_pairs: winnerScore         
            })
            const updatedGameOnDB = APIresponse.data.data
            console.log('Game has ended and updated on the database: ', updatedGameOnDB)
        }
    })

    socket.on('gameChanged', (game) => {
        updateGame(game)
    })

    socket.on('gameQuitted', async (payload) => {
        if (payload.userQuit.id != storeAuth.userId) {
            toast({
                title: 'Game Quit',
                description: `${payload.userQuit.name} has quitted game #${payload.game.id}, giving you the win!`,
            })
        }
        updateGame(payload.game)
    })

    socket.on('gameInterrupted', async (game) => {
        updateGame(game)
        toast({
            title: 'Game Interruption',
            description: `Game #${game.id} was interrupted because your opponent has gone offline!`,
            variant: 'destructive'
        })
        const APIresponse = await axios.patch('games/' + game.id, {
            status: 'I'
        })
        const updatedGameOnDB = APIresponse.data.data
        console.log('Game was interrupted and updated on the database: ', updatedGameOnDB)
    })

    return {
        games, totalGames, /*playerNumberOfCurrentUser,*/getCurrentPlayer, setImages, alreadyInAnyGame, getCurrentGame, fetchPlayingGames, play, quit, close
    }
})
