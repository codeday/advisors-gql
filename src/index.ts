import 'reflect-metadata';
import { startIntroducing } from './matching';
import server from './server';
import { registerDi } from './di';
import config from './config';

(async () => {
  registerDi();
  if (!config.disableAutomation) startIntroducing();
  server();
})();
