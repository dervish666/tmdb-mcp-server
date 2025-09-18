import express, { Request, Response } from 'express';
import axios, { AxiosInstance } from 'axios';
import 'dotenv/config'; // Loads .env file

// --- Configuration ---
const PORT = process.env.PORT || 12010;
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

// --- Basic Validation ---
if (!TMDB_API_KEY) {
  console.error("FATAL ERROR: TMDB_API_KEY must be defined in your environment variables.");
  process.exit(1);
}

// --- TMDB API Client ---
const tmdbApi: AxiosInstance = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// --- MCP Tool Definitions ---
const tools = [
  {
    name: 'searchMovies',
    description: 'Search for movies by title or keywords.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The movie title or keywords to search for.' },
        page: { type: 'number', description: 'Page number for pagination (default: 1).' },
        year: { type: 'number', description: 'Filter by release year (optional).' }
      },
      required: ['query']
    },
  },
  {
    name: 'searchTVShows',
    description: 'Search for TV shows by title or keywords.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The TV show title or keywords to search for.' },
        page: { type: 'number', description: 'Page number for pagination (default: 1).' },
        first_air_date_year: { type: 'number', description: 'Filter by first air date year (optional).' }
      },
      required: ['query']
    },
  },
  {
    name: 'getMovieDetails',
    description: 'Get detailed information about a specific movie.',
    inputSchema: {
      type: 'object',
      properties: {
        movieId: { type: 'number', description: 'The TMDB movie ID.' },
        append_to_response: { type: 'string', description: 'Additional data to include (e.g., "credits,videos,reviews").' }
      },
      required: ['movieId']
    },
  },
  {
    name: 'getTVShowDetails',
    description: 'Get detailed information about a specific TV show.',
    inputSchema: {
      type: 'object',
      properties: {
        tvId: { type: 'number', description: 'The TMDB TV show ID.' },
        append_to_response: { type: 'string', description: 'Additional data to include (e.g., "credits,videos,reviews").' }
      },
      required: ['tvId']
    },
  },
  {
    name: 'getPopularMovies',
    description: 'Get a list of popular movies.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number for pagination (default: 1).' },
        region: { type: 'string', description: 'ISO 3166-1 code for region-specific results (optional).' }
      },
      required: []
    },
  },
  {
    name: 'getPopularTVShows',
    description: 'Get a list of popular TV shows.',
    inputSchema: {
      type: 'object',
      properties: {
        page: { type: 'number', description: 'Page number for pagination (default: 1).' }
      },
      required: []
    },
  },
  {
    name: 'getTrendingMovies',
    description: 'Get trending movies for a specific time window.',
    inputSchema: {
      type: 'object',
      properties: {
        time_window: { type: 'string', enum: ['day', 'week'], description: 'Time window for trending (default: day).' },
        page: { type: 'number', description: 'Page number for pagination (default: 1).' }
      },
      required: []
    },
  },
  {
    name: 'getTrendingTVShows',
    description: 'Get trending TV shows for a specific time window.',
    inputSchema: {
      type: 'object',
      properties: {
        time_window: { type: 'string', enum: ['day', 'week'], description: 'Time window for trending (default: day).' },
        page: { type: 'number', description: 'Page number for pagination (default: 1).' }
      },
      required: []
    },
  },
  {
    name: 'getPersonDetails',
    description: 'Get detailed information about a person (actor, director, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        personId: { type: 'number', description: 'The TMDB person ID.' },
        append_to_response: { type: 'string', description: 'Additional data to include (e.g., "movie_credits,tv_credits").' }
      },
      required: ['personId']
    },
  },
  {
    name: 'searchPeople',
    description: 'Search for people (actors, directors, etc.) by name.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'The person name to search for.' },
        page: { type: 'number', description: 'Page number for pagination (default: 1).' }
      },
      required: ['query']
    },
  }
];

