import multer, {FileFilterCallback} from "multer";
import fs from 'fs';
import config from "../../config";
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        fs.mkdirSync(config.uploadsFolder, { recursive: true });
        cb(null, config.uploadsFolder)
    },
    filename: (req, file, cb) => {
        const fileExtension = file.originalname.split('.').pop();
        const fileName = `${uuid()}.${fileExtension}`;
        cb(null, fileName)
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        if (req.body.type === 'image') {
            if (file.mimetype === 'image/jpg' || file.mimetype == "image/jpeg" || file.mimetype === 'image/png' || file.mimetype == "image/gif") {
                cb(null, true);
            } else {
                cb(new Error('filetype-error'));
            }
        } else if (req.body.type === 'song') {
            if (file.mimetype === 'audio/mpeg' || file.mimetype == "audio/ogg" || file.mimetype === 'audio/wav') {
                cb(null, true);
            } else {
                cb(new Error('filetype-error'));
            }
        } else {
            cb(new Error('type-not-valid'));
        }

    },
    limits: {
        fileSize: 1024 * 1024
    }
});

export default upload;