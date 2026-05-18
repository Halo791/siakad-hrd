const http = require('http');

const port = process.env.PORT || 3001;

http
  .createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', service: 'siakad-api' }));
  })
  .listen(port);
