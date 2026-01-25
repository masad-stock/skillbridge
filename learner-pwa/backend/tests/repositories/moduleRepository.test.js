const moduleRepository = require('../../repositories/moduleRepository');
const Module = require('../../models/Module');

// Mock the Module model
jest.mock('../../models/Module');

describe('ModuleRepository', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated modules', async () => {
            const mockModules = [{ _id: '1', title: 'Test Module' }];
            const mockQuery = {};

            Module.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockResolvedValue(mockModules)
                    })
                })
            });
            Module.countDocuments.mockResolvedValue(1);

            const result = await moduleRepository.findAll(mockQuery);

            expect(Module.find).toHaveBeenCalledWith(mockQuery);
            expect(result).toEqual({ modules: mockModules, total: 1 });
        });

        it('should populate fields when specified', async () => {
            const mockModules = [{ _id: '1', title: 'Test Module', author: {} }];
            const populate = 'author';

            Module.find.mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            populate: jest.fn().mockResolvedValue(mockModules)
                        })
                    })
                })
            });
            Module.countDocuments.mockResolvedValue(1);

            const result = await moduleRepository.findAll({}, { populate });

            expect(result).toEqual({ modules: mockModules, total: 1 });
        });
    });

    describe('findById', () => {
        it('should find module by id', async () => {
            const mockModule = { _id: '1', title: 'Test Module' };

            Module.findById.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockModule)
            });

            const result = await moduleRepository.findById('1', 'author');

            expect(Module.findById).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockModule);
        });
    });

    describe('findOne', () => {
        it('should find one module by query', async () => {
            const mockModule = { _id: '1', title: 'Test Module' };
            const query = { title: 'Test Module' };

            Module.findOne.mockReturnValue({
                populate: jest.fn().mockResolvedValue(mockModule)
            });

            const result = await moduleRepository.findOne(query, 'author');

            expect(Module.findOne).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockModule);
        });
    });

    describe('create', () => {
        it('should create a new module', async () => {
            const moduleData = { title: 'New Module', category: 'Business' };
            const mockModule = { _id: '1', ...moduleData };

            Module.create.mockResolvedValue(mockModule);

            const result = await moduleRepository.create(moduleData);

            expect(Module.create).toHaveBeenCalledWith(moduleData);
            expect(result).toEqual(mockModule);
        });
    });

    describe('update', () => {
        it('should update module', async () => {
            const updates = { status: 'published' };
            const mockUpdatedModule = { _id: '1', status: 'published' };

            Module.findByIdAndUpdate.mockResolvedValue(mockUpdatedModule);

            const result = await moduleRepository.update('1', updates);

            expect(Module.findByIdAndUpdate).toHaveBeenCalledWith('1', updates, {
                new: true,
                runValidators: true
            });
            expect(result).toEqual(mockUpdatedModule);
        });
    });

    describe('delete', () => {
        it('should delete module by id', async () => {
            const mockDeletedModule = { _id: '1', title: 'Test Module' };

            Module.findByIdAndDelete.mockResolvedValue(mockDeletedModule);

            const result = await moduleRepository.delete('1');

            expect(Module.findByIdAndDelete).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockDeletedModule);
        });
    });

    describe('deleteMany', () => {
        it('should delete multiple modules', async () => {
            const query = { category: 'Business' };
            const mockResult = { deletedCount: 3 };

            Module.deleteMany.mockResolvedValue(mockResult);

            const result = await moduleRepository.deleteMany(query);

            expect(Module.deleteMany).toHaveBeenCalledWith(query);
            expect(result).toEqual(mockResult);
        });
    });

    describe('count', () => {
        it('should count documents', async () => {
            const query = { status: 'published' };
            Module.countDocuments.mockResolvedValue(15);

            const result = await moduleRepository.count(query);

            expect(Module.countDocuments).toHaveBeenCalledWith(query);
            expect(result).toEqual(15);
        });
    });

    describe('findPublished', () => {
        it('should find published modules', async () => {
            const mockModules = [{ _id: '1', status: 'published' }];

            Module.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockModules)
            });

            const result = await moduleRepository.findPublished();

            expect(Module.find).toHaveBeenCalledWith({ status: 'published' });
            expect(result).toEqual(mockModules);
        });
    });

    describe('findByCategory', () => {
        it('should find modules by category', async () => {
            const mockModules = [{ _id: '1', category: 'Business' }];
            const category = 'Business';

            Module.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockModules)
            });

            const result = await moduleRepository.findByCategory(category);

            expect(Module.find).toHaveBeenCalledWith({ category, status: 'published' });
            expect(result).toEqual(mockModules);
        });
    });

    describe('findByDifficulty', () => {
        it('should find modules by difficulty', async () => {
            const mockModules = [{ _id: '1', difficulty: 'intermediate' }];
            const difficulty = 'intermediate';

            Module.find.mockReturnValue({
                sort: jest.fn().mockResolvedValue(mockModules)
            });

            const result = await moduleRepository.findByDifficulty(difficulty);

            expect(Module.find).toHaveBeenCalledWith({ difficulty, status: 'published' });
            expect(result).toEqual(mockModules);
        });
    });

    describe('getStats', () => {
        it('should get module statistics', async () => {
            const mockStats = [
                { _id: 'published', count: 10 },
                { _id: 'draft', count: 5 }
            ];

            Module.aggregate.mockResolvedValue(mockStats);

            const result = await moduleRepository.getStats();

            expect(Module.aggregate).toHaveBeenCalledWith([
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 }
                    }
                }
            ]);
            expect(result).toEqual(mockStats);
        });
    });

    describe('getCategoryStats', () => {
        it('should get category statistics', async () => {
            const mockStats = [
                { _id: 'Business', count: 8 },
                { _id: 'Technology', count: 6 }
            ];

            Module.aggregate.mockResolvedValue(mockStats);

            const result = await moduleRepository.getCategoryStats();

            expect(Module.aggregate).toHaveBeenCalledWith([
                { $match: { status: 'published' } },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 }
                    }
                }
            ]);
            expect(result).toEqual(mockStats);
        });
    });

    describe('getDifficultyStats', () => {
        it('should get difficulty statistics', async () => {
            const mockStats = [
                { _id: 'beginner', count: 5 },
                { _id: 'intermediate', count: 7 },
                { _id: 'advanced', count: 2 }
            ];

            Module.aggregate.mockResolvedValue(mockStats);

            const result = await moduleRepository.getDifficultyStats();

            expect(Module.aggregate).toHaveBeenCalledWith([
                { $match: { status: 'published' } },
                {
                    $group: {
                        _id: '$difficulty',
                        count: { $sum: 1 }
                    }
                }
            ]);
            expect(result).toEqual(mockStats);
        });
    });

    describe('searchModules', () => {
        it('should search modules with text search', async () => {
            const mockModules = [{ _id: '1', title: 'Business Module' }];
            const searchTerm = 'business';
            const filters = { category: 'Business' };

            Module.find.mockResolvedValue(mockModules);

            const result = await moduleRepository.searchModules(searchTerm, filters);

            expect(Module.find).toHaveBeenCalledWith(
                {
                    status: 'published',
                    $text: { $search: searchTerm },
                    category: 'Business'
                },
                { score: { $meta: 'textScore' } }
            );
            expect(result).toEqual(mockModules);
        });
    });
});
