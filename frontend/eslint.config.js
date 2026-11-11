import js from '@eslint/js'
import globals from 'globals'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { files: ['**/*.{js,jsx}'], languageOptions: { ecmaVersion: 'latest', globals: globals.browser } },
  { languageOptions: { ecmaVersion: 'latest', sourceType: 'module' } },
  js.configs.recommended,
  reactPlugin.configs.flat.recommended,
  { files: ['**/*.{js,jsx}'], plugins: { 'react-refresh': reactRefresh }, rules: { 'react-refresh/only-export-components': ['warn', { allowConstantExport: true }] } },
  reactHooks.configs.recommended,
]
