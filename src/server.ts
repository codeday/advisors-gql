import Express from 'express';
import http from 'http';
import { ApolloServer } from 'apollo-server-express';
import {
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from 'apollo-server-core';
import { graphqlUploadExpress } from 'graphql-upload';
import { createSchema } from './schema';
import { createContext as context } from './context';
import config from './config';

export default async function server(): Promise<void> {
  const apollo = new ApolloServer({
    schema: await createSchema(),
    introspection: true,
    context,
    plugins: [config.debug ? ApolloServerPluginLandingPageGraphQLPlayground() : ApolloServerPluginLandingPageDisabled()],
  });

  const app = Express();
  app.use(graphqlUploadExpress({ maxFileSize: 100 * 1024 * 1024, maxFiles: 3 }));
  await apollo.start();
  apollo.applyMiddleware({ app });

  const server = http.createServer(app);
  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listening on http://0.0.0.0:${config.port}`);
  });
}
