import { websocketServer } from './websocketServer';

// tslint:disable-next-line: export-name
export const handler = websocketServer.createWebsocketHandler();
