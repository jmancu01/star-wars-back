# Star Wars API Full Stack Application

This full-stack application provides a user-friendly interface to explore Star Wars data using the SWAPI (Star Wars API). The project consists of a NestJS backend and a NextJS frontend.

## 🏗️ Project Structure

```
sw-api/
├── src/                          # Source directory
│   ├── shared/                   # Shared modules and services
│   │   ├── swapi.service.ts      # Base service for SWAPI communication
│   │   └── types.ts             # Shared type definitions
│   │
│   ├── characters/              # Characters module
│   │   ├── characters.controller.ts
│   │   ├── characters.service.ts
│   │   └── characters.module.ts
│   │
│   ├── films/                   # Films module
│   │   ├── films.controller.ts
│   │   ├── films.service.ts
│   │   └── films.module.ts
│   │
│   ├── starships/              # Starships module
│   │   ├── starships.controller.ts
│   │   ├── starships.service.ts
│   │   └── starships.module.ts
│   │
│   ├── planets/               # Planets module
│   │   ├── planets.controller.ts
│   │   ├── planets.service.ts
│   │   └── planets.module.ts
│   │
│   ├── app.module.ts         # Main application module
│   └── main.ts              # Application entry point
```

## 🚀 Features

- RESTful API endpoints for:
  - Characters
  - Films
  - Starships
  - Planets
- Pagination support
- Search functionality
- Filtering capabilities
- CORS enabled for frontend communication

## 🛠️ Technology Stack

### Backend (NestJS)

- NestJS as the main framework
- TypeScript for type safety
- Axios for HTTP requests
- RxJS for reactive programming

### API Endpoints

#### Characters

- GET `/characters` - Get all characters (with pagination)
- GET `/characters/:id` - Get specific character
- GET `/characters?search=luke` - Search characters
- GET `/characters?page=2` - Pagination support

#### Films

- GET `/films` - Get all films (with pagination)
- GET `/films/:id` - Get specific film
- GET `/films?search=hope` - Search films
- GET `/films?page=2` - Pagination support

Similar endpoints exist for Starships and Planets.

## 🔧 Setup & Installation

1. Clone the repository:

```bash
git clone [repository-url]
cd sw-api
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables:

```bash
cp .env.example .env
```

4. Start the development server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

## 🔍 API Usage

### Query Parameters

All list endpoints support the following query parameters:

- `page`: Page number for pagination
- `search`: Search term to filter results
- Additional filters specific to each resource

Example requests:

```bash
# Get all characters
GET http://localhost:3000/characters

# Search for Luke
GET http://localhost:3000/characters?search=luke

# Get second page of planets
GET http://localhost:3000/planets?page=2
```

## 🧪 Testing

Run the test suite:

```bash
npm run test
```

Run e2e tests:

```bash
npm run test:e2e
```

## 📚 Project Architecture

### Module Structure

Each resource (characters, films, etc.) is organized into its own module with:

- **Controller**: Handles HTTP requests
- **Service**: Contains business logic
- **Module**: Configures dependencies

### Shared Services

The `SwapiService` in the shared module handles all communication with the external SWAPI, providing:

- Error handling
- Response transformation
- Type safety
- Query parameter handling

### Error Handling

The application implements comprehensive error handling with:

- HTTP exception filters
- Logging
- Type-safe error responses

## 🔐 CORS Configuration

CORS is enabled and configured in `main.ts` to allow requests from the frontend application:

```typescript
app.enableCors({
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
});
```

## 📝 Additional Notes

- The application uses TypeScript for enhanced type safety
- All API responses are properly typed
- Error handling is implemented throughout the application
- The modular structure allows for easy expansion

## 👥 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
