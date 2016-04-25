const express      = require('express');
const createServer = require('create-server');

function startServer(options) {
	const app = express();
	const server = createServer(options);

	app.disable('x-powered-by');
	server.on('request', app);

	return app;
}
