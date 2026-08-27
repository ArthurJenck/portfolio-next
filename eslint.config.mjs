import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

const eslintConfig = [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
        ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
    {
        rules: {
            'react/no-unescaped-entities': 'off',
            '@next/next/no-html-link-for-pages': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-expressions': 'off',
            'react-hooks/exhaustive-deps': 'off',
        },
    },
    {
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        rules: {
            'no-magic-numbers': [
                'error',
                {
                    ignore: [-1, 0, 1, 2],
                    ignoreArrayIndexes: true,
                    ignoreDefaultValues: true,
                    enforceConst: true,
                    detectObjects: false,
                },
            ],
        },
    },
    {
        // Fichiers ne contenant que des constantes nommées exportées
        files: ['src/**/*.config.ts', 'src/config/**/*.ts'],
        rules: { 'no-magic-numbers': 'off' },
    },
]

export default eslintConfig