// Legacy tool format for backward compatibility with mcp.discover
const legacyTools = [
  {
    type: 'function',
    function: {
      name: 'searchMovies',
      description: 'Search for movies by title or keywords.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The movie title or keywords to search for.' },
          page: { type: 'number', description: 'Page number for pagination (default: 1).' },
          year: { type: 'number', description: 'Filter by release year (optional).' }
        },
        required: ['query']
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchTVShows',
      description: 'Search for TV shows by title or keywords.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The TV show title or keywords to search for.' },
          page: { type: 'number', description: 'Page number for pagination (default: 1).' },
          first_air_date_year: { type: 'number', description: 'Filter by first air date year (optional).' }
        },
        required: ['query']
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getMovieDetails',
      description: 'Get detailed information about a specific movie.',
      parameters: {
        type: 'object',
        properties: {
          movieId: { type: 'number', description: 'The TMDB movie ID.' },
          append_to_response: { type: 'string', description: 'Additional data to include (e.g., "credits,videos,reviews").' }
        },
        required: ['movieId']
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTVShowDetails',
      description: 'Get detailed information about a specific TV show.',
      parameters: {
        type: 'object',
        properties: {
          tvId: { type: 'number', description: 'The TMDB TV show ID.' },
          append_to_response: { type: 'string', description: 'Additional data to include (e.g., "credits,videos,reviews").' }
        },
        required: ['tvId']
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPopularMovies',
      description: 'Get a list of popular movies.',
      parameters: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Page number for pagination (default: 1).' },
          region: { type: 'string', description: 'ISO 3166-1 code for region-specific results (optional).' }
        },
        required: []
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPopularTVShows',
      description: 'Get a list of popular TV shows.',
      parameters: {
        type: 'object',
        properties: {
          page: { type: 'number', description: 'Page number for pagination (default: 1).' }
        },
        required: []
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTrendingMovies',
      description: 'Get trending movies for a specific time window.',
      parameters: {
        type: 'object',
        properties: {
          time_window: { type: 'string', enum: ['day', 'week'], description: 'Time window for trending (default: day).' },
          page: { type: 'number', description: 'Page number for pagination (default: 1).' }
        },
        required: []
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getTrendingTVShows',
      description: 'Get trending TV shows for a specific time window.',
      parameters: {
        type: 'object',
        properties: {
          time_window: { type: 'string', enum: ['day', 'week'], description: 'Time window for trending (default: day).' },
          page: { type: 'number', description: 'Page number for pagination (default: 1).' }
        },
        required: []
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'getPersonDetails',
      description: 'Get detailed information about a person (actor, director, etc.).',
      parameters: {
        type: 'object',
        properties: {
          personId: { type: 'number', description: 'The TMDB person ID.' },
          append_to_response: { type: 'string', description: 'Additional data to include (e.g., "movie_credits,tv_credits").' }
        },
        required: ['personId']
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'searchPeople',
      description: 'Search for people (actors, directors, etc.) by name.',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'The person name to search for.' },
          page: { type: 'number', description: 'Page number for pagination (default: 1).' }
        },
        required: ['query']
      },
    },
  }
];

