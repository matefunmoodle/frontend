//export const SERVER = 'https://matefun.mybluemix.net';
//export const GHCI_URL = 'wss://matefun.mybluemix.net/endpoint';

//export const SERVER = 'http://localhost:9090';
//export const GHCI_URL = 'ws://localhost:9090/endpoint';

//Configuracion dinamica pensando en servidor con ip dinamica
//export const SERVER = window.location.protocol + '//' + window.location.host;//'http://localhost:9090';
export const SERVER = process.env.SERVERURL;
export const GHCI_URL = window.location.protocol == 'http:'?  'ws://'+window.location.host+'/endpoint': 'wss://'+window.location.host+'/endpoint';
