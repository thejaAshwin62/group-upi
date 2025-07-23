import { StatusCodes } from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
  let customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    msg: err.message || "Something went wrong. Try again later.",
  };

  // Include stack trace only in development
  if (process.env.NODE_ENV === "development") {
    customError.stack = err.stack;
  }

  return res.status(customError.statusCode).json(customError);
};

export default errorHandlerMiddleware;
