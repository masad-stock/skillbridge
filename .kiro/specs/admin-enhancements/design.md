# Design Document

## Overview

This design outlines the implementation of two major enhancements to the Adaptive Digital Skills Platform:

1. **Admin User Creation**: A comprehensive user management interface allowing administrators to create, configure, and manage user accounts directly from the admin panel
2. **AI-Generated Images**: Integration of AI image generation services to automatically create contextual, engaging visuals throughout the application

The design prioritizes user experience, performance, and maintainability while ensuring graceful degradation when external services are unavailable.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │  Admin Panel     │         │   Image Components       │ │
│  │  - User Creation │         │   - Module Cards         │ │
│  │  - User List     │         │   - Hero Sections        │ │
│  │  - Role Mgmt     │         │   - Lazy Loading         │ │
│  └────────┬─────────┘         └──────────┬───────────────┘ │
│           │                               │                  │
└───────────┼───────────────────────────────┼──────────────────┘
            │                               │
            ▼                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)             │
│  ┌──────────────────┐         ┌──────────────────────────┐ │
│  │  Admin Routes    │         │   Image Service          │ │
│  │  - POST /users   │         │   - Generate Images      │ │
│  │  - PUT /users    │         │   - Cache Management     │ │
│  │  - DELETE /users │         │   - Fallback Logic       │ │
│  └────────┬─────────┘         └──────────┬───────────────┘ │
│           │                               │                  │
└───────────┼───────────────────────────────┼──────────────────┘
            │                               │
            ▼                               ▼
┌──────────────────────┐         ┌──────────────────────────┐
│   MongoDB Database   │         │  AI Image Service API    │
│   - Users Collection │         │  - Unsplash (Free)       │
│   - Images Metadata  │         │  - Or DALL-E/Stable Diff │
└──────────────────────┘         └──────────────────────────┘
```

### Component Interaction Flow

**User Creation Flow:**
1. Admin clicks "Add User" button
2. Modal form displays with validation
3. Admin submits form data
4. Frontend validates and sends POST request
5. Backend validates, hashes password, creates user
6. Database stores new user record
7. Success response updates UI and refreshes user list

**Image Generation Flow:**
1. Component requests image for content
2. Check local cache first
3. If not cached, check database for stored URL
4. If no URL, request from AI service
5. Store URL in database and cache
6. Display image with loading states
7. Fallback to placeholder on any failure

## Components and Interfaces

### Frontend Components

#### 1. CreateUserModal Component

**Location:** `src/components/admin/CreateUserModal.js`

**Props:**
```javascript
{
  show: boolean,
  onHide: function,
  onUserCreated: function
}
```

**State:**
```javascript
{
  formData: {
    email: string,
    password: string,
    confirmPassword: string,
    firstName: string,
    lastName: string,
    phoneNumber: string,
    role: 'user' | 'instructor' | 'admin'
  },
  errors: object,
  loading: boolean,
  showPassword: boolean
}
```

**Features:**
- Real-time validation
- Password strength indicator
- Role selection dropdown
- Error handling and display
- Success feedback

#### 2. AIImage Component

**Location:** `src/components/common/AIImage.js`

**Props:**
```javascript
{
  prompt: string,
  category: string,
  alt: string,
  className: string,
  fallbackSrc: string,
  width: number,
  height: number,
  priority: boolean
}
```

**Features:**
- Lazy loading by default
- Progressive image loading
- Automatic fallback handling
- Cache integration
- Loading skeleton
- Error boundary

#### 3. HeroSection Component

**Location:** `src/components/common/HeroSection.js`

**Props:**
```javascript
{
  title: string,
  subtitle: string,
  imagePrompt: string,
  category: string,
  overlay: boolean,
  height: string
}
```

**Features:**
- Gradient overlay options
- Responsive sizing
- Text positioning
- Background blur while loading

### Backend Services

#### 1. User Service Enhancement

**Location:** `backend/services/userService.js`

**New Methods:**
```javascript
async createUserByAdmin(userData) {
  // Validate admin permissions
  // Hash password
  // Create user with specified role
  // Send welcome email (optional)
  // Return created user
}

async validateUserCreation(userData) {
  // Check email uniqueness
  // Validate password strength
  // Validate phone number format
  // Validate role permissions
}
```

#### 2. Image Service

**Location:** `backend/services/imageService.js`

**Methods:**
```javascript
async generateImage(prompt, options) {
  // Call AI service API
  // Handle rate limiting
  // Store URL in database
  // Return image URL
}

async getOrGenerateImage(contentId, prompt, category) {
  // Check database for existing image
  // If not found, generate new image
  // Cache result
  // Return image URL
}

async getCachedImage(contentId) {
  // Retrieve from database
  // Check if URL is still valid
  // Return cached URL or null
}

async regenerateImage(contentId, newPrompt) {
  // Delete old image reference
  // Generate new image
  // Update database
  // Clear caches
}

