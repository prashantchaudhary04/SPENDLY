import { ApiError } from '../utils/ApiError.js';

// validate(schema)           -> checks req.body, replaces it with the cleaned data
// validate(schema, 'query')  -> checks req.query, cleaned data goes to req.validatedQuery
//                               (in Express 5, req.query is read-only, so we can't overwrite it)
export const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source]);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return next(new ApiError(400, 'Validation failed', errors));
  }

  if (source === 'body') req.body = result.data;
  else req.validatedQuery = result.data;
  next();
};

// Rejects URLs like /api/transactions/abc before they reach MongoDB
export function validateId(req, res, next) {
  if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
    return next(new ApiError(400, 'Invalid id'));
  }
  next();
}
