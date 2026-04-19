/**
 * Standardized API response helpers
 */
export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

export const sendError = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};
