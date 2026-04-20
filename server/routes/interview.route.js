import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"
import { analyzeResume, finishInterview, generateQuestion, getInterviewReport, getMyInterviews, submitAnswer } from "../controllers/interview.controller.js"

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const interviewRouter = express.Router()

// Multer error handler
const handleMulterError = (err, req, res, next) => {
  if (err && err.name === 'MulterError') {
    console.error("Multer error:", err.message);
    if (err.code === 'FILE_TOO_LARGE') {
      return res.status(413).json({ message: "File too large. Max 10MB allowed." });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: "Only one file allowed." });
    }
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message) {
    console.error("Upload error:", err.message);
    return res.status(400).json({ message: err.message });
  }
  next();
};

// Resume upload with error handling
interviewRouter.post(
  "/resume",
  isAuth,
  (req, res, next) => {
    console.log("Resume upload request received");
    upload.single("resume")(req, res, (err) => {
      handleMulterError(err, req, res, () => {
        asyncHandler(analyzeResume)(req, res, next);
      });
    });
  }
);

interviewRouter.post("/generate-questions", isAuth, asyncHandler(generateQuestion))
interviewRouter.post("/submit-answer", isAuth, asyncHandler(submitAnswer))
interviewRouter.post("/finish", isAuth, asyncHandler(finishInterview))

interviewRouter.get("/get-interview", isAuth, asyncHandler(getMyInterviews))
interviewRouter.get("/report/:id", isAuth, asyncHandler(getInterviewReport))

export default interviewRouter