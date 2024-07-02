import jwt from 'jsonwebtoken';
import { errorHandler } from './error.js';

export const verifyToken = (req, res, next) => {
    //if will get the token from the cookie of the browser
    const token = req.cookies.access_token;
    if (!token) {
        return next(errorHandler(401, 'unauthorized'));
    }
    //user will contain the data of the user which represents the cookie
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return next(errorHandler(401, 'unauthorized'));
        }
        req.user = user;
        next();//this will go to next function in our case it is updateUser
    });
};
