import { startDemoApp } from "demo-kit";

const port = Number(process.env.PORT ?? 3001);

const { address } = await startDemoApp({
  rejectExpiredTokens: true,
  port,
});

console.log(`demo-valid listening at ${address}`);
