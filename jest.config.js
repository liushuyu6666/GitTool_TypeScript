module.exports = {
    preset: 'ts-jest',
    globalSetup: '<rootDir>/test/setup.ts',
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/test/archive'
    ]
};