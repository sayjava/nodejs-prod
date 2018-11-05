const http = require('http');

const routes = {
    "/": (req, res) => {
        res.writeHead(200);
        res.write('Hello World');
        res.end();
    }
}

const server = http.createServer((req, res) => {
    const handler = routes[req.url];

    if (handler) {
        handler(req, res);
        return true;
    }

    res.write('unknown endpoint');
    res.end();
});

server.listen(8080, () => {
    console.log('Node Prod app started');
});

// gracefully shutdown
process.on('SIGINT', () => {
    console.log('shutting down gracefully');
    server.close();
});