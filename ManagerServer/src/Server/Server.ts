import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Utils } from './Utils';
import { LoginHandler } from './LoginHandler';
import { Authorizerwee } from '../Authorization/Authorizer';
import { UsersHandler } from './UsersHandler';
import { Monitor } from '../Shared/ObjectsCounter';

export class Server {

    private authorizer: Authorizerwee = new Authorizerwee();

    public createServer() {
        createServer(
            async (req: IncomingMessage, res: ServerResponse) => {
                console.log(`got request from ${req.headers["user-agent"]} for ${req.url}`);
                this.addCorsHeader(res);
                const basePath = Utils.getUrlBasePath(req.url);

                switch (basePath) {
                    case 'systemInfo':
                        res.write(Monitor.printInstances());
                        break;
                    case 'login':
                        await new LoginHandler(req, res, this.authorizer).handleRequest();
                        break;
                    case 'users':
                        await new UsersHandler(req, res, this.authorizer).handleRequest();
                        break
                    default:
                        break;
                }

                res.end();
            }
        ).listen(8080);
        console.log('server started')
    }

    private addCorsHeader(res: ServerResponse) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.setHeader('Access-Control-Allow-Headers', '*');
    }
}