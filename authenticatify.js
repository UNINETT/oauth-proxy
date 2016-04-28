const passport = require('passport');

module.exports = authenticatify;

function authenticatify(func, strategy) {
	return function(req, res, next) {
		var session = req.session;
		if ('passport' in session) {
			var token = session.passport.user.accessToken;
			req.headers['authorization'] = 'Bearer ' + token; // add the bearer token
			delete req.headers['cookie'];
			return func(req, res, next);
		} else {
			session.oauth_proxy = {url:req.url};
			return passport.authenticate(strategy) (req, res);
		}
	};
}
