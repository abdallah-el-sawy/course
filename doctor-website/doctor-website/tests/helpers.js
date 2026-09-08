const app = require('../server');

let server;
let baseUrl;

async function startServer() {
  return new Promise((resolve) => {
    server = app.listen(0, () => {
      const { port } = server.address();
      baseUrl = `http://127.0.0.1:${port}`;
      resolve(baseUrl);
    });
  });
}

async function stopServer() {
  return new Promise((resolve) => server.close(resolve));
}

function url(path) {
  return `${baseUrl}${path}`;
}

module.exports = { startServer, stopServer, url };
