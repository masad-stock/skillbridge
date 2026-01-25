const progressRepository = require('../../repositories/progressRepository');
const Progress = require('../../models/Progress');

// Mock the Progress model
jest.mock('../../models/Progress');

describe('ProgressRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated progress records', async () => {
            const mockProgress = [{ _id: '1', user: 'user1', module: 'module1' }];
            const mockQuery = {};

            Progress.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockProgress)
                    })
                })
            });
            Progress.countDocuments.mockResolvedValue(1);

            const result = await progressRepository.findAll(mockQuery);

            expect(Progress.find).toHaveBeenCalledWith(mockQuery);
            expect(result).toEqual({ progress: mockProgress, total: 1 });
        });

        it('should populate fields when specified', async () => {
            const mockProgress = [{ _id: '1', user: {}, module: {} }];
            const populate = 'user module';

            Progress.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            populate: jest.fn().mockResolvedValue(mockProgress)
                        })
                    })
                })
            });
            Progress.countDocuments.mockResolvedValue(1);

            const result = await progressRepository.findAll({}, { populate });

            expect(result).toEqual({ progress: mockProgress, total: 1 });
        });
    });

    describe('findById', () => {
        it('should find progress by id', async () => {
            const mockProgress = { _id: '1', user: 'user1', module: 'module1' };

            Progress.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProgress)
            });

            const result = await progressRepository.findById('1', 'user module');

            expect(Progress.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockProgress);
        });
    });

    describe('findOne', () => {
        it('should find one progress record by query', async () => {
            const mockProgress = { _id: '1', user: 'user1', module: 'module1' };
            const query = { user: 'user1', module: 'module1' };

            Progress.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockProgress)
            });

            const result = await progressRepository.findOne(query, 'user module');

            expect(Progress.findOne).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockProgress);
        });
    });

    describe('create', () => {
        it('should create a new progress record', async () => {
            const progressData = { user: 'user1', module: 'module1', progress: 50 };
            const mockProgress = { _id: '1', ...progressData };

            Progress.create.mockResolvedValue(mockProgress);

            const result = await progressRepository.create(progressData);

            expect(Progress.create).toHaveBeenCalledWith(progressData);
            expect(result).toEqual(mockProgress);
        });
    });

    describe('update', () => {
        it('should update progress record', async () => {
            const updates = { progress: 75, completedAt: new Date() };
            const mockUpdatedProgress = { _id: '1', progress: 75 };

            Progress.findByIdAndUpdate.mockResolvedValue(mockUpdatedProgress);

            const result = await progressRepository.update('1', updates);

            expect(Progress.findByIdAndUpdate).toHaveBeenCalledWith('1', updates, {
                new: true,
                runValidators: true
            });
            expect(result).toEqual(mockUpdatedProgress);
        });
    });

    describe('delete', () => {
        it('should delete progress record by id', async () => {
            const mockDeletedProgress = { _id: '1', user: 'user1' };

            Progress.findByIdAndDelete.mockResolvedValue(mockDeletedProgress);

            const result = await progressRepository.delete('1');

            expect(Progress.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedProgress);
        });
    });

    describe('deleteMany', () => {
        it('should delete multiple progress records', async () => {
            const query = { user: 'user1' };
            const mockResult = { deletedCount: 5 };

            Progress.deleteMany.mockResolvedValue(mockResult);

            const result = await progressRepository.deleteMany(query);

            expect(Progress.deleteMany).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockResult);
        });
    });

    describe('count', () => {
        it('should count progress documents', async () => {
            const query = { completed: true };
            Progress.countDocuments.mockResolvedValue(20);

            const result = await progressRepository.count(query);

            expect(Progress.countDocuments).toHaveBeenCalledWith(query);
            expect(result).toEqual(20);
        });
    });

    describe('findByUser', () => {
        it('should find progress records by user', async () => {
            const mockProgress = [{ _id: '1', user: 'user1', module: 'module1' }];
            const userId = 'user1';

            Progress.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockProgress)
            });

            const result = await progressRepository.findByUser(userId);

            expect(Progress.find).toHaveBeenCalledWith({ user: userId });
            expect(result).toEqual(mockProgress);
        });
    });

    describe('findByModule', () => {
        it('should find progress records by module', async () => {
            const mockProgress = [{ _id: '1', user: 'user1', module: 'module1' }];
            const moduleId = 'module1';

            Progress.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockProgress)
            });

            const result = await progressRepository.findByModule(moduleId);

            expect(Progress.find).toHaveBeenCalledWith({ module: moduleId });
            expect(result).toEqual(mockProgress);
        });
    });

    describe('findByUserAndModule', () => {
        it('should find progress record by user and module', async () => {
            const mockProgress = { _id: '1', user: 'user1', module: 'module1' };
            const userId = 'user1';
            const moduleId = 'module1';

            Progress.findOne.mockResolvedValue(mockProgress);

            const result = await progressRepository.findByUserAndModule(userId, moduleId);

            expect(Progress.findOne).toHaveBeenCalledWith({ user: userId, module: moduleId });
            expect(result).toEqual(mockProgress);
        });
    });

    describe('getCompletedModulesCount', () => {
        it('should get count of completed modules for user', async () => {
            const userId = 'user1';
            Progress.countDocuments.mockResolvedValue(8);

            const result = await progressRepository.getCompletedModulesCount(userId);

            expect(Progress.countDocuments).toHaveBeenCalledWith({
                user: userId,
                completed: true
            });
            expect(result).toEqual(8);
        });
    });

    describe('getAverageProgress', () => {
        it('should get average progress for user', async () => {
            const userId = 'user1';
            const mockResult = [{ _id: null, avgProgress: 65.5 }];

            Progress.aggregate.mockResolvedValue(mockResult);

            const result = await progressRepository.getAverageProgress(userId);

            expect(Progress.aggregate).toHaveBeenCalledWith([
                { $match: { user: userId } },
                {
                    $group: {
                        _id: null,
                        avgProgress: { $avg: '$progress' }
                    }
                }
            ]);
            expect(result).toEqual(65.5);
        });
    });

    describe('getModuleProgressStats', () => {
        it('should get progress statistics for module', async () => {
            const moduleId = 'module1';
            const mockStats = [
                { _id: true, count: 15 },
                { _id: false, count: 5 }
            ];

            Progress.aggregate.mockResolvedValue(mockStats);

            const result = await progressRepository.getModuleProgressStats(moduleId);

            expect(Progress.aggregate).toHaveBeenCalledWith([
                { $match: { module: moduleId } },
                {
                    $group: {
                        _id: '$completed',
                        count: { $sum: 1 },
                        avgProgress: { $avg: '$progress' }
                    }
                }
            ]);
            expect(result).toEqual(mockStats);
        });
    });

    describe('updateLastAccessed', () => {
        it('should update last accessed timestamp', async () => {
            const progressId = '1';
            const mockUpdatedProgress = { _id: '1', lastAccessed: new Date() };

            Progress.findByIdAndUpdate.mockResolvedValue(mockUpdatedProgress);

            const result = await progressRepository.updateLastAccessed(progressId);

            expect(Progress.findByIdAndUpdate).toHaveBeenCalledWith(
                progressId,
                { lastAccessed: expect.any(Date) },
                { new: true }
            );
            expect(result).toEqual(mockUpdatedProgress);
        });
    });
});
