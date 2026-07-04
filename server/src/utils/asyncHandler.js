// Express 4 doesn't forward rejected promises from async route handlers to
// the error middleware on its own — wrap every async handler with this so
// a thrown/rejected error becomes a 500 instead of a hung request.
export function asyncHandler(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
}
