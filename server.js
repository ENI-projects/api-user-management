const Hapi = require('@hapi/hapi');
require('dotenv').config({ path: '.env.' + process.env.NODE_ENV })

const init = async () => {

    const server = Hapi.server({
        port: 3000,
        host: '0.0.0.0'
    });

    server.route({
      method: 'POST',
      path: '/',
      handler: (request, h) => {
          return request.payload;
      }
  });

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

    console.log(err);
    process.exit(1);
});

init();