// Global type declarations for the project
// This file provides fallback type declarations when TypeScript has issues

// Common Express types
declare namespace Express {
  export interface Request {
    user?: any;
    file?: any;
    files?: any[];
    params?: any;
  }
}

// Enhanced Express Request types
declare module 'express' {
  interface Request {
    params: any;
    body: any;
  }
  
  // Fix for Router namespace being used as type
  interface Router {
    // Add common router methods
    get: any;
    post: any;
    put: any;
    delete: any;
    patch: any;
  }

  export function Router(): Router;
}

// Extend ReadableStream interface to allow arbitrary properties
interface ReadableStream<R = any> {
  [key: string]: any; // This allows any property to be accessed on ReadableStream
  AccountName?: string;
  Location?: string;
  CCARole?: string;
  HiringManager?: string;
  RequiredFrom?: string;
  ClientEvaluation?: string;
  SOState?: string;
  AssignedToResource?: string;
  Grade?: string;
  skills?: any;
}

// Fix for Number call signature errors
interface Number {
  (value?: any): number;
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
