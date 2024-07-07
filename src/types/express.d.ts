import 'express-session';

declare module 'express-session' {
    interface SessionData {
        isNewUser?: boolean;
    }
}