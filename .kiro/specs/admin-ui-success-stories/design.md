# Design Document

## Overview

This design outlines the implementation of visual enhancements to the admin panel and the integration of Unsplash portrait images into the Success Stories section. The focus is on creating a modern, polished user interface that feels professional while maintaining excellent performance and accessibility.

The implementation leverages the existing imageService infrastructure for Unsplash integration and enhances the current admin components with improved CSS styling, animations, and visual feedback.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                             │
│  ┌────────────────────────┐    ┌─────────────────────────────┐ │
│  │   Admin Panel          │    │   Home Page                 │ │
│  │   - AdminDashboard.js  │    │   - Home.js                 │ │
│  │   - UserManagement.js  │    │   - SuccessStoryCard.js     │ │
│  │   - AdminDashboard.css │    │   - SuccessStoryImage.js    │ │
│  │   - AdminCommon.css    │    │                             │ │
│  └──────────┬─────────────┘    └──────────┬──────────────────┘ │
│             │                              │                     │
└─────────────┼──────────────────────────────┼─────────────────────┘
              │                              │
              ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Backend API (Node.js/Express)                 │
│  ┌────────────────────────┐    ┌─────────────────────────────┐ │
│  │   Admin Routes         │    │   Image Service             │ │
│  │   - DELETE /users/:id  │    │   - Portrait image search   │ │
│  │   - User validation    │    │   - Unsplash API calls      │ │
│  └────────────────────────┘    └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

**Success Story Image Flow:**
1. Home page renders Success Stories section
2. SuccessStoryCard component requests portrait image
3. SuccessStoryImage component checks for cached image
4. If not cached, calls imageService with portrait-specific query
5. Unsplash API returns professional portrait photo
6. Image displays with loading skeleton transition
7. Fallback to initials avatar if API fails

**User Deletion Flow:**
1. Admin clicks delete button on user row
2. Delete confirmation modal displays with user details
3. Admin confirms deletion
4. Frontend calls DELETE /api/v1/admin/users/:id
5. Backend validates admin isn't deleting last admin
6. Backend removes user and associated data
7. Success notification displays, user list refreshes

## Components and Interfaces

### Frontend Components

#### 1. SuccessStoryCard Component

**Location:** `src/components/home/SuccessStoryCard.js`

**Props:**
```javascript
{
  name: string,           // "Mary Wanjiku"
  role: string,           // "Small Business Owner, Kiharu"
  testimonial: string,    // Quote text
  badge: string,          // "150% Income Increase"
  badgeVariant: string,   // "success", "primary", "warning"
  gender: string          // "female" or "male" for image search
}
```

**Features:**
- Renders testimonial card with portrait image
- Handles image loading states
- Displays initials fallback on error
- Responsive design for mobile

#### 2. SuccessStoryImage Component

**Location:** `src/components/home/SuccessStoryImage.js`

**Props:**
```javascript
{
  name: string,           // Person's name for alt text
  gender: string,         // "female" or "male"
  size: number,           // Image size in pixels (default: 80)
  className: string       // Additional CSS classes
}
```

**State:**
```javascript
{
  imageUrl: string | null,
  loading: boolean,
  error: boolean
}
```

**Features:**
- Fetches portrait from Unsplash API
- Shows loading skeleton during fetch
- Falls back to initials avatar on error
- Circular frame with border styling

#### 3. Enhanced AdminDashboard Styles

**Location:** `src/pages/admin/AdminDashboard.css` (enhanced)

**New Style Classes:**
```css
.welcome-banner-enhanced    // Animated gradient banner
.stat-card-enhanced         // Gradient icon backgrounds
.quick-action-enhanced      // Hover animations
.data-table-enhanced        // Styled headers and rows
```

### Backend Services

#### 1. Image Service Enhancement

**Location:** `backend/services/imageService.js`

**New Method:**
```javascript
async getPortraitImage(personId, gender, ethnicity = 'african') {
  // Search for professional portrait photos
  // Query: "professional portrait {gender} {ethnicity} person"
  // Returns high-quality headshot URL
  // Caches result for reuse
}
```

**Portrait Search Queries:**
- Female: "professional african woman portrait headshot"
- Male: "professional african man portrait headshot"
- Fallback: "professional person portrait business"

#### 2. Admin Controller Enhancement

**Location:** `backend/controllers/adminController.js`

**Enhanced deleteUser Method:**
```javascript
async deleteUser(req, res) {
  // Check if user exists
  // Verify not deleting last admin
  // Delete associated data (assessments, progress, certificates)
  // Delete user account
  // Return success response
}
```

### API Endpoints

#### Portrait Image Endpoint

```
GET /api/v1/images/portrait
- Get portrait image for success story
- Query: { personId, gender, ethnicity }
- Auth: Not required (public)
- Response: { success, data: { url }, message }
```

#### User Deletion Endpoint (Enhanced)

```
DELETE /api/v1/admin/users/:id
- Delete user and associated data
- Params: id (user ID)
- Auth: Admin only
- Validation: Cannot delete last admin
- Response: { success, message }
```

## Data Models

### Portrait Image Cache

Uses existing ImageMetadata model with contentType: 'portrait'

