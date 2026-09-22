import "./src/config/env.config.js";
import express from "express";
import bootstrap from "./src/app.js";
const app = express();

await bootstrap(app, express);

// console.log(process.env);

app.listen(process.env.PORT, () => {
  console.log(`Server is running at port ${process.env.PORT}`);
});
