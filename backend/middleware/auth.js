const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    // 1. Check for Bearer token in Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const bearerToken = authHeader.split(' ')[1];
        if (bearerToken) {
            try {
                const decoded = jwt.verify(bearerToken, process.env.JWT_SECRET);
                console.log('[Auth] JWT (via Bearer):', decoded.id);
                req.user = decoded;
                return next();
            } catch (err) {
                console.warn('[Auth] Bearer token is not a valid JWT:', err.message);
            }
        }
    }

    // 2. Check for JWT cookie
    const token = req.cookies.token;
    if (!token) {
        console.warn('[Auth] No authentication found (no Bearer, no cookie)');
        return res.status(401).json({ message: 'Access denied. No session found.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('[Auth] JWT (via cookie):', decoded.id);
        req.user = decoded;
        next();
    } catch (err) {
        console.error('[Auth] Cookie JWT Invalid:', err.message);
        return res.status(401).json({ message: 'Invalid or expired session.' });
    }
};

module.exports = auth;
