# TMDB MCP Server

A Model Context Protocol (MCP) server that provides integration with The Movie Database (TMDB) API for accessing movie, TV show, and person information. This server allows AI assistants to search for movies and TV shows, get detailed information, discover trending content, and explore cast and crew details.

## Features

- **Movie Search**: Search for movies by title, keywords, or year
- **TV Show Search**: Search for TV shows by title, keywords, or first air date year
- **Detailed Information**: Get comprehensive details about movies, TV shows, and people
- **Popular Content**: Discover popular movies and TV shows
- **Trending Content**: Get trending movies and TV shows (daily or weekly)
- **People Search**: Search for actors, directors, and other industry professionals
- **Rich Metadata**: Access ratings, overviews, cast, crew, and more

## Installation

1. Clone this repository:
   ```bash
   git clone <repository-url>
   cd tmdb-mcp-server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

4. Edit the `.env` file with your TMDB configuration:
   ```env
   PORT=12010
   TMDB_API_KEY=your-tmdb-api-key-here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ```

5. Get your TMDB API key:
   - Visit [TMDB API](https://www.themoviedb.org/settings/api)
   - Create an account if you don't have one
   - Request an API key
   - Add the API key to your `.env` file

## Usage

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Environment Variables

- `PORT`: The port the MCP server will listen on (default: 12010)
- `TMDB_API_KEY`: Your TMDB API key (required)
- `TMDB_BASE_URL`: The TMDB API base URL (default: https://api.themoviedb.org/3)

## Available Tools

### Movie Tools

- **searchMovies**: Search for movies by title or keywords
- **getMovieDetails**: Get detailed information about a specific movie
- **getPopularMovies**: Get a list of popular movies
- **getTrendingMovies**: Get trending movies (daily or weekly)

### TV Show Tools

- **searchTVShows**: Search for TV shows by title or keywords
- **getTVShowDetails**: Get detailed information about a specific TV show
- **getPopularTVShows**: Get a list of popular TV shows
- **getTrendingTVShows**: Get trending TV shows (daily or weekly)

### People Tools

- **searchPeople**: Search for people (actors, directors, etc.) by name
- **getPersonDetails**: Get detailed information about a person

## API Endpoints

### MCP Endpoint

The main MCP endpoint is available at:
```
POST http://localhost:12011/mcp
```

### Health Check

```
GET http://localhost:12010/health
```

## Integration with AI Assistants

This server implements the Model Context Protocol (MCP) and can be integrated with compatible AI assistants. The server supports both standard MCP protocol and legacy tool discovery for backward compatibility.

### Example MCP Request

```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "searchMovies",
    "arguments": {
      "query": "The Matrix",
      "year": 1999
    }
  },
  "id": 1
}
```

### Example Response

```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"page\": 1,\n  \"total_pages\": 1,\n  \"total_results\": 1,\n  \"results\": [\n    {\n      \"id\": 603,\n      \"title\": \"The Matrix\",\n      \"release_date\": \"1999-03-30\",\n      \"overview\": \"Set in the 22nd century...\",\n      \"vote_average\": 8.2,\n      \"vote_count\": 23000,\n      \"poster_path\": \"https://image.tmdb.org/t/p/w500/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg\",\n      \"backdrop_path\": \"https://image.tmdb.org/t/p/w1280/fNG7i7RqMErkcqhohV2a6cV1Ehy.jpg\",\n      \"genre_ids\": [28, 878],\n      \"popularity\": 85.965\n    }\n  ]\n}"
      }
    ]
  },
  "id": 1
}
```

## Docker Support

A Dockerfile is included for containerized deployment:

```bash
docker build -t tmdb-mcp-server .
docker run -p 12010:12010 --env-file .env tmdb-mcp-server
```

## Error Handling

The server includes comprehensive error handling for:
- Invalid TMDB API responses
- Network connectivity issues
- Missing or invalid parameters
- Rate limiting (TMDB API limits)

## Rate Limiting

Please be aware of TMDB API rate limits:
- 40 requests every 10 seconds
- Respect the API terms of service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.

## Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for providing the comprehensive movie and TV database API
- [Model Context Protocol](https://modelcontextprotocol.io/) for the integration standard