getFallbackImage(category) {
  // Return category-specific placeholder
}
```

#### 3. Image Cache Service

**Location:** `backend/services/imageCacheService.js`

**Methods:**
```javascript
async cacheImage(key, url, metadata) {
  // Store in Redis or database
  // Set expiration time
}

async getCachedImage(key) {
  // Retrieve from cache
  // Check expiration
  // Return URL or null
}

async invalidateCache(key) {
  // Remove from cache
}

async cleanupOldCache() {
  // Remove expired entries
  // Maintain cache size limits
}
```

### API Endpoints

#### Admin User Management

```
POST /api/v1/admin/users
- Create new user account
- Body: { email, password, profile, role }
- Auth: Admin only
- Response: { success, data: user, message }

PUT /api/v1/admin/users/:id/role
- Update user role
- Body: { role }
- Auth: Admin only
- Response: { success, data: user, message }
```

#### Image Management

```
GET /api/v1/images/generate
- Generate AI image
- Query: { prompt, category, contentId }
- Auth: Required
- Response: { success, data: { url, cached }, message }

POST /api/v1/admin/images/regenerate
- Regenerate image for content
- Body: { contentId, prompt }
- Auth: Admin only
- Response: { success, data: { url }, message }

GET /api/v1/images/fallback/:category
- Get fallback image for category
- Params: category
- Auth: Not required
- Response: Image file or URL
```

## Data Models

### User Model Enhancement

```javascript
// No changes needed to existing User model
// Existing fields support all requirements
```

### Image Metadata Model

**Location:** `backend/models/ImageMetadata.js`

```javascript
{
  contentId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  contentType: {
    type: String,
    enum: ['module', 'hero', 'category', 'custom'],
    required: true
  },
  imageUrl: {
    type: String,
    required: true
  },
  prompt: {
    type: String,
    required: true
  },
  category: {
    type: String,
    index: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['unsplash', 'dalle', 'stable-diffusion', 'uploaded'],
    required: true
  },
  metadata: {
    width: Number,
    height: Number,
    format: String,
    size: Number
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    index: true
  },
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessedAt: Date
}
```

## Error Handling

### User Creation Errors

```javascript
{
  EMAIL_EXISTS: {
    code: 'USER_001',
    message: 'Email address is already registered',
    status: 409
  },
  INVALID_ROLE: {
    code: 'USER_002',
    message: 'Invalid role specified',
    status: 400
  },
  WEAK_PASSWORD: {
    code: 'USER_003',
    message: 'Password does not meet security requirements',
    status: 400
  },
  UNAUTHORIZED_ROLE_ASSIGNMENT: {
    code: 'USER_004',
    message: 'Insufficient permissions to assign this role',
    status: 403
  }
}
```

### Image Service Errors

```javascript
{
  IMAGE_GENERATION_FAILED: {
    code: 'IMG_001',
    message: 'Failed to generate image',
    status: 500,
    fallback: 'Use placeholder image'
  },
  RATE_LIMIT_EXCEEDED: {
    code: 'IMG_002',
    message: 'Image generation rate limit exceeded',
    status: 429,
    fallback: 'Queue for retry'
  },
  INVALID_PROMPT: {
    code: 'IMG_003',
    message: 'Image prompt contains invalid content',
    status: 400,
    fallback: 'Use category default'
  },
  SERVICE_UNAVAILABLE: {
    code: 'IMG_004',
    message: 'Image service temporarily unavailable',
    status: 503,
    fallback: 'Use cached or placeholder'
  }
}
```

## Testing Strategy

### Unit Tests

**User Creation:**
- Test form validation logic
- Test password hashing
- Test role assignment
- Test duplicate email detection
- Test permission checks

**Image Service:**
- Test image URL generation
- Test cache hit/miss scenarios
- Test fallback logic
- Test prompt sanitization
- Test rate limit handling

### Integration Tests

**Admin User Flow:**
- Test complete user creation workflow
- Test user list refresh after creation
- Test role-based access control
- Test error handling and display

**Image Loading Flow:**
- Test image generation and caching
- Test fallback to placeholders
- Test offline image access
- Test cache invalidation

### E2E Tests

**Admin Panel:**
- Navigate to user management
- Click "Add User" button
- Fill form with valid data
- Submit and verify user creation
- Verify user appears in list

**Image Display:**
- Navigate to learning modules
- Verify images load progressively
- Test offline mode with cached images
- Verify fallback images on errors

## Image Service Integration Options

### Option 1: Unsplash API (Recommended for MVP)

**Pros:**
- Free tier with 50 requests/hour
- High-quality, curated images
- No AI generation needed
- Simple REST API
- No content moderation issues

**Cons:**
- Limited to existing photos
- Requires attribution
- Not truly "generated" content

**Implementation:**
```javascript
const unsplash = require('unsplash-js').createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY
});

