const express      = require('express');
const session      = require('express-session');
const httpProxy    = require('http-proxy');
const passport     = require('passport');
const nconf        = require('nconf');
const createServer = require('create-server');

nconf.argv().env().file({ file: 'oauth-proxy.json' });

function startServer(options) {
	const app = express();
	const server = createServer(options);

	app.disable('x-powered-by');
	server.on('request', app);

	return app;
}

function oauthify(app, strategy) {
	const module = strategy['module'] || 'passport-dataporten-oauth2';
	const strategyClass = require(module).Strategy;

	// Define how users should be serialized/deserialized; we just use verbatim.
	passport.serializeUser(function(user, done) {
		done(null, user);
	});
	passport.deserializeUser(function(user, done) {
		done(null, user);
	});

	// Define the authentication mechanism.
	passport.use(new strategyClass(strategy['options'],
		function(accessToken, refreshToken, profile, done) {
			done(null, profile);
		}
	));

	// Add session support to our Express application.
	app.use(session({
		cookie: { path: '/', httpOnly: false, secure: false, maxAge: null },
		secret: nconf.get('session:secret') || require('crypto').randomBytes(48).toString('hex'),
		resave: false,
		saveUninitialized: true
	}));

	// Use the strategy.
	app.use(passport.initialize());

	// Handle OAuth callback.
	app.get('/__oauth/callback/',
		passport.authenticate(strategy['name']),
		function(req, res) {
			// Successful authentication, redirect home.
			res.redirect('/');
		}
	);

	// enable for debugging purposes..
	app.get('/__oauth/token/',
		function(req, res) {
			res.writeHead(200, {
				'Content-Type': 'text/plain'
			});
			res.end(req.session.passport.user.accessToken);
		}
	);

	return app;
}

function authenticatify(func, strategy) {
	return function(req, res) {
		var session = req.session;
		if ('passport' in session) {
			var token = session.passport.user.accessToken;
			req.headers['authorization'] = 'Bearer ' + token; // add the bearer token
			delete req.headers['cookie'];
			return func(req, res);
		} else {
			return passport.authenticate(strategy) (req, res);
		}
	};
}

function proxify(req, res) {
	const proxy = httpProxy.createProxyServer({});
	const target = nconf.get('proxy:target') || 'https://example.com';

	var parsedTarget = require('url').parse(target);
	req.headers['host'] = parsedTarget.host; // hack to fix TLS-cert check

	var options = { target: target };
	proxy.web(req, res, options);
}

var app = startServer(nconf.get('server'));
oauthify(app, nconf.get('oauth:strategy'));
app.use(authenticatify(proxify, nconf.get('oauth:strategy:name') || 'dataporten'));
