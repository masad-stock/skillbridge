const winston = require('winston');
const logger = require('../../utils/logger');

// Mock winston
jest.mock('winston');

describe('Logger Utils', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create logger with correct configuration', () => {
        expect(winston.createLogger).toHaveBeenCalledWith({
            level: process.env.LOG_LEVEL || 'info',
            format: expect.any(Object),
            defaultMeta: { service: 'adaptive-learning-api' },
            transports: expect.any(Array)
        });
    });

    it('should add console transport in non-production environment', () => {
        const mockLogger = {
            add: jest.fn()
        };
        winston.createLogger.mockReturnValue(mockLogger);

        // Re-require to trigger the logic
        jest.resetModules();
        process.env.NODE_ENV = 'development';
        require('../../utils/logger');

        expect(mockLogger.add).toHaveBeenCalledWith(
            expect.objectContaining({
                format: expect.any(Object)
            })
        );
    });

    it('should not add console transport in production environment', () => {
        const mockLogger = {
            add: jest.fn()
        };
        winston.createLogger.mockReturnValue(mockLogger);

        // Re-require to trigger the logic
        jest.resetModules();
        process.env.NODE_ENV = 'production';
        require('../../utils/logger');

        expect(mockLogger.add).not.toHaveBeenCalled();
    });

    it('should export the logger instance', () => {
        const mockLogger = { info: jest.fn(), error: jest.fn() };
        winston.createLogger.mockReturnValue(mockLogger);

        const loggerModule = require('../../utils/logger');

        expect(loggerModule).toBe(mockLogger);
    });
});