// --- Tool Implementation ---
const toolImplementations: { [key: string]: (params: any) => Promise<any> } = {
  searchMovies: async ({ query, page = 1, year }: { query: string; page?: number; year?: number }) => {
    const params: any = { query, page };
    if (year) params.year = year;
    
    const { data } = await tmdbApi.get('/search/movie', { params });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        genre_ids: movie.genre_ids,
        popularity: movie.popularity
      }))
    };
  },

  searchTVShows: async ({ query, page = 1, first_air_date_year }: { query: string; page?: number; first_air_date_year?: number }) => {
    const params: any = { query, page };
    if (first_air_date_year) params.first_air_date_year = first_air_date_year;
    
    const { data } = await tmdbApi.get('/search/tv', { params });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((show: any) => ({
        id: show.id,
        name: show.name,
        first_air_date: show.first_air_date,
        overview: show.overview,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
        genre_ids: show.genre_ids,
        popularity: show.popularity,
        origin_country: show.origin_country
      }))
    };
  },

  getMovieDetails: async ({ movieId, append_to_response }: { movieId: number; append_to_response?: string }) => {
    const params: any = {};
    if (append_to_response) params.append_to_response = append_to_response;
    
    const { data } = await tmdbApi.get(`/movie/${movieId}`, { params });
    
    return {
      id: data.id,
      title: data.title,
      original_title: data.original_title,
      overview: data.overview,
      release_date: data.release_date,
      runtime: data.runtime,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      popularity: data.popularity,
      budget: data.budget,
      revenue: data.revenue,
      genres: data.genres,
      production_companies: data.production_companies,
      production_countries: data.production_countries,
      spoken_languages: data.spoken_languages,
      poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      homepage: data.homepage,
      imdb_id: data.imdb_id,
      status: data.status,
      tagline: data.tagline,
      ...(data.credits && { credits: data.credits }),
      ...(data.videos && { videos: data.videos }),
      ...(data.reviews && { reviews: data.reviews })
    };
  },

  getTVShowDetails: async ({ tvId, append_to_response }: { tvId: number; append_to_response?: string }) => {
    const params: any = {};
    if (append_to_response) params.append_to_response = append_to_response;
    
    const { data } = await tmdbApi.get(`/tv/${tvId}`, { params });
    
    return {
      id: data.id,
      name: data.name,
      original_name: data.original_name,
      overview: data.overview,
      first_air_date: data.first_air_date,
      last_air_date: data.last_air_date,
      number_of_episodes: data.number_of_episodes,
      number_of_seasons: data.number_of_seasons,
      vote_average: data.vote_average,
      vote_count: data.vote_count,
      popularity: data.popularity,
      genres: data.genres,
      created_by: data.created_by,
      episode_run_time: data.episode_run_time,
      in_production: data.in_production,
      languages: data.languages,
      networks: data.networks,
      origin_country: data.origin_country,
      production_companies: data.production_companies,
      production_countries: data.production_countries,
      seasons: data.seasons,
      spoken_languages: data.spoken_languages,
      status: data.status,
      tagline: data.tagline,
      type: data.type,
      poster_path: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      backdrop_path: data.backdrop_path ? `https://image.tmdb.org/t/p/w1280${data.backdrop_path}` : null,
      homepage: data.homepage,
      ...(data.credits && { credits: data.credits }),
      ...(data.videos && { videos: data.videos }),
      ...(data.reviews && { reviews: data.reviews })
    };
  },

  getPopularMovies: async ({ page = 1, region }: { page?: number; region?: string }) => {
    const params: any = { page };
    if (region) params.region = region;
    
    const { data } = await tmdbApi.get('/movie/popular', { params });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        genre_ids: movie.genre_ids,
        popularity: movie.popularity
      }))
    };
  },

  getPopularTVShows: async ({ page = 1 }: { page?: number }) => {
    const { data } = await tmdbApi.get('/tv/popular', { params: { page } });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((show: any) => ({
        id: show.id,
        name: show.name,
        first_air_date: show.first_air_date,
        overview: show.overview,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
        genre_ids: show.genre_ids,
        popularity: show.popularity,
        origin_country: show.origin_country
      }))
    };
  },

  getTrendingMovies: async ({ time_window = 'day', page = 1 }: { time_window?: string; page?: number }) => {
    const { data } = await tmdbApi.get(`/trending/movie/${time_window}`, { params: { page } });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((movie: any) => ({
        id: movie.id,
        title: movie.title,
        release_date: movie.release_date,
        overview: movie.overview,
        vote_average: movie.vote_average,
        vote_count: movie.vote_count,
        poster_path: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdrop_path: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        genre_ids: movie.genre_ids,
        popularity: movie.popularity
      }))
    };
  },

  getTrendingTVShows: async ({ time_window = 'day', page = 1 }: { time_window?: string; page?: number }) => {
    const { data } = await tmdbApi.get(`/trending/tv/${time_window}`, { params: { page } });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((show: any) => ({
        id: show.id,
        name: show.name,
        first_air_date: show.first_air_date,
        overview: show.overview,
        vote_average: show.vote_average,
        vote_count: show.vote_count,
        poster_path: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        backdrop_path: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
        genre_ids: show.genre_ids,
        popularity: show.popularity,
        origin_country: show.origin_country
      }))
    };
  },

  getPersonDetails: async ({ personId, append_to_response }: { personId: number; append_to_response?: string }) => {
    const params: any = {};
    if (append_to_response) params.append_to_response = append_to_response;
    
    const { data } = await tmdbApi.get(`/person/${personId}`, { params });
    
    return {
      id: data.id,
      name: data.name,
      biography: data.biography,
      birthday: data.birthday,
      deathday: data.deathday,
      place_of_birth: data.place_of_birth,
      profile_path: data.profile_path ? `https://image.tmdb.org/t/p/w500${data.profile_path}` : null,
      adult: data.adult,
      also_known_as: data.also_known_as,
      gender: data.gender,
      homepage: data.homepage,
      imdb_id: data.imdb_id,
      known_for_department: data.known_for_department,
      popularity: data.popularity,
      ...(data.movie_credits && { movie_credits: data.movie_credits }),
      ...(data.tv_credits && { tv_credits: data.tv_credits })
    };
  },

  searchPeople: async ({ query, page = 1 }: { query: string; page?: number }) => {
    const { data } = await tmdbApi.get('/search/person', { params: { query, page } });
    
    return {
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results,
      results: data.results.map((person: any) => ({
        id: person.id,
        name: person.name,
        profile_path: person.profile_path ? `https://image.tmdb.org/t/p/w500${person.profile_path}` : null,
        adult: person.adult,
        gender: person.gender,
        known_for_department: person.known_for_department,
        popularity: person.popularity,
        known_for: person.known_for
      }))
    };
  }
};

