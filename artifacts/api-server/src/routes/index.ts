import { Router, type IRouter } from "express";
import healthRouter from "./health";
import usersRouter from "./users";
import votesRouter from "./votes";
import commentsRouter from "./comments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(usersRouter);
router.use(votesRouter);
router.use(commentsRouter);

export default router;
