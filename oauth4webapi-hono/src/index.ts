import { serve } from "@hono/node-server";
import { Hono } from "hono";
import routes from "./app.js";

const app = new Hono().route("/", routes);
if (!process.env.VERCEL)
	serve({ fetch: app.fetch, port: Number(process.env.PORT || 3000) });
export default app;