// --- Express Server Setup ---
const app = express();

// Add CORS middleware for metamcp compatibility
app.use((req: Request, res: Response, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

app.use(express.json());

// Add connection logging middleware
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// MCP Endpoint
app.post('/mcp', async (req: Request, res: Response) => {
  const { jsonrpc, method, params, id } = req.body;

  if (jsonrpc !== '2.0' || !method) {
    return res.status(400).json({ jsonrpc: '2.0', error: { code: -32600, message: 'Invalid Request' }, id: id || null });
  }

  try {
    let result;
    if (method === 'mcp.discover') {
      result = { tools: legacyTools };
    } else if (method === 'initialize') {
      // Standard MCP initialization
      result = {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'tmdb-mcp-server',
          version: '1.0.0'
        }
      };
    } else if (method === 'tools/list') {
      // Standard MCP tools list
      result = { tools };
    } else if (method === 'tools/call') {
      // Standard MCP tool call
      const { name, arguments: args } = params;
      const toolImplementation = toolImplementations[name];
      if (!toolImplementation) {
        throw { code: -32601, message: 'Tool not found' };
      }
      const toolResult = await toolImplementation(args || {});
      result = {
        content: [
          {
            type: 'text',
            text: typeof toolResult === 'string' ? toolResult : JSON.stringify(toolResult, null, 2)
          }
        ]
      };
    } else if (method === 'notifications/initialized') {
      // Standard MCP notification - just acknowledge
      result = {};
    } else {
      const toolImplementation = toolImplementations[method];
      if (!toolImplementation) {
        throw { code: -32601, message: 'Method not found' };
      }
      result = await toolImplementation(params || {});
    }
    return res.json({ jsonrpc: '2.0', result, id });
  } catch (error: any) {
    console.error(`Error processing method '${method}':`, error.response?.data || error.message);
    const code = error.code || -32603;
    const message = error.response?.data?.status_message || error.response?.data?.message || error.message || 'Internal error';
    return res.status(500).json({ jsonrpc: '2.0', error: { code, message }, id });
  }
});

// Health Check Endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`TMDB MCP Server running on http://localhost:${PORT}`);
  console.log(`MCP endpoint available at http://localhost:${PORT}/mcp`);
});