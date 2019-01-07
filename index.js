const http = require('http');
const client = require('https').get;

const getConfig = require('./config');

const routes = {
    "/": (req, res) => {
        res.writeHead(200);
        res.write('Hello World');
        res.end();
    },
    // the api from the point of view of the client
    "/api/latest": (req, res) => {
        const config = getConfig();
        // get the user they requested for
        client(config.apiEndpoint, (getRes) => {
            if (getRes.statusCode === 200) {
                getRes.pipe(res);
                return true;
            }

            res.write(`Request failed with ${getRes.statusCode}`);
            res.end();
        });
    },
    // a self mock to use in dev
    // usually, this will be a mock server running separately
    // in a different process
    "/mock/api/latest": (req, res) => {
        const mockJson = require('fs').readFileSync('mocks/latest.json').toString();
        res.write(mockJson);
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
    console.log(getConfig());
    console.log('App Started');
});

// gracefully shutdown
process.on('SIGINT', () => {
    console.log('shutting down gracefully');
    server.close();
});