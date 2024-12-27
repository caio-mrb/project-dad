import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'
import axios from 'axios'
import { useErrorStore } from '@/stores/error'
import { useAuthStore } from '@/stores/auth'
import { useDateUtils } from '@/stores/date';


export const useLobbyStore = defineStore('lobby', () => {
    const storeAuth = useAuthStore()
    const storeError = useErrorStore()
    const socket = inject('socket')
    const { formatDateToISO } = useDateUtils();

    const games = ref([])
    const currentGame = ref(null)

    const totalGames = computed(() => games.value.length)

    const webSocketServerResponseHasError = (response) => {
        if (response.errorCode) {
            storeError.setErrorMessages(response.errorMessage, [], response.errorCode)
            return true
        }
        return false
    }

    // when the lobby changes on the server, it is updated on the client
    socket.on('lobbyChanged', (lobbyGames) => {
        games.value = lobbyGames
        // Update current game if user is in one
        if (currentGame.value) {
            const updatedGame = lobbyGames.find(game => game.id === currentGame.value.id)
            if (updatedGame) {
                currentGame.value = updatedGame

            }
        }
    })

    // fetch lobby games from the Websocket server
    const fetchGames = () => {
        storeError.resetMessages()
        socket.emit('fetchGames', (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            games.value = response
        })
    }

    // Check if current user is owner of a game
    const isOwner = (game) => {
        if (!game || !game.players.length) return false
        return game.players[0].socketId === socket.id
    }

    // add a game to the lobby
    const addGame = () => {
        storeError.resetMessages()
        socket.emit('addGame', (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            currentGame.value = response
        })
    }

    // Update game settings (like board size)
    const updateGame = (gameId, updates) => {
        storeError.resetMessages()
        socket.emit('updateGame', { gameId, updates }, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            // Server will emit lobbyChanged event to update all clients
        })
    }

    // join a game of the lobby
    const joinGame = (id) => {
        storeError.resetMessages()
        socket.emit('joinGame', id, async (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }

            if (response.players.length >= 4) {
                storeError.setErrorMessages('Game is full. You cannot join.', [], 5)
                return
            }

            currentGame.value = response
        })
    }

    const getGameStatus = (game) => {
        if (game.status === "PE")
            return "Pending"
        if (game.status === "PL")
            return "In Progress"
        return "Invalid"
    }

    // Start the game manually (only by the owner)
    const startGame = async (game) => {
        storeError.resetMessages()

        if (!isOwner(game)) {
            storeError.setErrorMessages('Only the game creator can start the game!', [], 2)
            return
        }

        try {
            
            const token = localStorage.getItem('token');
            
            axios.defaults.headers.common.Authorization = `Bearer ${token}`;
            const APIresponse = await axios.post('games', {
                type: "M",
                status: "PL",
                began_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
                board_id: game.board.id
            });

            const newGameOnDB = APIresponse.data.data;

            const GameMult = await axios.post('multiplayergames', {
                game_id: newGameOnDB.id
            });

            newGameOnDB.players = game.players;
            newGameOnDB.lobbyId = game.id;
            newGameOnDB.id = GameMult.data.data.id;

            socket.emit('startGame', newGameOnDB, (startedGame) => {
                if (webSocketServerResponseHasError(startedGame)) {
                    return
                }

                currentGame.value = null
            });
        } catch (error) {
            console.error('Error creating the game:', error);
            storeError.setErrorMessages('Failed to create the game!', [], 5);
        }
    };

    const alreadyInGame = (game) => {
        return game.players.some(player => player.socketId === socket.id);
    }

    const alreadyInAnyGameLobby = () => {
        return games.value.some(game =>
            game.players.some(player => player.socketId === socket.id)
        );
    };

    const canJoinGame = (game) => {
        const isNotFull = game.players.length < 4;
        return storeAuth.user && !alreadyInGame(game) && isNotFull && game.state != "PL";
    }

    const canStartGame = (game) => {
        return isOwner(game) && game.players.length >= 2 && typeof game.board.length === 'undefined' && game.board.id != 1;
    }

    // Get current game for user
    const getCurrentGame = () => {
        return currentGame.value;
    }

    const updateBoardSize = (gameId, newBoard) => {
        storeError.resetMessages()
        socket.emit('updateBoardSize', {
            gameId: gameId,
            newBoard: newBoard
        })
    }

    const leaveLobby = (gameId) => {
        if (!socket) return
        socket.emit('leaveGame', gameId, (response) => {
            if (webSocketServerResponseHasError(response)) {
                return
            }
            currentGame.value = null
        })
    }

    return {
        games,
        totalGames,
        currentGame,
        socket,
        isOwner,
        fetchGames,
        addGame,
        getGameStatus,
        updateGame,
        joinGame,
        updateBoardSize,
        leaveLobby,
        alreadyInGame,
        alreadyInAnyGameLobby,
        canJoinGame,
        startGame,
        canStartGame,
        getCurrentGame,
    }
})