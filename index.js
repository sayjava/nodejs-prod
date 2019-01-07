const fs = require('fs');
const httpServer = require('http');
const getConfig = require('./config');

// this is needed only because the remote api endpoint uses https
const isProd = process.env.NODE_ENV === "production";
const client = isProd ? require('https').get : require('http').get;

const routes = {
    "/": (req, res) => {
        res.writeHead(200);
        fs.createReadStream('views/index.html').pipe(res);
    },
    // the api from the point of view of the client
    "/api/latest": (req, res) => {
        const config = getConfig();

        // using the api endpoint in the config env, call the appropiate exchange endpoint
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
        const mockJson = fs.readFileSync('mocks/latest.json').toString();
        res.write(mockJson);
        res.end();
    }
}

const server = httpServer.createServer((req, res) => {
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