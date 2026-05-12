import serverlessExpress from "@codegenie/serverless-express";
import { createMcpApp } from "./app";

const app = createMcpApp();

// Reuse the same Express app across warm invocations.
export const handler = serverlessExpress({ app });
