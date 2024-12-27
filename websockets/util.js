exports.createUtil = () => { 
    // Global util functions to use in the socket.io
    const checkAuthenticatedUser = (socket, callback) => {
        if (!socket.data.user) {
            if (callback) {
                callback({
                    errorCode: 2,
                    errorMessage: 'User is not authenticated!'
                })
            }
            return false
        }
        return true
    }

    const getRoomGamesPlaying = (socket) => {
    const rooms = socket.adapter.rooms;
    // roomsPlaying = MAP with the list of rooms where the current socket is playing
    return [...rooms].filter(([k, v]) => {
        // Ensure the room is a game room
        if (k.indexOf('game_') !== 0) return false;

        // Check if the current socket ID is among the players' socket IDs
        const players = v.game?.players || []; // Safely access players in game
        return players.some(player => player.socketId === socket.id);
    });
};

    const getGamesPlaying = (socket) => {
        return getRoomGamesPlaying(socket).map(([k, v]) => v.game)
    }

    return {
        checkAuthenticatedUser, getRoomGamesPlaying, getGamesPlaying
    }
}