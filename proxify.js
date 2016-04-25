const httpProxy = require('http-proxy');

module.exports = proxify;

function proxify(target) {
	return function(req, res) {
		const proxy = httpProxy.createProxyServer({});

		var parsedTarget = require('url').parse(target);
		req.headers['host'] = parsedTarget.host; // hack to fix TLS-cert check

		var options = { target: target };
		proxy.web(req, res, options);
	}
}
