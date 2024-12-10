const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((err) => {
    return res.status(500).json({ error: err.message,
        message: "Đã xảy ra lỗi, vui lòng thử lại!", });
  });
};

export default asyncHandler;
