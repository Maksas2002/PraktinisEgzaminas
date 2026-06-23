export function notFoundHandler(req, res) {
  res.status(404).json({
    error: {
      message: "REST API adresas nerastas.",
      path: req.originalUrl,
    },
  });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  const statusCode = error.statusCode || 500;
  const response = {
    error: {
      message:
        statusCode === 500
          ? "Įvyko vidinė serverio klaida."
          : error.message,
    },
  };

  if (error.details) response.error.details = error.details;
  if (process.env.NODE_ENV !== "production" && statusCode === 500) {
    response.error.debug = error.message;
  }

  res.status(statusCode).json(response);
}

