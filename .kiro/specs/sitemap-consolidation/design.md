# Design Document

## Overview

This design document outlines the implementation of the remaining sitemap consolidation work for SkillBridge254. The goal is to complete the migration from a dual-architecture system (static HTML + React PWA) to a unified React PWA by implementing missing pages and backend functionality for instructors, blog posts, and events.

The implementation follows the existing patterns established in the codebase, particularly the Courses and CourseDetails pages that have already been implemented.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React PWA Frontend                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Instructors  │  │    Blog      │  │   Events     │     │
│  │   Pages      │  │   Pages      │  │   Pages      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                    ┌──────▼──────┐                         │
│                    │  API Client  │                         │
│                    └──────┬──────┘                         │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │  Express API   │
                    │    Backend     │
                    └───────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│   Instructor   │  │    BlogPost    │  │    Event    │
│     Routes     │  │     Routes     │  │    Routes   │
└───────┬────────┘  └───────┬────────┘  └──────┬──────┘
        │                   │                   │
┌───────▼────────┐  ┌───────▼────────┐  ┌──────▼──────┐
│   Instructor   │  │    BlogPost    │  │    Event    │
│  Controllers   │  │  Controllers   │  │ Controllers │
└───────┬────────┘  └───────┬────────┘  └──────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                    ┌───────▼────────┐
                    │    MongoDB     │
                    │    Database    │
                    └────────────────┘
