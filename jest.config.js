module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: [
        '<rootDir>/test/**/?(*.)+(spec|test).[jt]s?(x)'
    ],
    modulePathIgnorePatterns: [
        '<rootDir>/test/archive'
    ]
};