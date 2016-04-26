const op          = require('./');
const nconf       = require('nconf');
const startServer = require('./server.js')

nconf.argv().env().file({ file: 'oauth-proxy.json' });

var app = startServer(nconf.get('server'));
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

app.use(
	op.authenticatify(
		op.proxify(nconf.get('proxy:target') || 'https://example.com'),
		nconf.get('oauth:strategy:name') || 'dataporten'
	)
);