```

### Component Structure

The implementation follows a layered architecture:

1. **Presentation Layer**: React components for UI
2. **API Layer**: RESTful endpoints for data operations
3. **Business Logic Layer**: Controllers and services
4. **Data Layer**: Mongoose models and database

## Components and Interfaces

### Frontend Components

#### 1. Instructors Page (`learner-pwa/src/pages/Instructors.js`)

**Purpose**: Display a searchable, filterable list of instructors

**Props**: None (uses React Router for navigation)

**State**:
- `instructors`: Array of instructor objects
- `loading`: Boolean for loading state
- `searchTerm`: String for search input
- `selectedExpertise`: String for expertise filter

**Key Methods**:
- `fetchInstructors()`: Retrieves instructors from API
- `handleSearch(term)`: Filters instructors by search term
- `handleExpertiseFilter(expertise)`: Filters by expertise area

**UI Elements**:
- Search bar
- Expertise filter dropdown
- Instructor cards grid
- Loading skeleton
- Empty state

#### 2. Instructor Profile Page (`learner-pwa/src/pages/InstructorProfile.js`)

**Purpose**: Display detailed information about a single instructor

**Props**: None (uses React Router params for instructor ID)

**State**:
- `instructor`: Instructor object
- `courses`: Array of courses taught by instructor
- `loading`: Boolean for loading state

**Key Methods**:
- `fetchInstructorDetails(id)`: Retrieves instructor data
- `fetchInstructorCourses(id)`: Retrieves courses taught

**UI Elements**:
- Instructor header (photo, name, title)
- Bio section
- Statistics cards (students, courses, rating)
- Expertise tags
- Social media links
- Courses taught section

#### 3. Blog Page (`learner-pwa/src/pages/Blog.js`)

**Purpose**: Display a list of published blog posts with search and category filtering

**Props**: None

**State**:
- `posts`: Array of blog post objects
- `loading`: Boolean for loading state
- `searchTerm`: String for search input
- `selectedCategory`: String for category filter
- `currentPage`: Number for pagination

**Key Methods**:
- `fetchPosts()`: Retrieves blog posts from API
- `handleSearch(term)`: Filters posts by search term
- `handleCategoryFilter(category)`: Filters by category
- `handlePageChange(page)`: Changes pagination page

**UI Elements**:
- Search bar
- Category filter
- Featured post section
- Blog post cards grid
- Pagination controls

#### 4. Blog Post Page (`learner-pwa/src/pages/BlogPost.js`)

**Purpose**: Display full blog post content

**Props**: None (uses React Router params for post slug)

**State**:
- `post`: Blog post object
- `relatedPosts`: Array of related posts
- `loading`: Boolean for loading state

**Key Methods**:
- `fetchPost(slug)`: Retrieves blog post by slug
- `fetchRelatedPosts(postId)`: Retrieves related posts
- `incrementViewCount(postId)`: Increments view count

**UI Elements**:
- Post header (title, author, date)
- Featured image
- Post content (rendered markdown/HTML)
- Tags
- Author bio
- Related posts section
- Share buttons

#### 5. Events Page (`learner-pwa/src/pages/Events.js`)

**Purpose**: Display upcoming events with filtering options

**Props**: None

**State**:
- `events`: Array of event objects
- `loading`: Boolean for loading state
- `selectedCategory`: String for category filter
- `dateFilter`: String for date range filter

**Key Methods**:
- `fetchEvents()`: Retrieves events from API
- `handleCategoryFilter(category)`: Filters by category
- `handleDateFilter(range)`: Filters by date range

**UI Elements**:
- Category filter
- Date range filter
- Event cards grid
- Calendar view toggle
- Empty state for no events

#### 6. Event Details Page (`learner-pwa/src/pages/EventDetails.js`)

**Purpose**: Display detailed event information and handle registration

**Props**: None (uses React Router params for event ID)

**State**:
- `event`: Event object
- `loading`: Boolean for loading state
- `isRegistered`: Boolean for registration status
- `registering`: Boolean for registration in progress

**Key Methods**:
- `fetchEventDetails(id)`: Retrieves event data
- `handleRegister()`: Registers user for event
- `checkRegistrationStatus()`: Checks if user is registered

**UI Elements**:
- Event header (title, date, location)
- Event description
- Date and time details
- Location/meeting link
- Registration button
- Attendee count
- Organizer information

### Backend Models

#### 1. Instructor Model (`learner-pwa/backend/models/Instructor.js`)

```javascript
{
  name: String (required),
  email: String (required, unique),
  title: String,
  bio: String,
  avatar: String (URL),
  expertise: [String],
  socialLinks: {
    linkedin: String,
    twitter: String,
    github: String,
    website: String
  },
  stats: {
    rating: Number (default: 0),
    students: Number (default: 0),
    courses: Number (default: 0)
  },
  courses: [ObjectId] (ref: 'Module'),
  active: Boolean (default: true),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### 2. BlogPost Model (`learner-pwa/backend/models/BlogPost.js`)

```javascript
{
  title: String (required),
  slug: String (required, unique),
  content: String (required),
  excerpt: String,
  featuredImage: String (URL),
  author: ObjectId (ref: 'User', required),
  category: String,
  tags: [String],
  published: Boolean (default: false),
  publishedAt: Date,
  views: Number (default: 0),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### 3. Event Model (`learner-pwa/backend/models/Event.js`)

```javascript
{
  title: String (required),
  description: String (required),
  startDate: Date (required),
  endDate: Date,
  location: String,
  isOnline: Boolean (default: false),
  meetingLink: String,
  category: String,
  maxAttendees: Number,
  attendees: [ObjectId] (ref: 'User'),
  image: String (URL),
  organizer: ObjectId (ref: 'User', required),
  status: String (enum: ['upcoming', 'ongoing', 'completed', 'cancelled']),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Backend API Endpoints

#### Instructor Endpoints

```
GET    /api/v1/instructors              - List all active instructors
GET    /api/v1/instructors/:id          - Get instructor by ID
GET    /api/v1/instructors/:id/courses  - Get courses taught by instructor
POST   /api/v1/instructors              - Create instructor (admin only)
PUT    /api/v1/instructors/:id          - Update instructor (admin only)
DELETE /api/v1/instructors/:id          - Delete instructor (admin only)
```

#### Blog Endpoints

```
GET    /api/v1/blog                     - List published blog posts
GET    /api/v1/blog/:slug               - Get blog post by slug
GET    /api/v1/blog/category/:category  - Get posts by category
POST   /api/v1/blog                     - Create blog post (admin only)
PUT    /api/v1/blog/:id                 - Update blog post (admin only)
DELETE /api/v1/blog/:id                 - Delete blog post (admin only)
POST   /api/v1/blog/:id/publish         - Publish blog post (admin only)
POST   /api/v1/blog/:slug/view          - Increment view count
```

#### Event Endpoints

```
GET    /api/v1/events                   - List upcoming events
GET    /api/v1/events/:id               - Get event by ID
POST   /api/v1/events                   - Create event (admin only)
PUT    /api/v1/events/:id               - Update event (admin only)
DELETE /api/v1/events/:id               - Delete event (admin only)
POST   /api/v1/events/:id/register      - Register for event (authenticated)
DELETE /api/v1/events/:id/register      - Unregister from event (authenticated)
GET    /api/v1/events/:id/attendees     - Get event attendees (admin only)
```

## Data Models

### Instructor Data Flow

```
User Request → Instructors Page → API Client → Express Route → 
Controller → Mongoose Model → MongoDB → Response → State Update → UI Render
```

### Blog Post Data Flow

```
User Request → Blog Page → API Client → Express Route → 
Controller → Mongoose Model → MongoDB → Response → State Update → UI Render
```

### Event Registration Flow

```
User Clicks Register → Event Details Page → API Client → Express Route → 
Controller → Check Capacity → Add to Attendees → MongoDB → Response → 
State Update → UI Update
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Active Instructor Filtering
*For any* set of instructors in the database with mixed active/inactive statuses, querying the instructors list should return only instructors where active is true.
**Validates: Requirements 1.1**

### Property 2: Instructor Search Accuracy
*For any* search term and set of instructors, all returned results should contain the search term in either the name field or at least one expertise field (case-insensitive).
**Validates: Requirements 1.2**

### Property 3: Instructor Profile Completeness
*For any* instructor object, the rendered profile page should contain all required fields: bio, photo, expertise array, courses array, and statistics object.
**Validates: Requirements 1.4**

### Property 4: Instructor Validation
*For any* instructor creation request, if any required field (name, email) is missing or invalid, the system should reject the request and return a validation error.
**Validates: Requirements 1.5**

### Property 5: Published Blog Post Filtering
*For any* set of blog posts in the database with mixed published/unpublished statuses, querying the blog list should return only posts where published is true.
**Validates: Requirements 2.1**

### Property 6: Blog Search Accuracy
*For any* search term and set of blog posts, all returned results should contain the search term in at least one of: title, content, or tags array (case-insensitive).
**Validates: Requirements 2.2**

### Property 7: Blog Post Completeness
*For any* blog post object, the rendered post page should contain all required fields: title, content, author, date, and related posts array.
**Validates: Requirements 2.4**

### Property 8: View Count Increment
*For any* blog post, viewing the post should increase the view count by exactly 1, and viewing it N times should increase the count by exactly N.
**Validates: Requirements 2.5**

### Property 9: Blog Post Validation
*For any* blog post creation request, if any required field (title, content, author) is missing or invalid, the system should reject the request and return a validation error.
**Validates: Requirements 2.6**

### Property 10: Blog Post Publishing
*For any* unpublished blog post, when the publish action is triggered, the system should set published to true and publishedAt to the current timestamp.
**Validates: Requirements 2.7**

### Property 11: Upcoming Events Filtering
*For any* set of events in the database with mixed past and future dates, querying the events list should return only events where startDate is greater than or equal to the current date.
**Validates: Requirements 3.1**

### Property 12: Event Filter Accuracy
*For any* date range or category filter and set of events, all returned results should have startDate within the specified range (if date filter applied) and match the category (if category filter applied).
**Validates: Requirements 3.2**

### Property 13: Event Details Completeness
*For any* event object, the rendered event page should contain all required fields: title, description, date, time, location, and registration status.
**Validates: Requirements 3.4**

### Property 14: Event Registration Capacity
*For any* event with available capacity (attendees.length < maxAttendees), registering a user should add them to the attendees array; for events at capacity, registration should be rejected.
**Validates: Requirements 3.5, 3.6**

### Property 15: Event Validation
*For any* event creation request, if any required field (title, description, startDate, organizer) is missing or invalid, the system should reject the request and return a validation error.
**Validates: Requirements 3.7**

### Property 16: Authentication Enforcement
*For any* admin endpoint (POST, PUT, DELETE on /instructors, /blog, /events), requests without a valid authentication token should receive a 401 Unauthorized response.
**Validates: Requirements 5.4**

### Property 17: Authorization Enforcement
*For any* admin endpoint, requests with a valid token but without admin role should receive a 403 Forbidden response.
**Validates: Requirements 5.5**

### Property 18: Error Response Consistency
*For any* error condition across all endpoints, the response should follow the format: `{ success: false, message: string, error?: object }`.
**Validates: Requirements 5.7**

### Property 19: Unique Constraint Enforcement
*For any* attempt to create an instructor with a duplicate email or a blog post with a duplicate slug, the system should reject the request and return a unique constraint error.
**Validates: Requirements 6.4**

### Property 20: Automatic Timestamp Generation
*For any* newly created instructor, blog post, or event, the system should automatically populate createdAt and updatedAt fields with the current timestamp.
**Validates: Requirements 6.5**

## Error Handling

### Frontend Error Handling

1. **Network Errors**: Display user-friendly error messages using toast notifications
2. **404 Errors**: Redirect to NotFound page for invalid IDs/slugs
3. **Validation Errors**: Display field-specific error messages in forms
4. **Loading States**: Show skeleton loaders during data fetching
5. **Empty States**: Display helpful messages when no data is available

### Backend Error Handling

1. **Validation Errors**: Return 400 Bad Request with detailed validation messages
2. **Authentication Errors**: Return 401 Unauthorized for missing/invalid tokens
3. **Authorization Errors**: Return 403 Forbidden for insufficient permissions
4. **Not Found Errors**: Return 404 Not Found for non-existent resources
5. **Server Errors**: Return 500 Internal Server Error with logged details

All errors follow the existing error handling middleware pattern established in the codebase.

## Testing Strategy

### Unit Tests

Unit tests will verify specific examples and edge cases:

- Instructor creation with valid/invalid data
- Blog post slug generation
- Event capacity checking
- Date filtering logic
- Search term matching
- Authentication middleware
- Authorization middleware

### Property-Based Tests

Property-based tests will verify universal properties across all inputs using the `fast-check` library (minimum 100 iterations per test):

- **Property 1-20**: Each correctness property listed above will have a corresponding property-based test
- Tests will generate random valid and invalid data
- Tests will verify properties hold across all generated inputs
- Each test will be tagged with: **Feature: sitemap-consolidation, Property N: [property text]**

### Integration Tests

Integration tests will verify end-to-end flows:

- Complete instructor creation and retrieval flow
- Blog post publishing workflow
- Event registration workflow
- Search and filter functionality
- Navigation between pages

### Testing Configuration

- Property tests: Minimum 100 iterations per test
- Test framework: Jest for both frontend and backend
- Property testing library: fast-check
- Coverage target: 80% for new code

## Implementation Notes

### Code Reuse

The implementation will follow patterns from existing pages:

- Courses.js and CourseDetails.js serve as templates for list and detail pages
- Existing API client patterns in `learner-pwa/src/services/api.js`
- Existing authentication/authorization middleware
- Existing error handling patterns

### Styling

- Use existing CSS patterns and Bootstrap components
- Maintain responsive design for mobile devices
- Follow existing color scheme and typography
- Reuse common components (LoadingSkeleton, EmptyState, etc.)

### Performance Considerations

- Implement pagination for blog posts and events
- Use lazy loading for images
- Cache instructor and blog data in frontend state
- Optimize database queries with proper indexing
- Implement search debouncing

### Security Considerations

- Sanitize all user inputs
- Validate file uploads (images)
- Implement rate limiting on public endpoints
- Use parameterized queries to prevent injection
- Follow existing CORS and CSP policies
