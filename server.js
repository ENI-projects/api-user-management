require('dotenv').config({ path: '.env.' + process.env.NODE_ENV })
const Hapi = require('@hapi/hapi');
const routes = require('./src/users/routes');
const authKeycloak = require('hapi-auth-keycloak');

const KEYCLOAK_PROTOCOL = process.env.KEYCLOAK_PROTOCOL || 'http';
const KEYCLOAK_DOMAIN = process.env.KEYCLOAK_DOMAIN || '';
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM || '';
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || '';
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || '';

const KEYCLOAK_URL = `${KEYCLOAK_PROTOCOL}://${KEYCLOAK_DOMAIN}/auth/realms/${KEYCLOAK_REALM}`

const init = async () => {
  const server = Hapi.server({
    port: 3000,
    host: '0.0.0.0',
  });

  const authPluginOptions = {}
  const authStrategyOptions = {
    realmUrl: KEYCLOAK_URL,
    clientId: KEYCLOAK_CLIENT_ID,
    secret: KEYCLOAK_CLIENT_SECRET,
    userInfo: ['name', 'email']
  };

  await server.register([
    {
      plugin: authKeycloak,
      options: authPluginOptions
    }
  ]);

  server.auth.strategy('keycloak-jwt', 'keycloak-jwt', authStrategyOptions);

  server.route(routes);

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();
