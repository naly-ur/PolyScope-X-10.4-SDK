module.exports = {
    displayName: 'ur-program-nodes',
    preset: '../../../../jest.preset.js',
    globals: {
        'ts-jest': { tsconfig: '<rootDir>/tsconfig.spec.json' },
    },
    transform: {
        '^.+\\.[tj]s$': 'ts-jest',
    },
    moduleFileExtensions: ['ts', 'js', 'html'],
    coverageDirectory: 'coverage/ur-program-nodes',
    collectCoverage: true,
    coverageReporters: ['lcov', ['text', { skipFull: true }]],
    reporters: [
        'default',
        [
            'jest-junit',
            {
                suiteName: 'ur-program-nodes',
                outputDirectory: 'test-results/ur-program-nodes',
                outputName: 'TESTS-ur-program-nodes-results.xml',
            },
        ],
    ],
};
