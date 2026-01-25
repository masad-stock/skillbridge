const auth = require('../../middleware/auth');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Mock dependencies
jest.mock('jsonwebtoken');
jest.mock('../../models/User');

describe('Auth Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            headers: {},
            cookies: {},
            query: {},
            params: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
        jest.clearAllMocks();
    });

    describe('protect', () => {
        it('should authenticate user with Bearer token', async () => {
            const mockUser = { _id: 'user123', role: 'user' };
            const mockDecoded = { id: 'user123' };

            mockReq.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockReturnValue(mockDecoded);
            User.findById.mockResolvedValue(mockUser);

            await auth.protect(mockReq, mockRes, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith('valid-token', process.env.JWT_SECRET);
            expect(User.findById).toHaveBeenCalledWith('user123');
            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should authenticate user with cookie token', async () => {
            const mockUser = { _id: 'user123', role: 'user' };
            const mockDecoded = { id: 'user123' };

            mockReq.cookies.token = 'cookie-token';
            jwt.verify.mockReturnValue(mockDecoded);
            User.findById.mockResolvedValue(mockUser);

            await auth.protect(mockReq, mockRes, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith('cookie-token', process.env.JWT_SECRET);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should authenticate user with query token', async () => {
            const mockUser = { _id: 'user123', role: 'user' };
            const mockDecoded = { id: 'user123' };

            mockReq.query.token = 'query-token';
            jwt.verify.mockReturnValue(mockDecoded);
            User.findById.mockResolvedValue(mockUser);

            await auth.protect(mockReq, mockRes, mockNext);

            expect(jwt.verify).toHaveBeenCalledWith('query-token', process.env.JWT_SECRET);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should return 401 if no token provided', async () => {
            await auth.protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized to access this route'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if token is invalid', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await auth.protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized to access this route'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if user not found', async () => {
            const mockDecoded = { id: 'user123' };

            mockReq.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockReturnValue(mockDecoded);
            User.findById.mockResolvedValue(null);

            await auth.protect(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized to access this route'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('authorize', () => {
        it('should allow access for authorized role', () => {
            mockReq.user = { role: 'admin' };
            const authorizeMiddleware = auth.authorize('admin', 'moderator');

            authorizeMiddleware(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access for unauthorized role', () => {
            mockReq.user = { role: 'user' };
            const authorizeMiddleware = auth.authorize('admin', 'moderator');

            authorizeMiddleware(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'User role not authorized to access this route'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('ownerOrAdmin', () => {
        it('should allow access for admin', () => {
            mockReq.user = { role: 'admin', _id: 'admin123' };
            mockReq.params.id = 'resource123';

            auth.ownerOrAdmin(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should allow access for resource owner', () => {
            mockReq.user = { role: 'user', _id: 'user123' };
            mockReq.params.id = 'user123';

            auth.ownerOrAdmin(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access for non-owner non-admin', () => {
            mockReq.user = { role: 'user', _id: 'user123' };
            mockReq.params.id = 'user456';

            auth.ownerOrAdmin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Access denied'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 401 if no user', () => {
            auth.ownerOrAdmin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Not authorized'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 400 if no resource ID', () => {
            mockReq.user = { role: 'user', _id: 'user123' };

            auth.ownerOrAdmin(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Resource ID not found'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('optionalAuth', () => {
        it('should set user if valid token provided', async () => {
            const mockUser = { _id: 'user123', role: 'user' };
            const mockDecoded = { id: 'user123' };

            mockReq.headers.authorization = 'Bearer valid-token';
            jwt.verify.mockReturnValue(mockDecoded);
            User.findById.mockResolvedValue(mockUser);

            await auth.optionalAuth(mockReq, mockRes, mockNext);

            expect(mockReq.user).toEqual(mockUser);
            expect(mockNext).toHaveBeenCalled();
        });

        it('should continue without user if no token', async () => {
            await auth.optionalAuth(mockReq, mockRes, mockNext);

            expect(mockReq.user).toBeUndefined();
            expect(mockNext).toHaveBeenCalled();
        });

        it('should continue without user if invalid token', async () => {
            mockReq.headers.authorization = 'Bearer invalid-token';
            jwt.verify.mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await auth.optionalAuth(mockReq, mockRes, mockNext);

            expect(mockReq.user).toBeUndefined();
            expect(mockNext).toHaveBeenCalled();
        });
    });

    describe('adminOnly', () => {
        it('should allow access for admin', () => {
            mockReq.user = { role: 'admin' };

            auth.adminOnly(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('should deny access for non-admin', () => {
            mockReq.user = { role: 'user' };

            auth.adminOnly(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Admin access required'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should deny access if no user', () => {
            auth.adminOnly(mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Admin access required'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
