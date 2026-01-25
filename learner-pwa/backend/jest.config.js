module.exports = {
    testEnvironment: 'node',
    coverageDirectory: 'coverage',
    collectCoverageFrom: [
        'services/**/*.js',
        'controllers/**/*.js',
        'models/**/*.js',
        'middleware/**/*.js',
        'utils/**/*.js',
        '!**/node_modules/**'
    ],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    },
    testMatch: [
        '**/__tests__/**/*.js',
        '**/*.test.js',
        '**/*.spec.js'
    ],
    setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
    testTimeout: 10000
};
