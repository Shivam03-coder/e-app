import { configs } from '@packages/configs';
import jwt from 'jsonwebtoken';

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
}

export default TokenUtils;
