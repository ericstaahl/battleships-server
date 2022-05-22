/**
 * Socket Controller
 */

const debug = require('debug')('battleships-server:socket_controller');
let io = null; // socket.io server instance
let rooms = {}
let nextUserId = 0
let nextRoomId = 0
let currentRoomId = 0
let emptyRoomExists = false

const getRoomKey = (socket) => {
	// get the object key of the room
	const roomOfUser = Object.values(rooms).find(room => {
		return room.users.hasOwnProperty(socket.id)
	})
	if (roomOfUser) {
		// find the id of the room the user was in
		return Object.keys(rooms).find(key => rooms[key] === roomOfUser)
	}
	return null
}

// Handle users searching for a game
const handleGameSearch = function () {
	// Check for room with less than 2 users before creating a new one
	emptyRoomExists = Object.values(rooms).find(room => Object.keys(room.users).length < 2)
	// if the rooms object is empty or the rooms are all full, save a representation of a new room
	if (Object.keys(rooms).length === 0 || !emptyRoomExists) {
		// Create and join a room (this creates a proper socket.io room)
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
		io.in(`game${currentRoomId}`).emit("gameFound")
	}
	debug("Specific room:", JSON.stringify(rooms[currentRoomId].users))
	// Save user in room representation
	rooms[currentRoomId].users[this.id] = `user${nextUserId}`
	// Add 1 to nextUserId so that the next socket id gets a unique identifier
	nextUserId++
	debug(rooms)
	// Emit a message to the current user's room
	io.in(`game${currentRoomId}`).emit("HiRoom")
	// Log how many users there are in the room
	debug("Number of users in the room:", io.sockets.adapter.rooms.get(`game${currentRoomId}`).size)
}

// // Handle user disconnecting during a game
// const handleUserDisconnect = (id) => {
// 	debug(io.sockets.adapter.rooms)
// }


/** 
 * Export controller and attach handlers to events
 *
 */
module.exports = function (socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	io.on('connection', async () => {
		debug(`User ${socket.id} connected`)
		// debug(`All clients: `, await io.allSockets())
	})

	socket.on('disconnecting', () => {
		// debug("Rooms user were in:", socket.rooms)
		// debug("Rooms BEFORE leaving", io.sockets.adapter.rooms)

		// find the key of the room the user was in
		const idOfRoom = getRoomKey(socket)
		debug("ID of room on disconnecting:", idOfRoom)
		//Emit message to user who is left in the room
		if (idOfRoom) {
			io.in(rooms[idOfRoom].id).emit("userLeft", "Your opponent left.")
		}

		debug("Room to disconnect:", rooms[idOfRoom]?.id)
		// disconnect all users from the socket.io room (which deletes it)
		if (idOfRoom) {
			io.socketsLeave(rooms[idOfRoom].id)
		}
		debug("Rooms AFTER leaving", io.sockets.adapter.rooms)

	})

	socket.on('disconnect', () => {
		debug(`User ${socket.id} disconnected`)
		// find the key of the room the user was in
		const idOfRoom = getRoomKey(socket)
		// delete the representation of the room the user was in
		if (idOfRoom) {
			delete rooms[idOfRoom]
		}

		debug("Rooms after deletion:", rooms)
	})

	socket.on('joinGame', handleGameSearch)

}