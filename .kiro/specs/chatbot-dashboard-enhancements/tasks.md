# Implementation Plan: Chatbot and Dashboard Enhancements

## Overview

This implementation plan addresses three critical enhancements: making the AI chatbot accessible to all users, adding a navigation sidebar to the dashboard, and implementing SF Pro font. The tasks are organized to deliver incremental value, starting with the chatbot fix (highest priority), followed by the sidebar, and finally the typography enhancement.

## Tasks

- [x] 1. Fix ChatWidget to appear on all pages
  - Remove authentication gate from ChatWidget component
  - Implement authentication-aware welcome messages
  - Update message sending logic to handle both authenticated and unauthenticated states
  - _Requirements: 1.1, 1.4, 1.5_

- [ ]* 1.1 Write unit tests for ChatWidget authentication states
  - Test rendering for authenticated users
  - Test rendering for unauthenticated users
  - Test welcome message variations
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Implement backend support for public chatbot access
  - [x] 2.1 Create optional authentication middleware
    - Implement middleware that checks for JWT token but doesn't require it
    - Set req.isAuthenticated flag based on token validity
    - _Requirements: 5.1, 5.2_

  - [x] 2.2 Add public chatbot endpoint
    - Create POST /api/v1/chatbot/message-public route
    - Implement rate limiting for public endpoint (10 req/min per IP)
    - Handle streaming responses for unauthenticated users
    - _Requirements: 2.1, 2.2, 5.4_

  - [x] 2.3 Modify existing chatbot endpoint for optional auth
    - Update POST /api/v1/chatbot/message to use optional auth middleware
    - Implement different rate limits for authenticated vs unauthenticated
    - _Requirements: 2.1, 5.1, 5.2_

- [ ]* 2.4 Write unit tests for chatbot endpoints
  - Test public endpoint without authentication
  - Test authenticated endpoint with valid token
  - Test rate limiting for both endpoints
  - Test error handling
  - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.4_

- [x] 3. Enhance Gemini service for public responses
  - [x] 3.1 Add generatePublicChatResponse method
    - Create method for handling unauthenticated user queries
    - Implement system prompt for general information only
    - Focus on course info, platform features, enrollment process
    - _Requirements: 2.2, 5.2_

  - [x] 3.2 Update generateChatStream for authentication awareness
    - Detect authentication state from context
    - Route to appropriate response generation method
    - Maintain existing personalized responses for authenticated users
    - _Requirements: 1.2, 1.3, 2.3_

- [ ]* 3.3 Write unit tests for Gemini service methods
  - Test public response generation
  - Test authenticated response generation
  - Test context handling
  - _Requirements: 2.2, 2.3, 5.2_

- [x] 4. Checkpoint - Test chatbot functionality
  - Ensure chatbot appears on all pages
  - Verify unauthenticated users can interact with chatbot
  - Verify authenticated users get personalized responses
  - Test rate limiting
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Create Dashboard Sidebar component
  - [x] 5.1 Create DashboardSidebar component file
    - Set up component structure with navigation items
    - Implement collapse/expand state management
    - Add navigation items: Dashboard, Learning Path, Assessment, Business Tools, Certificates, Profile
    - _Requirements: 3.1, 3.2_

  - [x] 5.2 Implement active route highlighting
    - Use useLocation hook to detect current route
    - Apply active class to matching navigation item
    - _Requirements: 3.4_

  - [x] 5.3 Add responsive behavior
    - Implement mobile detection using media queries
    - Auto-collapse sidebar on mobile (< 768px)
    - Add hamburger menu toggle button
    - _Requirements: 3.5, 6.2_

  - [x] 5.4 Style the sidebar component
    - Create DashboardSidebar.css file
    - Implement fixed positioning on left side
    - Add smooth transitions for collapse/expand
    - Ensure proper z-index layering
    - _Requirements: 3.1, 3.6_

- [ ]* 5.5 Write unit tests for DashboardSidebar
  - Test rendering of all navigation items
  - Test active route highlighting
  - Test collapse/expand functionality
  - Test mobile responsive behavior
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 6. Integrate sidebar into Dashboard page
  - Import DashboardSidebar component
  - Update Dashboard layout to accommodate sidebar
  - Adjust content area width to account for sidebar
  - Ensure proper spacing and alignment
  - _Requirements: 3.1, 3.6_

- [ ]* 6.1 Write integration tests for Dashboard with sidebar
  - Test sidebar appears after login
  - Test navigation between pages
  - Test layout adjustments
  - _Requirements: 3.1, 3.2, 3.6_

