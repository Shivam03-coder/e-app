import { ValidationError } from '@packages/error-middleware/error-classes';
import NodemailerService from '@packages/libs/nodemailer';
import redisClient from '@packages/libs/redis';
import argon2 from 'argon2';
import crypto from 'crypto';
class AuthServices {
  public static hashPassword = async (password: string): Promise<string> => {
    return await argon2.hash(password, {
      type: argon2.argon2id,
    });
  };

  public static verifyPassword = async (
    password: string,
    hashedPassword: string
  ): Promise<boolean> => {
    return await argon2.verify(hashedPassword, password);
  };

  public static checkOtpRestriction = async (email: string) => {
    const lockKey = `otp_lock:${email}`;
    const spamLockKey = `otp_spam_lock:${email}`;
    const coolDownKey = `otp_cool_down:${email}`;

    if (await redisClient.get(lockKey)) {
      throw new ValidationError(
        'Your account has been temporarily locked due to multiple incorrect OTP attempts. Please try again later.'
      );
    }

    if (await redisClient.get(spamLockKey)) {
      throw new ValidationError(
        'You’ve requested OTP too many times in a short period. Please wait 1 hour before trying again.'
      );
    }

    if (await redisClient.get(coolDownKey)) {
      throw new ValidationError(
        'You’re sending OTP requests too frequently. Please wait a few minutes before trying again.'
      );
    }
  };

  public static trackOtpRequest = async (email: string) => {
    const otpRequestKey = `otp_request_count:${email}`;
    let otpRequests = parseInt((await redisClient.get(otpRequestKey)) || '0');

    if (otpRequests >= 2) {
      await redisClient.set(`otp_spam_lock:${email}`, 'locked', 3600);
      throw new Error(
        'Too many OTP requests. Please wait 1 hour before requesting again.'
      );
    }

    await redisClient.set(otpRequestKey, otpRequests + 1, 3600);
  };

  public static sendOtp = async (name: string, email: string) => {
    const otp = crypto.randomInt(1000, 9999).toString();
    console.log("🚀 ~ AuthServices ~ sendOtp= ~ otp:", otp)
    redisClient.set(`otp:${email}`, otp, 300);
    redisClient.set(`otp_cooldown:${email}`, 'true', 60);
    await NodemailerService.sendOtpEmail({ email, otp, name });
  };
}

export default AuthServices;
