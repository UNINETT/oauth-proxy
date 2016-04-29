const passport = require('passport');
const session  = require('express-session');

module.exports = oauthify;

function oauthify(app, strategy, customSession) {
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
	app.use(customSession || session({
		cookie: { path: '/', httpOnly: false, secure: false, maxAge: null },
		secret: require('crypto').randomBytes(48).toString('hex'),
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
			var data = req.session.oauth_proxy || {}
			res.redirect(data.url || '/');
			delete req.session.oauth_proxy.url;
		}
	);

	return app;
}