- [x] 7. Checkpoint - Test dashboard navigation
  - Verify sidebar appears on dashboard
  - Test all navigation links
  - Verify active state highlighting
  - Test mobile responsive behavior
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Manrope font (Updated from SF Pro)
  - [x] 8.1 Create fonts.css file with Manrope from Google Fonts
    - Import Manrope font family from Google Fonts CDN
    - Include weights: 400, 500, 600, 700, 800
    - Use font-display: swap for performance
    - Add fallback to system fonts
    - Implement improved typography with better line-height (1.6-1.7)
    - Increase body text weight from 400 to 500 for better readability
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
    - **Status**: ✅ COMPLETE

  - [x] 8.2 Apply Manrope to dashboard components
    - Update App.css with font-family declarations
    - Apply to dashboard-container, sidebar, and content areas
    - Set appropriate font weights: headings (600), body (500), buttons (500)
    - Keep headings clean (not over-bold)
    - Add responsive typography improvements
    - _Requirements: 4.1, 4.5_
    - **Status**: ✅ COMPLETE

  - [x] 8.3 Import fonts.css in App.js
    - Add import statement for fonts.css
    - Ensure fonts load before dashboard renders
    - _Requirements: 4.1, 4.3_
    - **Status**: ✅ COMPLETE (already imported)

- [ ]* 8.4 Write tests for font application
  - Test font-family includes SF Pro Display
  - Test fallback fonts are present
  - Test font weights are correctly applied
  - _Requirements: 4.1, 4.2, 4.4, 4.5_

- [x] 9. Ensure mobile responsiveness
  - [x] 9.1 Test and adjust ChatWidget on mobile
    - Verify widget size adjusts for mobile screens
    - Ensure input remains visible with keyboard
    - Test touch target sizes (minimum 44x44px)
    - _Requirements: 6.1, 6.3, 6.4_

  - [x] 9.2 Test and adjust sidebar on mobile
    - Verify sidebar collapses into hamburger menu
    - Test touch interactions
    - Ensure smooth animations
    - _Requirements: 6.2, 6.3_

  - [x] 9.3 Test dashboard layout on mobile
    - Verify content area adjusts properly
    - Test font readability on small screens
    - Ensure all interactive elements are accessible
    - _Requirements: 6.5_

- [ ]* 9.4 Write responsive design tests
  - Test ChatWidget at various viewport sizes
  - Test sidebar at various viewport sizes
  - Test touch target sizes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 10. Add error handling and logging
  - [x] 10.1 Implement chatbot error handling
    - Add graceful error messages for AI service failures
    - Handle rate limit exceeded errors
    - Implement network error detection
    - _Requirements: 2.4_

  - [x] 10.2 Add logging for monitoring
    - Log chatbot interactions (auth vs unauth)
    - Log rate limit hits
    - Log font loading success/failure
    - Log sidebar interactions
    - _Requirements: 5.5_

- [x] 11. Final checkpoint - End-to-end testing
  - Test complete chatbot flow (unauthenticated and authenticated)
  - Test complete dashboard navigation flow
  - Test responsive behavior across all breakpoints
  - Verify Manrope font loads correctly
  - Test error scenarios
  - Verify all accessibility requirements
  - Ensure all tests pass, ask the user if questions arise.
  - **Status**: ✅ COMPLETE

- [x] 12. Fix dashboard header overlap issue (NEW)
  - [x] 12.1 Update Dashboard.js header layout
    - Replace rigid flexbox with responsive flex-column/flex-md-row
    - Add gap-3 for proper spacing
    - Implement fluid typography with clamp() for responsive sizing
    - Ensure proper wrapping on mobile devices
    - _Requirements: 6.1, 6.5_
    - **Status**: ✅ COMPLETE

  - [x] 12.2 Add responsive CSS improvements
    - Add media queries for mobile (320px+) and tablet (768-991px)
    - Implement responsive font sizing
    - Add word-wrap and overflow-wrap for long text
    - Ensure comfortable spacing at all breakpoints
    - _Requirements: 6.1, 6.2, 6.5_
    - **Status**: ✅ COMPLETE

- [x] 13. Code quality improvements (NEW)
  - [x] 13.1 Fix deprecated onKeyPress in ChatWidget
    - Replace onKeyPress with onKeyDown
    - Update handler function name for consistency
    - _Requirements: 5.3_
    - **Status**: ✅ COMPLETE

  - [x] 13.2 Create chatbot diagnostic tool
    - Create diagnoseChatbot.js script
    - Verify environment variables
    - Test Gemini API connectivity
    - Test streaming functionality
    - Provide actionable troubleshooting steps
    - _Requirements: 2.4, 5.5_
    - **Status**: ✅ COMPLETE

- [x] 14. Documentation (NEW)
  - [x] 14.1 Create comprehensive verification guide
    - Document all changes made
    - Provide testing checklist
    - Include troubleshooting guide for chatbot
    - Add deployment verification steps
    - _Requirements: All_
    - **Status**: ✅ COMPLETE (FIXES_VERIFICATION.md)

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Priority order: Chatbot fix → Sidebar → Typography
- All changes should maintain backward compatibility
- Focus on user experience and accessibility throughout
