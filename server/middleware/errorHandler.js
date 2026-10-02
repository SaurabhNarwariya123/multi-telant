const notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

const normalize = (err) => {
  if (err.name === 'ValidationError') return { status: 400, message: err.message };
  if (err.name === 'CastError') return { status: 400, message: `Invalid ${err.path}` };
  if (err.code === 11000) return { status: 409, message: 'Already exists' };
  return { status: 500, message: 'Something went wrong' };
};

const errorHandler = (err, req, res, next) => {
  const { status, message } = normalize(err);
  if (status === 500) console.error(err);
  res.status(status).json({ message });
};

export { notFound, errorHandler };
