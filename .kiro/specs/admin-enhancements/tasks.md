# Implementation Plan

- [x] 1. Set up image service infrastructure



  - Create ImageMetadata model with contentId, imageUrl, prompt, category, and metadata fields
  - Create imageService.js with methods for generating, caching, and retrieving images
  - Set up Unsplash API integration with access key from environment variables
  - Implement fallback image logic for different categories



  - _Requirements: 3.2, 3.3, 5.1, 5.2, 5.5_

- [ ] 2. Implement image caching system
  - Create imageCacheService.js for managing image URL caching


  - Implement cache storage in MongoDB with expiration timestamps
  - Add cache retrieval logic with expiration checking
  - Implement cache cleanup for expired entries
  - _Requirements: 6.1, 6.2, 6.3_

- [x] 3. Create AIImage React component


  - Build AIImage component with props for prompt, category, alt text, and dimensions
  - Implement lazy loading using Intersection Observer
  - Add loading skeleton/placeholder while image loads
  - Implement error boundary with fallback to placeholder images
  - Add progressive image loading with blur effect
  - _Requirements: 3.1, 3.2, 3.3, 6.4, 6.5_



- [ ] 4. Create HeroSection React component
  - Build HeroSection component with title, subtitle, and image prompt props
  - Implement gradient overlay option for text readability
  - Add responsive sizing for different screen sizes
  - Implement background blur effect while loading


  - Add fallback to gradient background when image unavailable
  - _Requirements: 4.1, 4.3, 4.4, 4.5_

- [ ] 5. Integrate AI images into learning modules
  - Update Module model to include imageUrl and imagePrompt fields
  - Modify module cards to use AIImage component
  - Generate appropriate prompts based on module title and category
  - Implement caching for module images
  - Update seedModules script to generate images for existing modules
  - _Requirements: 3.1, 3.4, 6.1_

- [ ] 6. Add AI images to home and category pages
  - Update Home page to use HeroSection with AI-generated hero image
  - Add hero images to category pages (Business, Digital Skills, etc.)
  - Implement category-specific image prompts
  - Add loading states for hero sections
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 7. Create admin image management interface
  - Add image preview to ModuleManagement component
  - Implement "Regenerate Image" button for each module
  - Add custom image upload functionality
  - Create API endpoint for image regeneration
  - Implement cache invalidation when images are regenerated


  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [ ] 8. Implement CreateUserModal component
  - Create CreateUserModal.js with form fields for email, password, name, phone, and role
  - Add real-time form validation for all fields
  - Implement password strength indicator
  - Add password visibility toggle


  - Implement role selection dropdown with user, instructor, and admin options
  - Add loading state during submission
  - _Requirements: 1.2, 2.1_

- [ ] 9. Add user creation backend logic
  - Create POST /api/v1/admin/users endpoint in admin routes
  - Implement createUserByAdmin method in userService





  - Add validation for email uniqueness
  - Implement password hashing with bcrypt
  - Add role assignment logic with permission checks
  - Implement error handling for duplicate emails and invalid roles
  - _Requirements: 1.3, 1.4, 2.2, 2.3_

- [ ] 10. Integrate CreateUserModal into UserManagement page
  - Add "Add User" button to UserManagement page header
  - Wire up CreateUserModal to show/hide on button click
  - Implement onUserCreated callback to refresh user list
  - Add success message display after user creation
  - Add error message display for creation failures
  - _Requirements: 1.1, 1.5_

- [ ] 11. Add image service API endpoints
  - Create GET /api/v1/images/generate endpoint for image generation
  - Create POST /api/v1/admin/images/regenerate endpoint for admin regeneration
  - Create GET /api/v1/images/fallback/:category endpoint for fallback images
  - Implement rate limiting for image generation endpoints
  - Add authentication middleware to protect endpoints
  - _Requirements: 5.1, 5.3, 7.2_

- [ ] 12. Implement error handling and fallbacks
  - Add error logging for image generation failures
  - Implement automatic fallback to placeholder images
  - Add retry logic for rate limit errors
  - Create category-specific placeholder images
  - Implement graceful degradation when AI service is unavailable
  - _Requirements: 3.2, 3.5, 5.5_

- [ ] 13. Add environment configuration
  - Add UNSPLASH_ACCESS_KEY to .env.example
  - Add IMAGE_CACHE_DURATION configuration
  - Add IMAGE_GENERATION_ENABLED toggle
  - Add MIN_PASSWORD_LENGTH and password complexity settings
  - Update SETUP_GUIDE.md with image service configuration instructions
  - _Requirements: 5.4_

- [ ] 14. Create database migration for image metadata
  - Create migration script to add imagemetadata collection
  - Add indexes for contentId, category, and expiresAt fields
  - Update existing modules with default image prompts
  - _Requirements: 5.2_

- [ ]* 15. Add comprehensive testing
- [ ]* 15.1 Write unit tests for imageService
  - Test image URL generation
  - Test cache hit/miss scenarios
  - Test fallback logic
  - Test rate limit handling
  - _Requirements: 5.1, 5.3, 6.1_

- [ ]* 15.2 Write unit tests for user creation
  - Test form validation logic
  - Test password hashing
  - Test role assignment
  - Test duplicate email detection
  - _Requirements: 1.3, 1.4, 2.2_

- [ ]* 15.3 Write integration tests for admin user flow
  - Test complete user creation workflow
  - Test user list refresh after creation
  - Test role-based access control
  - Test error handling and display
  - _Requirements: 1.1, 1.2, 1.5_

- [ ]* 15.4 Write integration tests for image loading
  - Test image generation and caching
  - Test fallback to placeholders
  - Test cache invalidation
  - _Requirements: 3.1, 3.2, 6.1, 6.2_

- [ ] 16. Update documentation
  - Add admin user creation guide to DOCUMENTATION.md
  - Document image service setup and configuration
  - Add troubleshooting section for image loading issues
  - Document API endpoints for image management
  - Create user guide for admin image management features
  - _Requirements: All_
