'use strict';
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const files = [
  'src/hooks/useAuth.ts',
  'src/app/(client)/layout.tsx',
  'src/app/(client)/signup/page.tsx',
  'src/app/(client)/login/page.tsx',
  'src/app/(client)/tools/page.tsx',
  'src/app/(client)/tools/condominio-registration/page.tsx',
  'src/data/headerContent.ts',
];

const replacements = [
  { from: '/client/tools', to: '/tools' },
  { from: '/client/login', to: '/login' },
  { from: 'href=
