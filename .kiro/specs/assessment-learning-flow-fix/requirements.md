# Requirements Document

## Introduction

This specification addresses two critical issues in the SkillBridge254 platform:
1. After completing the skills assessment, the learning path is created but users are not automatically directed to start learning
2. Images from Unsplash on the landing page and throughout the platform should exclusively feature Black/African people to reflect the target demographic of Kiharu Constituency, Kenya

The platform is part of academic research (MIT/2025/42733) focused on digital skills training for economic empowerment of youth in Kiharu Constituency.

## Glossary

- **Assessment_System**: The AI-powered skills assessment component that evaluates user competencies
- **Learning_Path**: A personalized sequence of training modules generated based on assessment results
- **Image_Service**: The backend service that fetches and caches images from Unsplash API
- **Success_Story_Image**: Component displaying portrait images for testimonials
- **User_Context**: React context managing user state including skills profile and learning path
- **Navigation_System**: The routing and navigation components that direct users between pages

## Requirements

### Requirement 1: Post-Assessment Navigation

**User Story:** As a learner who has completed the skills assessment, I want to be automatically guided to start my personalized learning path, so that I can immediately begin improving my digital skills.

#### Acceptance Criteria

1. WHEN a user completes the skills assessment THEN the Assessment_System SHALL display a prominent "Start Learning Now" button that navigates to the learning path page
2. WHEN a user clicks "Start Learning Now" after assessment completion THEN the Navigation_System SHALL redirect the user to the /learning route with their personalized modules displayed
3. WHEN the learning path page loads after assessment THEN the Learning_Path SHALL display the first recommended module prominently with a "Begin" or "Start" call-to-action
4. IF the learning path is empty after assessment THEN the Assessment_System SHALL display an error message and offer to retake the assessment
5. WHEN assessment results are saved THEN the User_Context SHALL persist the learning path to both localStorage and the backend API

### Requirement 2: Auto-Start First Module Option

**User Story:** As a learner eager to begin, I want the option to automatically start my first recommended module after assessment, so that I can begin learning without additional clicks.

#### Acceptance Criteria

1. WHEN assessment is complete THEN the Assessment_System SHALL display an "Auto-Start First Module" option alongside the standard navigation buttons
2. WHEN a user selects auto-start THEN the Navigation_System SHALL redirect directly to the first module in the learning path with the module modal open
3. WHEN auto-starting a module THEN the Learning_Path SHALL track that the module was started immediately after assessment

### Requirement 3: African/Black People Only Images

**User Story:** As a platform serving Kiharu Constituency youth, I want all images to feature Black/African people, so that learners see themselves represented in the platform.

#### Acceptance Criteria

1. WHEN the Image_Service fetches images from Unsplash THEN it SHALL include search terms that filter for African or Black people
2. WHEN fetching hero section images THEN the Image_Service SHALL use queries like "african professional", "black entrepreneur", "kenyan business"
3. WHEN fetching success story portraits THEN the Success_Story_Image component SHALL use curated URLs of Black/African individuals only
4. WHEN an image fails to load THEN the Image_Service SHALL fall back to pre-approved images of Black/African people
5. THE Image_Service SHALL NOT display images of non-Black individuals in any user-facing context

### Requirement 4: Curated Image Library

**User Story:** As a platform administrator, I want a curated library of approved images featuring Black/African people, so that the platform maintains consistent and appropriate representation.

#### Acceptance Criteria

1. THE Image_Service SHALL maintain a fallback library of at least 10 curated images per category featuring Black/African people
2. WHEN Unsplash API is unavailable THEN the Image_Service SHALL serve images from the curated fallback library
3. THE curated library SHALL include categories for: hero images, success stories (male), success stories (female), learning/education, business/entrepreneurship
4. WHEN displaying benefit section images THEN the Home page SHALL use curated URLs featuring Black/African professionals

### Requirement 5: Learning Path Persistence and Sync

**User Story:** As a learner, I want my learning path to be reliably saved and synchronized, so that I can continue learning across sessions and devices.

#### Acceptance Criteria

1. WHEN a learning path is generated THEN the User_Context SHALL save it to localStorage immediately
2. WHEN the user is authenticated and online THEN the User_Context SHALL sync the learning path to the backend API
3. WHEN the learning page loads THEN it SHALL first check localStorage for cached learning path before making API calls
4. IF localStorage has a learning path but API returns empty THEN the Learning_Path SHALL use the localStorage version and attempt to sync it to the backend

### Requirement 6: Certificate Generation Fix

**User Story:** As a learner who has completed a module, I want to receive my certificate automatically, so that I can prove my achievement.

#### Acceptance Criteria

1. WHEN a user completes a module THEN the Learning_Path SHALL update the progress status to "completed" in the backend
2. WHEN updating progress to completed THEN the Learning_Path SHALL include the score field in the API request
3. WHEN the certificate service checks for completion THEN it SHALL find the progress record with status "completed"
4. IF certificate generation fails due to "Module not completed" error THEN the Learning_Path SHALL first update the progress status and retry certificate generation
5. WHEN a certificate is successfully generated THEN the Certificate_System SHALL display the certificate details in a success modal
6. WHEN certificate generation fails THEN the Certificate_System SHALL display a user-friendly error message with retry option

### Requirement 7: Progress Status Synchronization

**User Story:** As a learner, I want my module completion status to be accurately tracked, so that certificates can be generated correctly.

#### Acceptance Criteria

1. WHEN a user clicks "Complete Course" THEN the Learning_Path SHALL send a progress update with status "completed" to the backend
2. WHEN updating progress THEN the API request SHALL include: status, progress percentage, score, and completedAt timestamp
3. THE Progress model SHALL store the completion status as "completed" when a module is finished
4. WHEN the certificate service queries progress THEN it SHALL find records with status "completed" for certificate eligibility
