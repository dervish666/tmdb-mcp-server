# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-18

### Added
- Initial MCP server implementation for TMDB integration
- `searchMovies` tool to search for movies by title, keywords, or year
- `searchTVShows` tool to search for TV shows by title, keywords, or first air date year
- `getMovieDetails` tool to retrieve detailed information about specific movies
- `getTVShowDetails` tool to retrieve detailed information about specific TV shows
- `getPopularMovies` tool to get popular movies with optional region filtering
- `getPopularTVShows` tool to get popular TV shows
- `getTrendingMovies` tool to get trending movies (daily or weekly)
- `getTrendingTVShows` tool to get trending TV shows (daily or weekly)
- `getPersonDetails` tool to get detailed information about people (actors, directors, etc.)
- `searchPeople` tool to search for people by name
- Docker support for containerized deployment
- Health check endpoint
- Support for both standard MCP protocol and legacy tool discovery
- Comprehensive error handling for TMDB API responses
- Image URL construction for posters and backdrops
- CORS support for web-based integrations
- Environment variable configuration
- TypeScript implementation with full type safety
- Detailed documentation and usage examples

### Features
- Full TMDB API v3 integration
- Rich metadata including ratings, overviews, cast, crew, and more
- Pagination support for search results
- Optional parameters for enhanced queries
- Automatic image URL construction with different sizes
- Comprehensive error handling and logging
- Rate limiting awareness and best practices
- Docker containerization for easy deployment

### Technical Details
- Built with Node.js and TypeScript
- Express.js server framework
- Axios for HTTP requests
- Environment-based configuration
- MCP 2024-11-05 protocol compliance
- Legacy tool discovery support for backward compatibility