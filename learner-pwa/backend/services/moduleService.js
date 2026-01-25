const moduleRepository = require('../repositories/moduleRepository');

/**
 * Module Service
 * Business logic for module operations
 */
class ModuleService {
    async getAllModules(filters = {}) {
        const { category, difficulty, isActive } = filters;
        const query = {};

        if (category) {
            query.category = category;
        }

        if (difficulty) {
            query.difficulty = parseInt(difficulty);
        }

        if (isActive !== undefined) {
            query.isActive = isActive;
        }

        return await moduleRepository.findAll(query);
    }

    async getModuleById(moduleId) {
        const module = await moduleRepository.findById(moduleId);

        if (!module) {
            throw new Error('Module not found');
        }

        return module;
    }

    async createModule(moduleData) {
        // Validate required fields
        const requiredFields = ['title', 'description', 'category'];
        for (const field of requiredFields) {
            if (!moduleData[field]) {
                throw new Error(`${field} is required`);
            }
        }

        // Generate unique moduleId if not provided
        if (!moduleData.moduleId) {
            const titleSlug = moduleData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');
            const timestamp = Date.now();
            moduleData.moduleId = `${titleSlug}-${timestamp}`;
        }

        // Set defaults
        const module = await moduleRepository.create({
            ...moduleData,
            difficulty: moduleData.difficulty || 1,
            priority: moduleData.priority || 5,
            estimatedTime: moduleData.estimatedTime || moduleData.baseTime || 60,
            isActive: moduleData.isActive !== false
        });

        return module;
    }

    async updateModule(moduleId, updates) {
        const module = await moduleRepository.update(moduleId, updates);

        if (!module) {
            throw new Error('Module not found');
        }

        return module;
    }

    async deleteModule(moduleId) {
        const module = await moduleRepository.findById(moduleId);

        if (!module) {
            throw new Error('Module not found');
        }

        await moduleRepository.delete(moduleId);

        return { message: 'Module deleted successfully' };
    }

    async getModulesByCategory(category) {
        return await moduleRepository.findByCategory(category);
    }

    async getModulesByDifficulty(difficulty) {
        return await moduleRepository.findByDifficulty(difficulty);
    }

    async getActiveModules() {
        return await moduleRepository.findActive();
    }

    async searchModules(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            return await this.getActiveModules();
        }

        return await moduleRepository.search(searchTerm);
    }

    async getModuleStats() {
        const total = await moduleRepository.count();
        const active = await moduleRepository.count({ isActive: true });

        return {
            total,
            active,
            inactive: total - active
        };
    }
}

module.exports = new ModuleService();
