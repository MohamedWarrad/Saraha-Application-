import connectDB from "./DB/connection.js";
import { globalErrorHandling } from "./middleware/global.error.middleware.js";
import authRouter from "./modules/auth/auth.controller.js";
import messageRouter from "./modules/message/message.controller.js";
import userRouter from "./modules/user/user.controller.js";

const bootstrap = async (app, express) => {
  // db connected
  await connectDB();

  // parse body
  app.use(express.json());

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
