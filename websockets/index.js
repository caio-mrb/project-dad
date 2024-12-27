const { createLobby } = require('./lobby')
const lobby = createLobby()
const { createUtil } = require('./util')
const util = createUtil()
const { createGameEngine } = require('./gameEngine')
const gameEngine = createGameEngine()

const httpServer = require("http").createServer();
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const PORT = process.env.APP_PORT || 8086;

httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`listening on localhost:${PORT}`);
});

io.on("connection", (socket) => {
  console.log(`Client with socket id ${socket.id} has connected!`);

  // ------------------------------------------------------
  // Disconnect
  // ------------------------------------------------------    
  // disconnection event is triggered when the client disconnects but is still on the rooms 

  socket.on("disconnecting", (reason) => {
    socket.rooms.forEach(room => {
      if (room == 'lobby') {
        lobby.leaveLobby(socket.id)
        io.to('lobby').emit('lobbyChanged', lobby.getGames())
      }
    })
    util.getRoomGamesPlaying(socket).forEach(([roomName, room]) => {
      socket.leave(roomName)
      if (!gameEngine.gameEnded(room.game)) {
        room.game.status = 'I'
        io.to(roomName).emit('gameInterrupted', room.game)
      }
    })
  })

  socket.on("echo", (message) => {
    socket.emit("echo", message);
  });

  // ------------------------------------------------------
  // User identity
  // ------------------------------------------------------    

  socket.on('login', (user) => {
    // Stores user information on the socket as "user" property
    socket.data.user = user
    if (user && user.id) {
      socket.join('user_' + user.id)
      socket.join('lobby')
    }
  })

  socket.on('logout', (user) => {
    if (user && user.id) {
      socket.leave('user_' + user.id)
      lobby.leaveLobby(socket.id)
      io.to('lobby').emit('lobbyChanged', lobby.getGames())
      socket.leave('lobby')
      util.getRoomGamesPlaying(socket).forEach(([roomName, room]) => {
        socket.leave(roomName)
        if (!gameEngine.gameEnded(room.game)) {
          room.game.status = 'I'
          io.to(roomName).emit('gameInterrupted', room.game)
        }
      })
    }
    socket.data.user = undefined
  })

  // ------------------------------------------------------
  // Lobby
  // ------------------------------------------------------

  socket.on('fetchGames', (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const games = lobby.getGames()
    if (callback) {
      callback(games)
    }
  })

  socket.on('addGame', (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const game = lobby.addGame(socket.data.user, socket.id)
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
    if (callback) {
      callback(game)
    }
  })

  socket.on('updateBoardSize', (data) => {
    const { gameId, newSize } = data;

    const game = lobby.getGame(gameId);
    game.boardId = newSize;

    io.to('lobby').emit('lobbyChanged', lobby.getGames())
  });

  socket.on('joinGame', (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const game = lobby.getGame(id);

    if (!game) {
      return
    }

    if (game.players.some(player => player.socketId === socket.id)) {
      if (callback) {
        callback({
          errorCode: 3,
          errorMessage: 'User cannot join a game that they have already joined!'
        });
      }
      return;
    }

    const currentGame = lobby.getGames().find(game =>
      game.players.some(player => player.socketId === socket.id)
    );

    if (currentGame) {
      const isOwner = currentGame.players[0].socketId === socket.id; // The owner is the first player

      if (isOwner) {
        // If the user is the owner of the current game, remove it and allow them to join the new game
        lobby.removeGame(currentGame.id); // Destroy the current game
        console.log('Game destroyed because the owner is leaving to join another game.');
      } else {
        // If the user is not the owner, just remove them from the current game
        lobby.leaveLobby(socket.id);
        console.log('User left the current game to join another game.');
      }
    }

    // Check if the game is full (max 4 players)
    if (game.players.length >= game.playerCapacity) {
      if (callback) {
        callback({
          errorCode: 5,
          errorMessage: 'Game is already full (max 4 players allowed)!'
        });
      }
      return;
    }

    // Add the user to the game, pushing both user info and socketId
    const player = { user: socket.data.user, socketId: socket.id };
    game.players.push(player);

    // Update the game in the lobby
    lobby.updateGame(id, game);

    // Notify all clients in the 'lobby' room about the updated game list
    io.to('lobby').emit('lobbyChanged', lobby.getGames());

    // Send the updated game object back to the client
    if (callback) {
      callback(game);
    }
  });

  socket.on('removeGame', (id, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const game = lobby.getGame(id)
    if (socket.data.user.id != game.player1.id) {
      if (callback) {
        callback({
          errorCode: 4,
          errorMessage: 'User cannot remove a game that he has not created!'
        })
      }
      return
    }
    lobby.removeGame(game.id)
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
    if (callback) {
      callback(game)
    }
  })

  socket.on('leaveGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }

    const result = lobby.leaveLobby(socket.id)

    // Notify all clients in the lobby about the change
    io.to('lobby').emit('lobbyChanged', lobby.getGames())

    if (callback) {
      callback(result)
    }
  })

  socket.on('updateBoardSize', (data) => {
    const { gameId, newBoard } = data;
    const game = lobby.getGame(gameId);

    if (!game) return;

    // Verify that the requester is the owner
    if (game.players[0].socketId !== socket.id) return;

    game.board = newBoard;
    lobby.updateGame(gameId, game);

    // Notify all clients about the change
    io.to('lobby').emit('lobbyChanged', lobby.getGames())
  })


  // ------------------------------------------------------
  // Multiplayer Game
  // ------------------------------------------------------

  socket.on('startGame', async (clientGame, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }

    const roomName = 'game_' + clientGame.id;

    // Ensure that the socket emitting the 'startGame' event is the owner
    if (clientGame.players[0].socketId !== socket.id) {
      if (callback) {
        callback({
          errorCode: 2,
          errorMessage: 'Only the game creator (owner) can start the game.'
        });
      }
      return;
    }

    // Ensure that there are enough players
    if (clientGame.players.length < 2) {
      if (callback) {
        callback({
          errorCode: 1,
          errorMessage: 'Not enough players to start the game!'
        });
      }
      return;
    }

    // Initialize the game with players
    const game = gameEngine.initGame(clientGame);

    console.log("Game initialized:", game);

    // Create promises for joining each player to the room
    const joinPromises = clientGame.players.map(player => {
      const playerSocket = io.sockets.sockets.get(player.socketId);
      console.log("Attempting to join player:", player.socketId, "Socket found:", !!playerSocket);

      if (playerSocket) {
        return new Promise(resolve => {
          playerSocket.join(roomName);
          resolve(true);
        });
      }
      return Promise.resolve(false);
    });

    // Wait for all players to join the room
    const joinResults = await Promise.all(joinPromises);

    console.log("Join results:", joinResults);

    // Check if all players joined successfully
    if (joinResults.some(result => !result)) {
      if (callback) {
        callback({
          errorCode: 4,
          errorMessage: 'Failed to connect all players to the game room'
        });
      }
      return;
    }

    // Get the room after players have joined
    const room = io.sockets.adapter.rooms.get(roomName);

    if (!room) {
      if (callback) {
        callback({
          errorCode: 3,
          errorMessage: 'Failed to create game room'
        });
      }
      return;
    }

    // Store the game data on the room object
    room.game = game;

    // Emit game started event to all users in the room
    io.to(roomName).emit('gameStarted', game);

    if (callback) {
      callback(game);
    }
  });

  socket.on('fetchPlayingGames', (callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    if (callback) {
      callback(util.getGamesPlaying(socket))
    }
  })

  socket.on('play', (playData, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return;
    }
    const roomName = 'game_' + playData.gameId;
    const game = socket.adapter.rooms.get(roomName).game;
    const playResult = gameEngine.flipCard(game, socket.id, playData.rowIndex, playData.colIndex);

    if (playResult !== true && !playResult?.status) {
      if (callback) {
        callback(playResult);
      }
      return;
    }

    // Notify all users of the current game state (showing flipped cards)
    io.to(roomName).emit('gameChanged', game);

    // If we're waiting for cards to flip back
    if (playResult?.status === 'PENDING_FLIPBACK' && !game.shouldCancelFlipback) {
      setTimeout(() => {
        if (gameEngine.resolveFlipback(game)) {
          // Only emit if the flipback wasn't cancelled
          if (!game.shouldCancelFlipback) {
            io.to(roomName).emit('gameChanged', game);

          }
        }
      }, 2000);
    }
    if (gameEngine.gameEnded(game)) {
      io.to(roomName).emit('gameEnded', game);
    }

    if (callback) {
      callback(game);
    }
  });

  socket.on('quitGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const roomName = 'game_' + gameId
    // Load game state from the game data stored directly on the room object
    const game = socket.adapter.rooms.get(roomName).game
    const quitResult = gameEngine.quit(game, socket.id)
    if (quitResult !== true) {
      if (callback) {
        callback(quitResult)
      }
      return
    }

    // Notify all users playing the game (in the room) that the game state has changed
    io.to(roomName).emit('gameChanged', game)
    io.to(roomName).emit('gameQuitted', { userQuit: socket.data.user, game: game })

    if (gameEngine.gameEnded(game)) {
      io.to(roomName).emit('gameEnded', game)
    }

    socket.leave(roomName)

    if (callback) {
      callback(game)
    }
  })

  socket.on('closeGame', (gameId, callback) => {
    if (!util.checkAuthenticatedUser(socket, callback)) {
      return
    }
    const roomName = 'game_' + gameId
    // Load game state from the game data stored directly on the room object
    const game = socket.adapter.rooms.get(roomName).game
    const closeResult = gameEngine.close(game, socket.id)
    if (closeResult !== true) {
      if (callback) {
        callback(closeResult)
      }
      return
    }

    socket.leave(roomName)

    if (callback) {
      callback(true)
    }
  })


});
