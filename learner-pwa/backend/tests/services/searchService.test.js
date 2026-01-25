const searchService = require('../../services/searchService');
const Module = require('../../models/Module');
const User = require('../../models/User');

describe('SearchService', () => {
    beforeEach(async () => {
        // Create test modules
        await Module.create([
            {
                moduleId: 'digital-marketing-001',
                title: 'Digital Marketing Basics',
                description: 'Learn digital marketing',
                category: 'Marketing',
                difficulty: 1,
                estimatedTime: 10
            },
            {
                moduleId: 'advanced-excel-001',
                title: 'Advanced Excel',
                description: 'Master Excel formulas',
                category: 'Business',
                difficulty: 3,
                estimatedTime: 15
            },
            {
                moduleId: 'social-media-001',
                title: 'Social Media Marketing',
                description: 'Social media strategies',
                category: 'Marketing',
                difficulty: 2,
                estimatedTime: 8
            }
        ]);
    });

    describe('searchModules', () => {
        it('should search modules by title', async () => {
            const result = await searchService.searchModules('marketing');

            expect(result.success).toBe(true);
            expect(result.data.length).toBeGreaterThan(0);
            expect(result.data[0].title).toMatch(/marketing/i);
        });

        it('should filter by category', async () => {
            const result = await searchService.searchModules('', { category: 'Marketing' });

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(2);
            expect(result.data.every(m => m.category === 'Marketing')).toBe(true);
        });

        it('should filter by difficulty', async () => {
            const result = await searchService.searchModules('', { difficulty: 'Beginner' });

            expect(result.success).toBe(true);
            expect(result.data.every(m => m.difficulty === 'Beginner')).toBe(true);
        });

        it('should support pagination', async () => {
            const result = await searchService.searchModules('', {}, { page: 1, limit: 2 });

            expect(result.success).toBe(true);
            expect(result.data.length).toBeLessThanOrEqual(2);
            expect(result.pagination.page).toBe(1);
            expect(result.pagination.limit).toBe(2);
        });

        it('should return empty results for no matches', async () => {
            const result = await searchService.searchModules('nonexistent');

            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(0);
        });
    });

    describe('getSuggestions', () => {
        it('should return suggestions for partial query', async () => {
            const result = await searchService.getSuggestions('dig', 'modules', 5);

            expect(result.success).toBe(true);
            expect(result.data.length).toBeGreaterThan(0);
        });

        it('should limit suggestions', async () => {
            const result = await searchService.getSuggestions('', 'modules', 2);

            expect(result.success).toBe(true);
            expect(result.data.length).toBeLessThanOrEqual(2);
        });
    });

    describe('getSearchFilters', () => {
        it('should return available filters', async () => {
            const result = await searchService.getSearchFilters();

            expect(result.success).toBe(true);
            expect(result.data.categories).toBeDefined();
            expect(result.data.difficulties).toBeDefined();
            expect(result.data.categories).toContain('Marketing');
            expect(result.data.categories).toContain('Business');
        });
    });
});
