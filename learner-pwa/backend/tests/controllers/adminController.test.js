const adminController = require('../../controllers/adminController');
const userService = require('../../services/userService');
const moduleService = require('../../services/moduleService');
const analyticsService = require('../../services/analyticsService');

// Mock services
jest.mock('../../services/userService');
jest.mock('../../services/moduleService');
jest.mock('../../services/analyticsService');

describe('Admin Controller', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockReq = {
            query: {},
            params: {},
            body: {},
            user: { id: 'admin123' }
        };
        mockRes = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getDashboard', () => {
        it('should return dashboard stats successfully', async () => {
            const mockStats = { totalUsers: 100, totalModules: 50 };
            analyticsService.getDashboardStats.mockResolvedValue(mockStats);

            await adminController.getDashboard(mockReq, mockRes);

            expect(analyticsService.getDashboardStats).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockStats
            });
        });

        it('should handle errors', async () => {
            analyticsService.getDashboardStats.mockRejectedValue(new Error('Database error'));

            await adminController.getDashboard(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'Database error'
            });
        });
    });

    describe('getUsers', () => {
        it('should return users with pagination', async () => {
            mockReq.query = { page: '2', limit: '20', search: 'john' };
            const mockResult = {
                users: [{ id: '1', name: 'John' }],
                pagination: { page: 2, limit: 20, total: 100 }
            };
            userService.getAllUsers.mockResolvedValue(mockResult);

            await adminController.getUsers(mockReq, mockRes);

            expect(userService.getAllUsers).toHaveBeenCalledWith(
                { search: 'john', role: undefined, isActive: undefined },
                { page: 2, limit: 20 }
            );
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockResult.users,
                pagination: mockResult.pagination
            });
        });
    });

    describe('getUser', () => {
        it('should return user by id', async () => {
            mockReq.params.id = 'user123';
            const mockUser = { id: 'user123', name: 'John Doe' };
            userService.getUserById.mockResolvedValue(mockUser);

            await adminController.getUser(mockReq, mockRes);

            expect(userService.getUserById).toHaveBeenCalledWith('user123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUser
            });
        });

        it('should return 404 for non-existent user', async () => {
            userService.getUserById.mockRejectedValue(new Error('User not found'));

            await adminController.getUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                message: 'User not found'
            });
        });
    });

    describe('updateUser', () => {
        it('should update user successfully', async () => {
            mockReq.params.id = 'user123';
            mockReq.body = { name: 'Updated Name' };
            const mockUpdatedUser = { id: 'user123', name: 'Updated Name' };
            userService.updateUser.mockResolvedValue(mockUpdatedUser);

            await adminController.updateUser(mockReq, mockRes);

            expect(userService.updateUser).toHaveBeenCalledWith('user123', { name: 'Updated Name' });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockUpdatedUser
            });
        });
    });

    describe('deleteUser', () => {
        it('should delete user successfully', async () => {
            mockReq.params.id = 'user123';
            const mockResult = { message: 'User deleted' };
            userService.deleteUser.mockResolvedValue(mockResult);

            await adminController.deleteUser(mockReq, mockRes);

            expect(userService.deleteUser).toHaveBeenCalledWith('user123', 'admin123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                ...mockResult
            });
        });
    });

    describe('getModules', () => {
        it('should return all modules', async () => {
            mockReq.query = { category: 'business', isActive: 'true' };
            const mockModules = [{ id: '1', title: 'Module 1' }];
            moduleService.getAllModules.mockResolvedValue(mockModules);

            await adminController.getModules(mockReq, mockRes);

            expect(moduleService.getAllModules).toHaveBeenCalledWith({
                category: 'business',
                difficulty: undefined,
                isActive: 'true'
            });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockModules
            });
        });
    });

    describe('createModule', () => {
        it('should create module successfully', async () => {
            mockReq.body = { title: 'New Module', category: 'business' };
            const mockModule = { id: 'mod123', title: 'New Module' };
            moduleService.createModule.mockResolvedValue(mockModule);

            await adminController.createModule(mockReq, mockRes);

            expect(moduleService.createModule).toHaveBeenCalledWith({ title: 'New Module', category: 'business' });
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockModule
            });
        });
    });

    describe('updateModule', () => {
        it('should update module successfully', async () => {
            mockReq.params.id = 'mod123';
            mockReq.body = { title: 'Updated Module' };
            const mockModule = { id: 'mod123', title: 'Updated Module' };
            moduleService.updateModule.mockResolvedValue(mockModule);

            await adminController.updateModule(mockReq, mockRes);

            expect(moduleService.updateModule).toHaveBeenCalledWith('mod123', { title: 'Updated Module' });
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockModule
            });
        });
    });

    describe('deleteModule', () => {
        it('should delete module successfully', async () => {
            mockReq.params.id = 'mod123';
            const mockResult = { message: 'Module deleted' };
            moduleService.deleteModule.mockResolvedValue(mockResult);

            await adminController.deleteModule(mockReq, mockRes);

            expect(moduleService.deleteModule).toHaveBeenCalledWith('mod123');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                ...mockResult
            });
        });
    });

    describe('getAnalytics', () => {
        it('should return analytics data', async () => {
            mockReq.query.period = '60';
            const mockData = { totalViews: 1000 };
            analyticsService.getAnalytics.mockResolvedValue(mockData);

            await adminController.getAnalytics(mockReq, mockRes);

            expect(analyticsService.getAnalytics).toHaveBeenCalledWith('60');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockData
            });
        });
    });

    describe('generateReport', () => {
        it('should generate report successfully', async () => {
            mockReq.params.type = 'users';
            mockReq.query = { startDate: '2023-01-01', endDate: '2023-12-31' };
            const mockReport = { totalUsers: 500 };
            analyticsService.getReport.mockResolvedValue(mockReport);

            await adminController.generateReport(mockReq, mockRes);

            expect(analyticsService.getReport).toHaveBeenCalledWith('users', '2023-01-01', '2023-12-31');
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                data: mockReport
            });
        });
    });
});
