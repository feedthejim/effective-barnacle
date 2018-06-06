export const MONGO_HOST = process.env.EB_MONGO_HOST || 'localhost';
export const PORT = process.env.EB_ORCHESTRATOR_PORT || 9000;
export const DEFAULT_SERVERS_NB = process.env.EB_DEFAULT_SERVERS_NB || 5;
export const SERVER_IMAGE = process.env.EB_SERVER_DOCKER_IMAGE || 'eb-back';
export const DOMAIN_NAME = process.env.EB_DOMAIN_NAME || 'localhost';
export const MAX_CLIENTS_PER_SERVER = process.env.EB_MAX_CLIENTS_PER_SERVER || 5;
export const SECRET = process.env.EB_ORCHESTRATOR_SECRET || 'secret';