```javascript
{
  contentId: 'portrait_mary_wanjiku',
  contentType: 'portrait',
  imageUrl: 'https://images.unsplash.com/...',
  prompt: 'professional african woman portrait',
  category: 'portrait',
  source: 'unsplash',
  metadata: {
    gender: 'female',
    ethnicity: 'african'
  }
}
```

## Error Handling

### Image Loading Errors

```javascript
{
  PORTRAIT_NOT_FOUND: {
    fallback: 'Display initials avatar',
    styling: 'Gradient background with white initials'
  },
  API_RATE_LIMITED: {
    fallback: 'Use cached image or initials',
    retry: 'Queue for later retry'
  }
}
```

### User Deletion Errors

```javascript
{
  LAST_ADMIN_DELETE: {
    code: 'ADMIN_001',
    message: 'Cannot delete the last administrator account',
    status: 400
  },
  USER_NOT_FOUND: {
    code: 'ADMIN_002', 
    message: 'User not found',
    status: 404
  }
}
```

## Visual Design Specifications

### Color Palette

```css
/* Admin Panel Gradients */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-success: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
--gradient-info: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--gradient-warning: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
--gradient-danger: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);

/* Shadows */
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);
--shadow-md: 0 4px 20px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 12px 40px rgba(0, 0, 0, 0.15);
--shadow-hover: 0 15px 45px rgba(0, 0, 0, 0.2);
```

### Animation Specifications

```css
/* Card Hover */
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-8px);
  box-shadow: var(--shadow-hover);
}

/* Icon Scale */
.icon-scale:hover {
  transform: scale(1.1);
}

/* Loading Skeleton */
@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}
```

### Portrait Image Styling

```css
.portrait-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.portrait-fallback {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
}
```

### Success Story Card Design

```
┌─────────────────────────────────────┐
│                                     │
│         ┌─────────┐                 │
│         │ Portrait│                 │
│         │  Image  │                 │
│         └─────────┘                 │
│                                     │
│        Mary Wanjiku                 │
│   Small Business Owner, Kiharu     │
│                                     │
│  "After learning digital skills,   │
│   my clothing business increased   │
│   by 150%..."                      │
│                                     │
│      [150% Income Increase]        │
│                                     │
└─────────────────────────────────────┘
```

## Testing Strategy

### Unit Tests

**Image Loading:**
- Test Unsplash API integration
- Test fallback to initials avatar
- Test loading state transitions
- Test cache hit/miss scenarios

**User Deletion:**
- Test successful deletion
- Test last admin protection
- Test associated data cleanup
- Test error handling

### Visual Testing

**Admin Panel:**
- Verify gradient rendering across browsers
- Test hover animations smoothness
- Verify responsive layouts
- Check color contrast accessibility

**Success Stories:**
- Verify portrait image loading
- Test fallback avatar display
- Check mobile responsiveness
- Verify loading skeleton animation

## Accessibility Considerations

### Images
- Meaningful alt text: "Portrait of {name}"
- Fallback text for screen readers
- Sufficient color contrast in avatars

### Animations
- Respect prefers-reduced-motion
- No flashing or rapid animations
- Smooth, subtle transitions only

### Admin Panel
- Keyboard navigation support
- Focus indicators on interactive elements
- ARIA labels for icon-only buttons

## Performance Considerations

### Image Optimization
- Use Unsplash's built-in sizing (?w=200 for portraits)
- Lazy load images below the fold
- Cache portrait URLs in localStorage
- Preload critical images

### CSS Optimization
- Use CSS transforms for animations (GPU accelerated)
- Minimize repaints with will-change hints
- Bundle admin styles separately

## Implementation Notes

### Unsplash Portrait Queries

For diverse, professional portraits representing Kenyan users:

```javascript
const portraitQueries = {
  female: [
    'professional african woman portrait business',
    'african woman headshot professional',
    'kenyan woman portrait professional'
  ],
  male: [
    'professional african man portrait business',
    'african man headshot professional',
    'kenyan man portrait professional'
  ]
};
```

### Success Story Data Structure

```javascript
const successStories = [
  {
    id: 'mary_wanjiku',
    name: 'Mary Wanjiku',
    role: 'Small Business Owner, Kiharu',
    gender: 'female',
    testimonial: 'After learning digital skills, my clothing business increased by 150%. I now sell online and receive payments digitally.',
    badge: '150% Income Increase',
    badgeVariant: 'success'
  },
  {
    id: 'john_kamau',
    name: 'John Kamau',
    role: 'Farmer, Kiharu',
    gender: 'male',
    testimonial: 'I learned to use accounting apps and now I know my monthly profits. I also sell my produce online to reach more customers.',
    badge: 'Modern Farmer',
    badgeVariant: 'primary'
  },
  {
    id: 'grace_nyambura',
    name: 'Grace Nyambura',
    role: 'Young Entrepreneur, Kiharu',
    gender: 'female',
    testimonial: 'I started my own digital services company. Now I help others while earning a sustainable income for my family.',
    badge: 'Successful Entrepreneur',
    badgeVariant: 'warning'
  }
];
```

## Deployment Considerations

### Environment Variables

Existing UNSPLASH_ACCESS_KEY is already configured. No new environment variables needed.

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- CSS Grid and Flexbox for layouts
- CSS Custom Properties for theming
- Intersection Observer for lazy loading

