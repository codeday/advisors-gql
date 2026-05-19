declare module 'graphql-upload' {
    import type { ReadStream } from 'fs';
    import type { GraphQLScalarType } from 'graphql';
    import type { RequestHandler } from 'express';

    export interface FileUpload {
        filename: string;
        mimetype: string;
        encoding: string;
        createReadStream(): ReadStream;
    }

    export const GraphQLUpload: GraphQLScalarType;

    export function graphqlUploadExpress(options?: {
        maxFileSize?: number;
        maxFiles?: number;
    }): RequestHandler;
}