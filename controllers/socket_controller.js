/**
 * Socket Controller
 */

const debug = require('debug')('chat:socket_controller');
let io = null; // socket.io server instance

/**
 * Export controller and attach handlers to events
 *
 */
module.exports = function(socket, _io) {
	// save a reference to the socket.io server instance
	io = _io;

	debug(`Client ${socket.id} connected`)

	socket.on('message', () => {
		console.log('Message recieved!')
	})
}
