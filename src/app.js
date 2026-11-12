import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./middleware/global.error.middleware.js";
import authRouter from "./modules/auth/auth.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import userRouter from "./modules/user/user.controller.js";
import helmet from "helmet";
import cors from "cors";
import { generateLimiter } from "./common/utils/limiter.js";

const bootstrap = async (app, express) => {
  app.use("/uploads", express.static("./uploads"));

  // db connected
  await connectDB();

  app.set("trust proxy", true);
  // const limiter = generateLimiter({});

  // parse body
  app.use(helmet(), cors(), express.json());

  // router middleware
  //   app.get("/", (req, res) => res.json("healthy router"));
  app.use("/auth", authRouter);
  app.use("/user", userRouter);
  app.use("/message", messageRouter);

  // not found handler
  app.use((req, res) => {
    throw new Error("Router Not Found!", { cause: { status: 404 } });
  });

  // error handling middleware
  app.use(globalErrorHandling);
};

export default bootstrap;
