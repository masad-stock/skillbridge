const userRepository = require('../../repositories/userRepository');
const User = require('../../models/User');

// Mock the User model
jest.mock('../../models/User');

describe('UserRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated users with default options', async () => {
            const mockUsers = [{ _id: '1', email: 'test@example.com' }];
            const mockQuery = {};

            User.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockUsers)
                        })
                    })
                })
            });
            User.countDocuments.mockResolvedValue(1);

            const result = await userRepository.findAll(mockQuery);

            expect(User.find).toHaveBeenCalledWith(mockQuery);
            expect(result).toEqual({ users: mockUsers, total: 1 });
        });

        it('should apply custom options', async () => {
            const mockUsers = [{ _id: '1', email: 'test@example.com' }];
            const options = { page: 2, limit: 5, sort: { email: 1 } };

            User.find.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockResolvedValue(mockUsers)
                        })
                    })
                })
            });
            User.countDocuments.mockResolvedValue(1);

            await userRepository.findAll({}, options);

            expect(User.find).toHaveBeenCalledWith({});
        });
    });

    describe('findById', () => {
        it('should find user by id', async () => {
            const mockUser = { _id: '1', email: 'test@example.com' };
            User.findById.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await userRepository.findById('1');

            expect(User.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });
    });

    describe('findOne', () => {
        it('should find one user by query', async () => {
            const mockUser = { _id: '1', email: 'test@example.com' };
            const query = { email: 'test@example.com' };

            User.findOne.mockReturnValue({
                select: jest.fn().mockResolvedValue(mockUser)
            });

            const result = await userRepository.findOne(query);

            expect(User.findOne).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockUser);
        });
    });

    describe('create', () => {
        it('should create a new user', async () => {
            const userData = { email: 'test@example.com', password: 'hashed' };
            const mockUser = { _id: '1', ...userData };

            User.create.mockResolvedValue(mockUser);

            const result = await userRepository.create(userData);

            expect(User.create).toHaveBeenCalledWith(userData);
            expect(result).toEqual(mockUser);
        });
    });

    describe('update', () => {
        it('should update user and return updated document', async () => {
            const updates = { email: 'updated@example.com' };
            const mockUpdatedUser = { _id: '1', email: 'updated@example.com' };

            User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

            const result = await userRepository.update('1', updates);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', updates, {
                new: true,
                runValidators: true
            });
            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('delete', () => {
        it('should delete user by id', async () => {
            const mockDeletedUser = { _id: '1', email: 'test@example.com' };

            User.findByIdAndDelete.mockResolvedValue(mockDeletedUser);

            const result = await userRepository.delete('1');

            expect(User.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedUser);
        });
    });

    describe('count', () => {
        it('should count documents matching query', async () => {
            const query = { isActive: true };
            User.countDocuments.mockResolvedValue(5);

            const result = await userRepository.count(query);

            expect(User.countDocuments).toHaveBeenCalledWith(query);
            expect(result).toEqual(5);
        });
    });

    describe('findWithPopulate', () => {
        it('should find user with populated fields', async () => {
            const mockUser = { _id: '1', email: 'test@example.com', profile: {} };
            const populateFields = 'profile';

            User.findById.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    populate: jest.fn().mockResolvedValue(mockUser)
                })
            });

            const result = await userRepository.findWithPopulate('1', populateFields);

            expect(User.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });
    });

    describe('updatePassword', () => {
        it('should update user password', async () => {
            const hashedPassword = 'newhashedpassword';
            const mockUpdatedUser = { _id: '1', password: hashedPassword };

            User.findByIdAndUpdate.mockResolvedValue(mockUpdatedUser);

            const result = await userRepository.updatePassword('1', hashedPassword);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('1', { password: hashedPassword });
            expect(result).toEqual(mockUpdatedUser);
        });
    });

    describe('findByEmail', () => {
        it('should find user by email', async () => {
            const email = 'test@example.com';
            const mockUser = { _id: '1', email };

            User.findOne.mockResolvedValue(mockUser);

            const result = await userRepository.findByEmail(email);

            expect(User.findOne).toHaveBeenCalledWith({ email });
            expect(result).toEqual(mockUser);
        });
    });

    describe('findActiveUsers', () => {
        it('should find active users within specified days', async () => {
            User.countDocuments.mockResolvedValue(10);

            const result = await userRepository.findActiveUsers(30);

            expect(User.countDocuments).toHaveBeenCalledWith({
                isActive: true,
                lastLogin: { $gte: expect.any(Date) }
            });
            expect(result).toEqual(10);
        });
    });

    describe('getRecentUsers', () => {
        it('should get recent users', async () => {
            const mockUsers = [
                { profile: {}, email: 'user1@example.com', createdAt: new Date() },
                { profile: {}, email: 'user2@example.com', createdAt: new Date() }
            ];

            User.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    limit: jest.fn().mockReturnValue({
                        select: jest.fn().mockResolvedValue(mockUsers)
                    })
                })
            });

            const result = await userRepository.getRecentUsers(5);

            expect(User.find).toHaveBeenCalledWith();
            expect(result).toEqual(mockUsers);
        });
    });
});
