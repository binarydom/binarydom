# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Bundle size tracking and monitoring
  - Size Limit configuration with 50 kB limit
  - GitHub Actions workflow for size tracking
  - Size checking and tracking npm scripts
  - Size reports for PRs and pushes
  - Bundle size documentation in README

### Changed

- Enhanced build system with Webpack optimizations
  - Added production and development build configurations
  - Implemented CSS/SCSS support with source maps
  - Configured code splitting and vendor chunks
  - Added compression and minification for production
  - Set up performance budgets and bundle analysis
  - Created base SCSS styles with variables and mixins

### Added

- Build tooling with Babel and Webpack
  - Added Babel configuration for JSX transformation
  - Set up Webpack for bundling and development server
  - Configured TypeScript and React presets
  - Added development and production build scripts
  - Created HTML template for the application

### Added

- BinaryDOM compiler for JSX transformation
  - Implemented BinaryDOMCompiler class for transforming JSX to Binary DOM nodes
  - Added createElement factory function for JSX support
  - Configured tsconfig.json with custom JSX factory settings
  - Support for text nodes, elements, components, and binary tree structure

### Fixed

- Added missing required properties to BinaryDOMNode creation
  - Added props, eventHandlers, state, and hooks properties to createNode method
  - Fixed type errors in BinaryDOMNode interface implementation

## [0.1.0] - 2024-03-19

### Added

- Initial project setup
  - Created core BinaryDOM implementation
  - Added type definitions for BinaryDOMNode
  - Implemented BinaryDOMRenderer class
  - Created BinaryDOMComponent class
  - Added example counter component
  - Set up project structure and configuration files
