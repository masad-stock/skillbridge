const Module = require('../models/Module');

/**
 * Module Repository
 * Handles all database operations for Module model
 */
class ModuleRepository {
    async findAll(query = {}, options = {}) {
        const { sort = { priority: -1, createdAt: -1 } } = options;
        return await Module.find(query).sort(sort);
    }

    async findById(id) {
        return await Module.findById(id);
    }

    async findOne(query) {
        return await Module.findOne(query);
    }

    async create(moduleData) {
        return await Module.create(moduleData);
    }

    async update(id, updates) {
        return await Module.findByIdAndUpdate(id, updates, {
            new: true,
            runValidators: true
        });
    }

    async delete(id) {
        return await Module.findByIdAndDelete(id);
    }

    async count(query = {}) {
        return await Module.countDocuments(query);
    }

    async findByCategory(category) {
        return await Module.find({ category, isActive: true })
            .sort({ priority: -1 });
    }

    async findByDifficulty(difficulty) {
        return await Module.find({ difficulty, isActive: true })
            .sort({ priority: -1 });
    }

    async findActive() {
        return await Module.find({ isActive: true })
            .sort({ priority: -1 });
    }

    async search(searchTerm) {
        return await Module.find({
            $or: [
                { title: { $regex: searchTerm, $options: 'i' } },
                { description: { $regex: searchTerm, $options: 'i' } }
            ],
            isActive: true
        });
    }
}

module.exports = new ModuleRepository();
