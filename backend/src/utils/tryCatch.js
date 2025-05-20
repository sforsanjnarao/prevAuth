export const tryCatch = (controller) => (req, res, next) =>
  controller(req, res, next).catch((err) => {
    res.status(err.statusCode || 500).json({ success: false, msg: err.message });
  });
