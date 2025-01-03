import multer from "multer";

const storageAvatar = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/avatars");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const storageProduct = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/products");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const uploadAvatar = multer({ storage: storageAvatar });
const uploadProduct = multer({ storage: storageProduct });

export default {
  uploadAvatar: uploadAvatar,
  uploadProduct: uploadProduct,
};
