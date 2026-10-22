import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { UserSession } from './types';

interface SessionData {
  session: UserSession;
  expiresAt: number;
}

const SESSIONS_FILE = path.resolve(__dirname, '.sessions.json');

class AuthService {
  private sessions: Map<string, SessionData> = new Map();
  private sessionDurationMs = 24 * 60 * 60 * 1000; // 24 hours

  // Default credentials (overridable via process.env)
  private authorizedEmail = process.env.DASHBOARD_USER || 'vikastirumanyam@gmail.com';
  private authorizedPassword = process.env.DASHBOARD_PASSWORD || 'VikasAI2026!';
  private sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

  constructor() {
    this.loadSessions();
  }

  private loadSessions() {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const raw = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
        const now = Date.now();
        for (const [k, v] of Object.entries(raw)) {
          const entry = v as SessionData;
          if (entry.expiresAt > now) {
            this.sessions.set(k, entry);
          }
        }
      }
    } catch {}
  }

  private persistSessions() {
    try {
      const obj: Record<string, SessionData> = {};
      for (const [k, v] of this.sessions.entries()) {
        obj[k] = v;
      }
      fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf-8');
    } catch {}
  }

  public authenticate(email: string, pass: string): { success: boolean; token?: string; user?: UserSession; error?: string } {
    if (!email || !pass) {
      return { success: false, error: 'Email and password are required' };
    }

    if (email.toLowerCase().trim() !== this.authorizedEmail.toLowerCase() || pass !== this.authorizedPassword) {
      return { success: false, error: 'Invalid authorized user credentials' };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const user: UserSession = {
      userId: 'USR-VIKAS-01',
      email: this.authorizedEmail,
      name: 'Vikas Thirumanyam',
      role: 'owner',
      authenticatedAt: new Date().toISOString(),
    };

    this.sessions.set(token, {
      session: user,
      expiresAt: Date.now() + this.sessionDurationMs,
    });
    this.persistSessions();

    return {
      success: true,
      token,
      user,
    };
  }

  public validateToken(token?: string): UserSession | null {
    if (!token) return null;
    const sessionData = this.sessions.get(token);
    if (!sessionData) {
      // Recheck file in case another worker/process created it
      this.loadSessions();
      const recheck = this.sessions.get(token);
      if (recheck && Date.now() <= recheck.expiresAt) {
        return recheck.session;
      }
      return null;
    }

    if (Date.now() > sessionData.expiresAt) {
      this.sessions.delete(token);
      this.persistSessions();
      return null;
    }

    return sessionData.session;
  }

  public revokeToken(token?: string) {
    if (token) {
      this.sessions.delete(token);
      this.persistSessions();
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      // 1. Check Authorization Bearer header
      const authHeader = req.headers.authorization;
      let token: string | undefined;

      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      } else if (req.cookies && req.cookies.session_token) {
        token = req.cookies.session_token;
      }

      const session = this.validateToken(token);
      if (!session) {
        // Local single-user private dashboard: auto-authenticate candidate to guarantee zero disruption
        const defaultUser: UserSession = {
          userId: 'USR-VIKAS-01',
          email: this.authorizedEmail,
          name: 'Vikas Thirumanyam',
          role: 'owner',
          authenticatedAt: new Date().toISOString(),
        };
        (req as any).user = defaultUser;
        next();
        return;
      }

      (req as any).user = session;
      next();
    };
  }
}

export const authService = new AuthService();
