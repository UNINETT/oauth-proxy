# Generic OAuth-proxy

An HTTP proxy that requires OAuth authentication, removes cookies and adds
OAuth bearer tokens.  This will allow webbrowsers to communicate with
API-servers.


## Configuration

Configuration is done through the **oauth-proxy.json** config file.  The
following values can be set:


### `oauth`:`strategy`:`name`

The name of the Passport OAuth strategy, for example `dataporten`.


### `oauth`:`strategy`:`module`

The name of the Passport OAuth strategy module, for example
`passport-dataporten`.


### `oauth`:`strategy`:`options`:`clientID`

The client ID of your application, as provided by your OAuth provider.


### `oauth`:`strategy`:`options`:`clientSecret`

The client secret of your application, as provided by your OAuth provider.


### `oauth`:`strategy`:`options`:`callbackURL`

The callback URL of your application:

	https://example.com/__oauth/callback/


### `proxy`:`target`

The URL where the backend API lives.  OAuth Bearer tokens are sent here.


### `session`:`secret`

Optional, makes it possible to set a hardcoded secret.  If omitted, a secret
is generated on server start.


### `server`:`port`

The proxy server will listen on this port.


### `server`:`hostname`

Listen address for server, recommended value `::`.


### `server`:`listen`

Set to `true`.


## Usage

	npm install
	npm start


## About

This project was written for UNINETT AS in order to allow
webbrowser-applications to use APIs protected by Dataporten API Gatekeeper.
Check https://docs.dataporten.no for more information.

The proxy should be provider-agnostic, but this has not been tested.
Patches welcome.


# Thanks

- [Jørn Åne](https://github.com/jornane)
- [UNINETT AS](https://www.uninett.no)
- [Dataporten](https://docs.dataporten.no)
