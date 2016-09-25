const httpProxy = require('http-proxy');

module.exports = proxify;

function proxify(target) {
	const proxy = httpProxy.createProxyServer({});

	proxy.on('proxyRes', function (proxyRes, req, res) {
		// Remove any HSTS headers, as we don't support HTTPS.
		// If HSTS is required, the reverse proxy in front
		// should add them again.
		//
		// If we don't do this, and both the backend and the
		// reverse proxy in front set HSTS, we may end up with
		// a mangled HSTS header.
		delete proxyRes.headers['strict-transport-security']

		// If we get a 401 back, our token is no longer valid.
		// The proxy doesn't know how to fix it,
		// so we'll just remove the session.
		if (proxyRes.statusCode == 401) {
			for(var key in req.session)
				if (key !== 'cookie')
					delete req.session[key];
			// Now redirect to self so that the client will re-attempt
			// the request without a valid session.
			proxyRes.statusCode = 307;
			proxyRes.headers['Location'] = req.url;
		}
	});

	return function(req, res) {
		var parsedTarget = require('url').parse(target);
		req.headers['host'] = parsedTarget.host; // hack to fix TLS-cert check

		var options = { target: target };
		proxy.web(req, res, options);
	}
}
