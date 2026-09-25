import { startDemoApp } from "demo-kit";

const port = Number(process.env.PORT ?? 3002);

const { address } = await startDemoApp({
  // Intentionally wrong for the demo.
  rejectExpiredTokens: false,
  port,
});

console.log(`demo-invalid listening at ${address}`);