async function searchImage(query, category) {
  const result = await unsplash.search.getPhotos({
    query: `${query} ${category} digital learning`,
    perPage: 1,
    orientation: 'landscape'
  });
  
  return result.response.results[0]?.urls?.regular;
}
```

### Option 2: DALL-E API (OpenAI)

**Pros:**
- True AI generation
- Highly customizable
- Consistent style possible
- High quality output

**Cons:**
- Costs $0.02 per image (1024x1024)
- Requires OpenAI API key
- Rate limits apply
- Content policy restrictions

**Implementation:**
```javascript
const openai = require('openai');

async function generateImage(prompt) {
  const response = await openai.images.generate({
    model: "dall-e-3",
    prompt: `Educational illustration: ${prompt}`,
    size: "1024x1024",
    quality: "standard",
    n: 1
  });
  
  return response.data[0].url;
}
```

### Option 3: Stable Diffusion (Self-hosted or API)

**Pros:**
- Open source
- Can self-host for free
- No per-image costs
- Full control

**Cons:**
- Requires GPU infrastructure
- Setup complexity
- Maintenance overhead
- Quality varies

### Recommended Approach

**Phase 1 (MVP):** Use Unsplash API
- Quick to implement
- No costs
- Good quality images
- Reliable service

**Phase 2 (Enhancement):** Add DALL-E integration
- Generate custom images for premium content
- Use Unsplash as fallback
- Implement cost controls

## Performance Considerations

### Image Loading Strategy

1. **Lazy Loading:** Load images only when they enter viewport
2. **Progressive Loading:** Show low-quality placeholder, then full image
3. **Caching:** Store URLs in database, images in browser cache
4. **CDN:** Consider using CDN for frequently accessed images
5. **Compression:** Optimize image sizes before serving

### Cache Strategy

```javascript
// Three-tier caching
1. Browser Cache (Service Worker)
   - 50MB limit
   - 30-day expiration
   
2. Redis Cache (Server)
   - Image URLs and metadata
   - 7-day expiration
   
3. Database (MongoDB)
   - Permanent storage
   - Image metadata and URLs
```

### Rate Limiting

```javascript
// Prevent API abuse
{
  imageGeneration: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 requests per hour
    message: 'Too many image generation requests'
  },
  userCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 users per hour
    message: 'Too many user creation requests'
  }
}
```

## Security Considerations

### User Creation Security

1. **Password Requirements:**
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one number
   - At least one special character

2. **Role Assignment:**
   - Only admins can create admin users
   - Log all role assignments
   - Require confirmation for admin role

3. **Input Validation:**
   - Sanitize all input fields
   - Validate email format
   - Check phone number format
   - Prevent SQL injection

### Image Service Security

1. **Prompt Sanitization:**
   - Filter inappropriate content
   - Limit prompt length
   - Validate against blacklist

2. **URL Validation:**
   - Verify image URLs before storing
   - Check for malicious content
   - Validate image formats

3. **API Key Protection:**
   - Store keys in environment variables
   - Rotate keys regularly
   - Monitor usage for anomalies

## Accessibility

### User Creation Form

- Proper label associations
- ARIA attributes for validation errors
- Keyboard navigation support
- Screen reader announcements
- Focus management in modal

### Images

- Meaningful alt text for all images
- Fallback text when images fail
- Sufficient color contrast in overlays
- No text embedded in images
- Loading state announcements

## Deployment Considerations

### Environment Variables

```env
# Image Service
UNSPLASH_ACCESS_KEY=your_unsplash_key
OPENAI_API_KEY=your_openai_key (optional)
IMAGE_CACHE_DURATION=604800 # 7 days in seconds
IMAGE_GENERATION_ENABLED=true
DEFAULT_IMAGE_QUALITY=standard

# User Creation
MIN_PASSWORD_LENGTH=8
REQUIRE_PASSWORD_COMPLEXITY=true
ALLOW_ADMIN_CREATION=true
SEND_WELCOME_EMAIL=false
```

### Database Migrations

```javascript
// Migration: Add image metadata collection
db.createCollection('imagemetadata');
db.imagemetadata.createIndex({ contentId: 1 }, { unique: true });
db.imagemetadata.createIndex({ category: 1 });
db.imagemetadata.createIndex({ expiresAt: 1 });
```

### Monitoring

- Track image generation success/failure rates
- Monitor API usage and costs
- Log user creation activities
- Alert on rate limit approaches
- Track cache hit rates

## Future Enhancements

1. **Bulk User Import:** CSV upload for multiple users
2. **Custom Image Upload:** Allow admins to upload custom images
3. **Image Variations:** Generate multiple options to choose from
4. **Style Consistency:** Maintain consistent visual style across images
5. **Image Analytics:** Track which images perform best
6. **A/B Testing:** Test different images for engagement
7. **User Avatars:** AI-generated profile pictures
8. **Certificate Backgrounds:** Custom certificate designs
