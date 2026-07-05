import { Router } from "express";
import usersRouter from "./users";
import votesRouter from "./votes";
import commentsRouter from "./comments";
import adminRouter from "./admin";

const router = Router();

router.use(usersRouter);
router.use(votesRouter);
router.use(commentsRouter);
router.use(adminRouter);

export default router;
