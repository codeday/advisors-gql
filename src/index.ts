import 'reflect-metadata';
// import { startIntroducing } from './matching';
import server from './server';
import { registerDi } from './di';

(async () => {
  registerDi();
  // startIntroducing();
  server();
})();
