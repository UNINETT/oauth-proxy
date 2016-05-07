const op          = require('./');
const nconf       = require('nconf');
const express      = require('express');
const createServer = require('create-server');


nconf.argv().env().file({ file: 'oauth-proxy.json' });

const app = express();
const server = createServer(nconf.get('server'));
const proxy = op.createProxy(nconf.get('proxy'))

app.disable('x-powered-by');
op.oauthify(app, nconf.get('oauth:strategy'));

// enable for debugging purposes..
/*
app.get('/__oauth/token/',
	function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'text/plain'
		});
		res.end(req.session.passport.user.accessToken);
	}
);
app.get('/__oauth/user/',
	function(req, res) {
		res.writeHead(200, {
			'Content-Type': 'application/json'
		});
		res.end(JSON.stringify(req.session.passport.user));
	}
);
*/

server.on('request', app);
server.on('upgrade', function(req, socket, head) {
	proxy.ws(req, socket, head);
});

app.use(
	op.authenticatify(
		function (req, res) {
			var parsedTarget = require('url').parse(nconf.get('proxy:target'));
			req.headers['host'] = parsedTarget.host; // hack to fix TLS-cert check
			proxy.web(req, res);
		},
		nconf.get('oauth:strategy:name') || 'dataporten'
	)
);
