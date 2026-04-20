import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js"

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const interviewRouter = express.Router()

interviewRouter.post("/resume", isAuth, upload.single("resume"), asyncHandler(analyzeResume))
interviewRouter.post("/generate-questions", isAuth, asyncHandler(generateQuestion))
interviewRouter.post("/submit-answer", isAuth, asyncHandler(submitAnswer))
interviewRouter.post("/finish", isAuth, asyncHandler(finishInterview))

interviewRouter.get("/get-interview", isAuth, asyncHandler(getMyInterviews))
interviewRouter.get("/report/:id", isAuth, asyncHandler(getInterviewReport))

export default interviewRouter