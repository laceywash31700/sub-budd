import nodemailer from 'nodemailer';
import { EMAIL_PASSWORD } from './env.js';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'lacey.m.washington@gmail.com',
        pass: EMAIL_PASSWORD
    }
})