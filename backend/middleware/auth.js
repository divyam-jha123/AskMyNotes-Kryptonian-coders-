const { getAuth } = require('@clerk/express');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    // 1. Check for Bearer token in Authorization header (Clerk session token from frontend)
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.split(' ')[1];
        if (bearerToken) {
            // Try Clerk getAuth first — the bearer token should make this work
            try {
                // Use a wrapper to prevent getAuth from crashing the handler if Clerk is misconfigured
                let clerkAuth = null;
                try {
                    clerkAuth = getAuth(req);
                } catch (clerkErr) {
                    console.warn('[Auth] Clerk getAuth threw during Bearer check:', clerkErr.message);
                }

                if (clerkAuth && clerkAuth.userId) {
                    console.log('[Auth] Clerk Session (via Bearer):', clerkAuth.userId);
                    req.user = { id: clerkAuth.userId, clerk: true };
                    return next();
                }
            } catch (err) {
                console.warn('[Auth] Clerk check with Bearer failed:', err.message);
            }

            // If Clerk didn't work, try as a custom JWT
            try {
                const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
                console.log('[Auth] Custom JWT (via Bearer):', decoded.id);
                req.user = decoded;
                return next();
            } catch (err) {
                // Bearer token wasn't a valid custom JWT either, continue to other checks
                console.warn('[Auth] Bearer token is not a valid custom JWT');
            }
        }
    }

    // 2. Check for Clerk Auth (without Bearer — e.g. if Clerk sets its own cookie)
    try {
        const clerkAuth = getAuth(req);
        if (clerkAuth && clerkAuth.userId) {
            console.log('[Auth] Clerk Session (via cookie/header):', clerkAuth.userId);
            req.user = { id: clerkAuth.userId, clerk: true };
            return next();
        }
    } catch (err) {
        console.warn('[Auth] Clerk check skipped:', err.message);
    }

    // 3. Check for Custom JWT cookie
    const token = req.cookies.token;
    if (!token) {
        console.warn('[Auth] No authentication found (no Bearer, no Clerk session, no cookie)');
        return res.status(401).json({ message: 'Access denied. No session found.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[Auth] Custom JWT (via cookie):', decoded.id);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[Auth] Cookie JWT Invalid:', err.message);
        return res.status(401).json({ message: 'Invalid or expired session.' });
    }
};

module.exports = auth;
