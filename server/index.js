"use strict";
const restify = require('restify');
const Router = require('./src/routes');
const tagImage = require('./src/tagImage');

class Server {
    constructor(port) {      
        this.port = port;
        
        this.server = restify.createServer({
            name: 'projectSite'
        });
        
        this.server.use(restify.CORS({
                origins: ['*'],
                credentials: true,
                headers: ['authorization', 'content-type', 'accept', 'origin', 'sid'],
                methods: ['GET', 'PUT', 'POST', 'HEAD', 'DELETE']
            }))
            .use(restify.bodyParser())
            .use(restify.queryParser())
            .use(restify.authorizationParser());

        this.router = new Router(this.server);
        
        this.server.listen(this.port, (err) => {
            if (err) {
                console.error(err);
            } else {
                console.log('App is ready at : ' + port);
            }
        });
        
        tagImage.getToken();
    }
}

new Server(3333);
