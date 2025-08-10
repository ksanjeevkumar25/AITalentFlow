// Global type declarations for the project
// This file provides fallback type declarations when TypeScript has issues

// Common Express types
declare namespace Express {
  export interface Request {
    user?: any;
    file?: any;
    files?: any[];
  }
}

// Extend global NodeJS namespace for environment variables
declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT?: string;
    DB_SERVER?: string;
    DB_USER?: string;
    DB_PASSWORD?: string;
    DB_DATABASE?: string;
    DB_ENCRYPT?: string;
    DB_TRUST_SERVER_CERTIFICATE?: string;
    JWT_SECRET?: string;
    [key: string]: string | undefined;
  }
}

// Declare any modules without type definitions to avoid TS errors
declare module '*.json' {
  const value: any;
  export default value;
}

// Add any missing module declarations here
declare module 'body-parser-xml' {
  const bodyParserXml: any;
  export = bodyParserXml;
}

// Fallback for any untyped imports
declare module '*';
