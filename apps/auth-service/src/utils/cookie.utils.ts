import { Response } from 'express';

type CookieData = {
  value: string;
  days?: number; // Optional: expires in X days
};

class CookiesUtils {
  private static defaultDays = 7;

  private static getCookieOptions(days?: number) {
    return {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none' as const,
      maxAge: (days ?? this.defaultDays) * 24 * 60 * 60 * 1000,
    };
  }

  public static setCookies(
    res: Response,
    cookies: Record<string, string | CookieData>
  ) {
    Object.entries(cookies).forEach(([key, data]) => {
      const value = typeof data === 'string' ? data : data.value;
      const days = typeof data === 'string' ? undefined : data.days;
      res.cookie(key, value, this.getCookieOptions(days));
    });
  }

  public static clearCookies(res: Response, keys: string[]) {
    keys.forEach((key) => {
      res.clearCookie(key, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'none',
      });
    });
  }
}

export default CookiesUtils;
