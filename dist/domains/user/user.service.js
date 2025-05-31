"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtp = sendOtp;
exports.verifyOtp = verifyOtp;
exports.signupUser = signupUser;
exports.signinUser = signinUser;
const user_model_1 = require("./user.model");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const dayjs_1 = __importDefault(require("dayjs"));
dotenv_1.default.config();
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
const OTP_EXPIRATION_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 45;
const transporter = nodemailer_1.default.createTransport({
    host: process.env.MAIL_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
});
function generateSixDigitCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
async function sendOtp(email) {
    const recent = await user_model_1.prisma.oTP.findFirst({
        where: {
            email,
            used: false,
        },
        orderBy: {
            createdAt: "desc",
        },
    });
    if (recent) {
        const secondsSince = (0, dayjs_1.default)().diff((0, dayjs_1.default)(recent.createdAt), "second");
        if (secondsSince < OTP_COOLDOWN_SECONDS) {
            const wait = OTP_COOLDOWN_SECONDS - secondsSince;
            throw new Error(`Please wait ${wait}s before requesting a new OTP.`);
        }
    }
    const code = generateSixDigitCode();
    const expiresAt = (0, dayjs_1.default)().add(OTP_EXPIRATION_MINUTES, "minute").toDate();
    await user_model_1.prisma.oTP.create({
        data: {
            email,
            code,
            expiresAt,
            used: false,
        },
    });
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: email,
        subject: "Your One‐Time Verification Code",
        text: `Your OTP code is: ${code}. It will expire in ${OTP_EXPIRATION_MINUTES} minutes.`,
    };
    await transporter.sendMail(mailOptions);
}
async function verifyOtp(email, code) {
    const otpRecord = await user_model_1.prisma.oTP.findFirst({
        where: {
            email,
            code,
            used: false,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
    });
    if (!otpRecord) {
        throw new Error("Invalid or expired OTP.");
    }
    await user_model_1.prisma.oTP.update({
        where: { id: otpRecord.id },
        data: { used: true },
    });
}
async function signupUser(input) {
    const { firstName, lastName, email, password } = input;
    const existing = await user_model_1.prisma.user.findUnique({
        where: { email },
    });
    if (existing) {
        throw new Error("Email is already registered.");
    }
    const salt = await bcryptjs_1.default.genSalt(SALT_ROUNDS);
    const hashed = await bcryptjs_1.default.hash(password, salt);
    const user = await user_model_1.prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password: hashed,
        },
    });
    return user;
}
async function signinUser(input) {
    const { email, password } = input;
    const user = await user_model_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        throw new Error("Invalid email or password.");
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch) {
        throw new Error("Invalid email or password.");
    }
    return user;
}
//# sourceMappingURL=user.service.js.map