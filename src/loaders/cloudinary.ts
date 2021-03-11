import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

export default () => {
    cloudinary.config({
        cloud_name: config.cloudinary.name,
        api_key: config.cloudinary.key,
        api_secret: config.cloudinary.secret
    });
}