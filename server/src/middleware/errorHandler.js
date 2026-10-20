import { ApiError } from '../utils/ApiError.js';

// Runs when no route matched
export function notFound(req, res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

// Express recognizes an error handler by its 4 parameters, so keep all 4
export function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Duplicate key (e.g. same email, same category name, same budget)
  if (err.code === 11000) {
    status = 409;
    message = 'Value already in use';
  }

  if (status === 500) {
    console.error(err); // log the real error for you
    message = 'Internal server error'; // don't leak details to the client
  }

  res.status(status).json({
    message,
    ...(err.details && { errors: err.details }),
  });
}
