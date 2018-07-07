module.exports = {
  root: true,

  env: {
    node: true,
  },

  parserOptions: {
    ecmaVersion: 2018,
    impliedStrict: true,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
    },
  },

  globals: {
    Promise: false,
  },

  extends: [
    'eslint:recommended',
  ],

  rules: {
    'block-scoped-var': 2,
    'consistent-return': 2,
    'curly': [2, 'multi-line'],
    'dot-location': [2, 'property'],
    'dot-notation': 1,
    'eqeqeq': [2, 'smart'],
    'guard-for-in': 1,
    'no-alert': 2,
    'no-catch-shadow': 2,
    'no-caller': 2,
    'no-case-declarations': 2,
    'no-console': 0,
    'no-div-regex': 2,
    'no-else-return': 2,
    'no-eval': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-floating-decimal': 2,
    'no-implied-eval': 2,
    'no-iterator': 2,
    'no-label-var': 2,
    'no-lone-blocks': 2,
    'no-loop-func': 2,
    'no-multi-str': 2,
    'no-native-reassign': 2,
    'no-new-func': 2,
    'no-new-wrappers': 2,
    'no-new': 2,
    'no-octal-escape': 2,
    'no-proto': 2,
    'no-return-assign': [2, 'except-parens'],
    'no-script-url': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-shadow-restricted-names': 2,
    'no-throw-literal': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-unexpected-multiline': 2,
    'no-unused-expressions': 2,
    'no-unused-vars': 2,
    'no-useless-call': 2,
    'no-use-before-define': [2, 'nofunc'],
    'no-with': 2,
    'radix': 2,
    'wrap-iife': [2, 'inside'],
    'yoda': [2, 'never'],
    //
    // STYLISTIC ISSUES
    //
    'array-bracket-spacing': 2,
    'brace-style': [2, '1tbs', {
      allowSingleLine: true,
    }],
    'comma-spacing': 2,
    'comma-style': 2,
    'comma-dangle': [2, {
      arrays: 'always-multiline',
      objects: 'always-multiline',
      imports: 'always-multiline',
      exports: 'always-multiline',
      functions: 'never'
    }],
    'computed-property-spacing': 2,
    'consistent-this': [2, '_self'],
    'eol-last': 2,
    'func-call-spacing': 2,
    'indent': ['error', 2, {
      flatTernaryExpressions: true,
      SwitchCase: 1,
      VariableDeclarator: 2
    }],
    'key-spacing': [2, {
      mode: 'minimum',
    }],
    'keyword-spacing': 2,
    'linebreak-style': [2, 'unix'],
    'object-curly-spacing': [2, 'always'],
    'max-depth': [2, 5],
    'max-len': [1, 120, 4, {
      ignoreUrls: true,
      ignorePattern: '=\\s+/.+/',
    }],
    'max-nested-callbacks': [2, 5],
    'new-parens': 2,
    'no-array-constructor': 2,
    'no-lonely-if': 2,
    'no-multiple-empty-lines': [2, {
      max: 2,
    }],
    'no-new-object': 2,
    'no-trailing-spaces': 2,
    'no-unneeded-ternary': 2,
    'operator-linebreak': 2,
    'quote-props': [2, 'as-needed'],
    quotes: [2, 'single', 'avoid-escape'],
    'semi-spacing': 2,
    semi: [2, 'never'],
    'space-before-blocks': 2,
    'space-before-function-paren': [2, {
      anonymous: 'always',
      named: 'never',
    }],
    'space-in-parens': 2,
    'space-infix-ops': [2, {
      int32Hint: false,
    }],
    'space-unary-ops': 2,
    //
    // ES6
    //
    'arrow-spacing': 2,
    'no-confusing-arrow': [2, {
      allowParens: true,
    }],
    'no-duplicate-imports': [2, {
      includeExports: true,
    }],
    'no-useless-computed-key': 2,
    'no-useless-rename': 2,
    'no-restricted-syntax': [2, 'ForOfStatement'],
    'no-var': 2,
    'prefer-const': [2, {
      destructuring: 'all',
    }],
    'template-curly-spacing': 2,
  },
}
