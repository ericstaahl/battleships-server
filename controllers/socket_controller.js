/**
 * Socket Controller
 */

const debug = require('debug')('battleships-server:socket_controller');
let io = null; // socket.io server instance
let rooms = []
let nextUserId = 0
let nextRoomId = 0
let currentRoomId = 0
let emptyRoomExists = false

const handleGameSearch = function () {
	// Check for empty room before creating a new one
	emptyRoomExists = Object.values(rooms).find(room => Object.keys(room.users).length < 2)
	// if the rooms object is empty or the rooms are all full, save a representation of a new room
	if (rooms.length === 0 || !emptyRoomExists) {
		// Create and join a room
		this.join(`game${nextRoomId}`)
		rooms[nextRoomId] = {
			id: `game${nextRoomId}`,
			users: {}
		}
		// Save the current room id for later access
		currentRoomId = nextRoomId
		// Add 1 to nextRoomId so that the next created room gets a unique identifier
		nextRoomId++
	}
	else {
		// Join a room
		this.join(`game${currentRoomId}`)
	}
	console.log("Specific room" + rooms[currentRoomId].users)
	rooms[currentRoomId].users[`user${nextUserId}`] = this.id
	// Add 1 to nextUserId so that the next socket id gets a unique identifier
	nextUserId++
	console.log(rooms)
	// Emit a message to the current user's room
	io.in(`game${currentRoomId}`).emit("HiRoom")
}

/** 
 * Export controller and attach handlers to events
 *
 */
module.exports = function (socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	io.on('connection', async () => {
		debug(`User ${socket.id} connected`)
		debug(`All clients: `, await io.allSockets())
	})

	socket.on('disconnect', () => {
		debug(`User ${socket.id} disconnected`)
	})

	socket.on('joinGame', handleGameSearch)

}