// Forwards rejected promises from async controllers to the error middleware.
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;
