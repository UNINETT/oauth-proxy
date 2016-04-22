const express      = require('express');
const session      = require('express-session');
const httpProxy    = require('http-proxy');
const passport     = require('passport');
const nconf        = require('nconf');
const crypto       = require('crypto');
const createServer = require('create-server');

const app = express();
nconf.argv().env().file({ file: 'oauth-proxy.json' });
const strategy = nconf.get('oauth:strategy:module') || 'passport-dataporten-oauth2';
const target = nconf.get('proxy:target') || 'https://example.com';
const parsedTarget = require('url').parse(target);
const strategyClass = require(strategy).Strategy;
const server = createServer(nconf.get('server'));
const proxy = httpProxy.createProxyServer({});

// Add session support to our Express application.
app.use(session({
	secret: nconf.get('session:secret') || crypto.randomBytes(48).toString('hex'),
	resave: false,
	saveUninitialized: true
}));

// Define how users should be serialized/deserialized; we just use verbatim.
passport.serializeUser(function(user, done) {
	done(null, user);
});
passport.deserializeUser(function(user, done) {
	done(null, user);
});

// Define the authentication mechanism.
passport.use(new strategyClass(nconf.get('oauth:strategy:options'),
	function(accessToken, refreshToken, profile, done) {
		done(null, profile);
	}
));

// Use the strategy.
app.use(passport.initialize());

// Handle OAuth callback.
app.get('/__oauth/callback/',
	passport.authenticate(nconf.get('oauth:strategy:name')),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/');
	}
);

// enable for debugging purposes..
/*
app.get('/__oauth/token/',
	function(req, res) {
		var session = req.session;
		res.end(session.passport.user.accessToken);
	}
);
*/

app.use(function(req, res) {
	var session = req.session;
	if ('passport' in session) {
		var token = session.passport.user.accessToken;
		var options = { target: target };
		req.headers['host'] = parsedTarget.host; // hack to fix TLS-cert check
		req.headers['authorization'] = 'Bearer ' + token; // add the bearer token
		delete req.headers['cookie'];
		proxy.web(req, res, options);
	} else {
		passport.authenticate(nconf.get('oauth:strategy:name')) (req, res);
	}
});

app.disable('x-powered-by');
server.on('request', app);
