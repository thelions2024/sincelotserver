import multer from "multer";
import path from "path"


// const storage = multer.memoryStorage();
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads/promotion')
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

export const singleUploadForPromotion = multer(
    {
        storage,
    }
).single("file")