import { configs } from '@packages/configs';
import { db } from '@packages/database';
import { AuthError } from '@packages/error-middleware/error-classes';
import jwt, { JsonWebTokenError } from 'jsonwebtoken';
import CookiesUtils from './cookie.utils';
import { Response } from 'express';

class TokenUtils {
  private static accessSecret =
    configs.ACCESS_TOKEN_SECRET || 'access-secret-key';

  private static refreshSecret =
    configs.REFRESH_TOKEN_SECRET || 'refresh-secret-key';

  public static generateTokens(payload: { id: string; role: string }) {
    const accessToken = jwt.sign(payload, this.accessSecret, {
      expiresIn: '1d',
    });

    const refreshToken = jwt.sign(payload, this.refreshSecret, {
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  public static async decodeToken(res: Response, refreshToken: string) {
    const decoded = jwt.verify(refreshToken, this.refreshSecret) as {
      id: string;
      role: string;
    };

    if (!decoded || !decoded.id || !decoded.role) {
      throw new JsonWebTokenError(
        'Invalid token payload. Please log in again.'
      );
    }
    const isUser = await db.users.findUnique({
      where: {
        id: decoded.id,
      },
    });

    if (!isUser) {
      throw new AuthError(
        'User not found. The token might be invalid or expired.'
      );
    }

    const newAccessToken = jwt.sign(
      { id: decoded.id, role: decoded.role },
      this.accessSecret,
      {
        expiresIn: '1d',
      }
    );

    CookiesUtils.setCookies(res, {
      accessToken: {
        value: newAccessToken,
        days: 1,
      },
    });
  }
}

export default TokenUtils;
