const httpProxy = require('http-proxy');

module.exports = proxify;

function createProxy(options) {
	const proxy = httpProxy.createProxyServer(options);

	proxy.on('proxyRes', function (proxyRes, req, res) {
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

	// Listen for the `error` event on `proxy`.
	proxy.on('error', function (err, req, res) {
		res.writeHead(500, {
			'Content-Type': 'text/plain'
		});

		res.end(JSON.stringify(err) + "\n");
	});

	return proxy;
}
