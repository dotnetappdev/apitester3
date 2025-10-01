/**
 * Application constants for API Tester 3
 * Contains version info, GitHub links, and other application metadata
 */

export const APP_INFO = {
  name: 'API Tester 3',
  version: '1.0.0',
  description: 'Professional API testing tool with Visual Studio-style dockable layout',
  author: 'dotnetappdev',
  license: 'MIT',
} as const;

export const GITHUB_INFO = {
  repository: 'dotnetappdev/apitester3',
  url: 'https://github.com/dotnetappdev/apitester3',
  issuesUrl: 'https://github.com/dotnetappdev/apitester3/issues',
  newIssueUrl: 'https://github.com/dotnetappdev/apitester3/issues/new',
  discussionsUrl: 'https://github.com/dotnetappdev/apitester3/discussions',
} as const;

export const LINKS = {
  documentation: 'https://github.com/dotnetappdev/apitester3#readme',
  releases: 'https://github.com/dotnetappdev/apitester3/releases',
  contributing: 'https://github.com/dotnetappdev/apitester3/blob/main/CONTRIBUTING.md',
} as const;
