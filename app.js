const op    = require('./');
const nconf = require('nconf');

nconf.argv().env().file({ file: 'oauth-proxy.json' });

var app = startServer(nconf.get('server'));
op.oauthify(app, nconf.get('oauth:strategy'));
app.use(
	op.authenticatify(
		op.proxify(nconf.get('proxy:target') || 'https://example.com'),
		nconf.get('oauth:strategy:name') || 'dataporten'
	)
);
