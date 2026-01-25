# Design Document: Chatbot and Dashboard Enhancements

## Overview

This design addresses three critical enhancements to the learner PWA:
1. Making the AI chatbot widget accessible to all users regardless of authentication state
2. Adding a navigation sidebar to the dashboard for improved user experience
3. Implementing SF Pro font across the dashboard for modern, consistent typography

The chatbot widget currently only appears for authenticated users due to a conditional render check. We'll modify the component to support both authenticated and unauthenticated modes, with appropriate backend support for handling requests from both user types.

## Architecture

### Component Architecture

```
App.js
├── ChatWidget (Global - All Pages)
│   ├── Authentication-aware rendering
│   ├── Context-based messaging
│   └── Streaming response handling
│
└── Dashboard
    ├── DashboardSidebar (New Component)
    │   ├── Navigation links
    │   ├── Active state management
    │   └── Responsive collapse
    └── Dashboard Content
        └── SF Pro Typography
```

### Backend Architecture

```
Backend API
├── /api/v1/chatbot/message (Modified)
│   ├── Optional authentication
│   ├── Rate limiting by IP for unauthenticated
│   └── Context-aware responses
│
├── /api/v1/chatbot/message-public (New)
│   ├── No authentication required
│   ├── General information only
│   └── Stricter rate limiting
│
└── /api/v1/chatbot/health (Existing)
    └── Public health check
```

## Components and Interfaces

### 1. ChatWidget Component Modifications

**File:** `learner-pwa/src/components/ChatWidget.js`

**Changes:**
- Remove authentication gate (`if (!isAuthenticated) return null`)
- Add authentication state detection
- Implement different welcome messages for authenticated vs unauthenticated users
- Handle API calls with optional authentication token
- Add fallback for unauthenticated users

**Interface:**
```javascript
interface ChatWidgetProps {
  // No props needed - uses context
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isError?: boolean;
}

interface ChatState {
  isOpen: boolean;
  messages: ChatMessage[];
  inputMessage: string;
  isLoading: boolean;
  isTyping: boolean;
}
```

**Pseudocode:**
```
function ChatWidget():
  // Get authentication state from context
  isAuthenticated = useUser().isAuthenticated
  user = useUser().user
  
  // Always render the widget (remove authentication check)
  
  // Modify welcome message based on auth state
  if isOpen and messages.length == 0:
    if isAuthenticated:
      welcomeMessage = "Hello {user.name}! I'm your learning assistant..."
    else:
      welcomeMessage = "Hello! I can help you learn about our courses..."
    
    setMessages([welcomeMessage])
  
  // Modify message sending to handle both auth states
  function handleSendMessage():
    token = localStorage.getItem('token')
    endpoint = isAuthenticated ? '/chatbot/message' : '/chatbot/message-public'
    
    headers = {
      'Content-Type': 'application/json'
    }
    
    if token:
      headers['Authorization'] = `Bearer ${token}`
    
    response = fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        message: inputMessage,
        language: language,
        courseContext: isAuthenticated ? courseContext : null
      })
    })
    
    // Handle streaming response as before
```

### 2. Backend Chatbot Routes

**File:** `learner-pwa/backend/routes/chatbot.js`

**New Route:**
```javascript
/**
 * @route   POST /api/v1/chatbot/message-public
 * @desc    Send message to chatbot (public, no auth required)
 * @access  Public
 */
router.post('/message-public', rateLimitPublic, async (req, res) => {
  // Handle unauthenticated chatbot requests
  // Provide general information only
  // Apply stricter rate limiting
})
```

**Modified Route:**
```javascript
/**
 * @route   POST /api/v1/chatbot/message
 * @desc    Send message to chatbot (streaming)
 * @access  Public/Private (optional auth)
 */
router.post('/message', optionalAuth, rateLimit, async (req, res) => {
  // Handle both authenticated and unauthenticated requests
  // Provide personalized responses for authenticated users
  // Provide general responses for unauthenticated users
})
```

**Pseudocode:**
```
// New middleware for optional authentication
function optionalAuth(req, res, next):
  token = req.headers.authorization?.split(' ')[1]
  
  if token:
    try:
      decoded = jwt.verify(token, JWT_SECRET)
      req.user = await User.findById(decoded.id)
      req.isAuthenticated = true
    catch error:
      req.isAuthenticated = false
  else:
    req.isAuthenticated = false
  
  next()

// Public chatbot endpoint
POST /chatbot/message-public:
  message = req.body.message
  language = req.body.language || 'en'
  
  // Validate message
  if not message or message.trim().length == 0:
    return error(400, 'Message is required')
  
  // Create public context
  publicContext = {
    userName: 'Visitor',
    language: language,
    isPublic: true
  }
  
  // Generate response with public context
  response = await geminiService.generatePublicChatResponse(
    message,
    publicContext
  )
  
  // Stream response
  for chunk in response:
    res.write(`data: ${JSON.stringify({ chunk })}\n\n`)
  
  res.write('data: [DONE]\n\n')
  res.end()
```

### 3. Gemini Service Modifications

**File:** `learner-pwa/backend/services/geminiService.js`

**New Method:**
```javascript
async generatePublicChatResponse(message, context) {
  // Generate responses for unauthenticated users
  // Focus on general information about:
  // - Available courses
  // - Platform features
  // - How to enroll
  // - General digital skills information
  // Do NOT provide personalized recommendations
}
```

**Pseudocode:**
```
function generatePublicChatResponse(message, context):
  systemPrompt = `
    You are a helpful learning assistant for a digital skills platform.
    The user is NOT logged in, so provide general information only.
    
    You can help with:
    - Information about available courses
    - Platform features and benefits
    - How to sign up and enroll
    - General digital skills questions
    - Navigation help
    
    Do NOT:
    - Provide personalized recommendations
    - Access user-specific data
    - Discuss progress or certificates
    
    Keep responses friendly, informative, and encourage sign-up.
  `
  
  userPrompt = `User message: ${message}`
  
  response = await gemini.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userPrompt }] }]
  })
  
  return response.text()
```

### 4. Dashboard Sidebar Component

**File:** `learner-pwa/src/components/DashboardSidebar.js` (New)

**Interface:**
```javascript
interface DashboardSidebarProps {
  activeRoute: string;
}

interface NavItem {
  path: string;
  icon: string;
  label: string;
  translationKey: string;
}
```

**Component Structure:**
```javascript
const DashboardSidebar = ({ activeRoute }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard', translationKey: 'nav.dashboard' },
    { path: '/learning', icon: '📚', label: 'Learning Path', translationKey: 'nav.learning' },
    { path: '/assessment', icon: '✅', label: 'Assessment', translationKey: 'nav.assessment' },
    { path: '/business-tools', icon: '💼', label: 'Business Tools', translationKey: 'nav.business' },
    { path: '/certificates', icon: '🎓', label: 'Certificates', translationKey: 'nav.certificates' },
    { path: '/profile', icon: '👤', label: 'Profile', translationKey: 'nav.profile' }
  ];
  
  return (
    <div className={`dashboard-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Sidebar content */}
    </div>
  );
};
```

**Pseudocode:**
```
function DashboardSidebar({ activeRoute }):
  isCollapsed = useState(false)
  isMobile = useMediaQuery('(max-width: 768px)')
  
  navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/learning', icon: '📚', label: 'Learning Path' },
    { path: '/assessment', icon: '✅', label: 'Assessment' },
    { path: '/business-tools', icon: '💼', label: 'Business Tools' },
    { path: '/certificates', icon: '🎓', label: 'Certificates' },
    { path: '/profile', icon: '👤', label: 'Profile' }
  ]
  
  // Auto-collapse on mobile
  useEffect(() => {
    if isMobile:
      setIsCollapsed(true)
  }, [isMobile])
  
  function handleNavigation(path):
    navigate(path)
    if isMobile:
      setIsCollapsed(true)
  
  return (
    <aside className="dashboard-sidebar">
      <button onClick={() => setIsCollapsed(!isCollapsed)}>
        {isCollapsed ? '☰' : '✕'}
      </button>
      
      <nav>
        for item in navItems:
          <NavLink
            to={item.path}
            className={activeRoute == item.path ? 'active' : ''}
            onClick={() => handleNavigation(item.path)}
          >
            <span className="icon">{item.icon}</span>
            {!isCollapsed && <span>{t(item.label)}</span>}
          </NavLink>
      </nav>
    </aside>
  )
```

### 5. Dashboard Layout Modifications

**File:** `learner-pwa/src/pages/Dashboard.js`

**Changes:**
- Import and include DashboardSidebar
- Adjust layout to accommodate sidebar
- Apply SF Pro font

**Pseudocode:**
```
function Dashboard():
  location = useLocation()
  
  return (
    <div className="dashboard-container">
      <DashboardSidebar activeRoute={location.pathname} />
      
      <div className="dashboard-content">
        {/* Existing dashboard content */}
      </div>
    </div>
  )
```

### 6. SF Pro Font Implementation

**File:** `learner-pwa/src/styles/fonts.css` (New)

**Font Loading:**
```css
/* SF Pro Font Family */
@font-face {
  font-family: 'SF Pro Display';
  src: local('SF Pro Display'),
       url('https://fonts.cdnfonts.com/s/59293/SFPRODISPLAYREGULAR.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SF Pro Display';
  src: local('SF Pro Display Medium'),
       url('https://fonts.cdnfonts.com/s/59293/SFPRODISPLAYMEDIUM.woff') format('woff');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SF Pro Display';
  src: local('SF Pro Display Semibold'),
       url('https://fonts.cdnfonts.com/s/59293/SFPRODISPLAYSEMIBOLDITALIC.woff') format('woff');
  font-weight: 600;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SF Pro Display';
  src: local('SF Pro Display Bold'),
       url('https://fonts.cdnfonts.com/s/59293/SFPRODISPLAYBOLD.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

**File:** `learner-pwa/src/App.css`

**Font Application:**
```css
/* Apply SF Pro to dashboard and related pages */
.dashboard-container,
.dashboard-sidebar,
.dashboard-content,
.profile-page,
.learning-path-page,
.business-tools-page {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
}

/* Specific font weights */
h1, h2, h3, h4, h5, h6 {
  font-weight: 600; /* Semibold */
}

.dashboard-sidebar nav a {
  font-weight: 500; /* Medium */
}

button, .btn {
  font-weight: 500; /* Medium */
}

p, span, div {
  font-weight: 400; /* Regular */
}

strong, b {
  font-weight: 700; /* Bold */
}
```

## Data Models

No new data models required. Existing models remain unchanged.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Chatbot Availability Invariant
*For any* page in the application and any authentication state (authenticated or unauthenticated), the ChatWidget component should render and be accessible to the user.

**Validates: Requirements 1.1, 1.4**

### Property 2: Authentication-Aware Response Property
*For any* chatbot message, if the user is authenticated, the response should include personalized context (user name, course progress), and if the user is unauthenticated, the response should contain only general information.

**Validates: Requirements 1.2, 1.3, 2.2, 2.3**

### Property 3: API Endpoint Accessibility
*For any* chatbot message request, the system should successfully process the request regardless of whether an authentication token is present, routing authenticated requests to the personalized endpoint and unauthenticated requests to the public endpoint.

**Validates: Requirements 2.1, 5.1, 5.2**

### Property 4: Rate Limiting Enforcement
*For any* series of chatbot requests from an unauthenticated user, if the request count exceeds the rate limit threshold within the time window, the system should reject subsequent requests with a 429 status code.

**Validates: Requirements 5.4**

### Property 5: Sidebar Navigation Consistency
*For any* authenticated user on the dashboard, the navigation sidebar should be visible and contain all required navigation links (Dashboard, Learning Path, Assessment, Business Tools, Certificates, Profile).

**Validates: Requirements 3.1, 3.2, 3.6**

### Property 6: Active Route Highlighting
*For any* navigation item in the sidebar, if the current route matches the navigation item's path, that item should be visually highlighted as active.

**Validates: Requirements 3.4**

### Property 7: Responsive Sidebar Behavior
*For any* viewport width less than 768px, the navigation sidebar should collapse into a hamburger menu, and for any viewport width greater than or equal to 768px, the sidebar should be expanded by default.

**Validates: Requirements 3.5, 6.2**

### Property 8: Font Loading Fallback
*For any* dashboard page load, if SF Pro font fails to load within the timeout period, the system should fall back to system fonts without blocking page rendering.

**Validates: Requirements 4.2, 4.3**

### Property 9: Font Application Consistency
*For any* text element within the dashboard container, the computed font-family should include 'SF Pro Display' as the first option in the font stack.

**Validates: Requirements 4.1, 4.5**

### Property 10: Mobile Touch Target Size
*For any* interactive element (buttons, navigation links, chat FAB) on mobile devices, the touch target size should be at least 44x44 pixels.

**Validates: Requirements 6.3**

## Error Handling

### Chatbot Errors

1. **AI Service Unavailable**
   - Display user-friendly error message
   - Suggest trying again later
   - Log error for monitoring

2. **Rate Limit Exceeded**
   - Return 429 status code
   - Include retry-after header
   - Display message: "Too many requests. Please wait before trying again."

3. **Invalid Message**
   - Return 400 status code
   - Display validation error
   - Clear input field

4. **Network Errors**
   - Detect offline state
   - Display offline indicator
   - Queue messages for retry when online

### Sidebar Errors

1. **Navigation Failure**
   - Catch navigation errors
   - Display toast notification
   - Log error for debugging

2. **Responsive Breakpoint Issues**
   - Use CSS media queries as fallback
   - Ensure sidebar remains functional

### Font Loading Errors

1. **Font Load Failure**
   - Automatic fallback to system fonts
   - No user-facing error
   - Log warning for monitoring

2. **CORS Issues**
   - Use local font files as backup
   - Implement font-display: swap

## Testing Strategy

### Unit Tests

**ChatWidget Component:**
- Test rendering for authenticated users
- Test rendering for unauthenticated users
- Test welcome message variations
- Test message sending with/without auth token
- Test error handling for API failures
- Test streaming response handling

**DashboardSidebar Component:**
- Test rendering of all navigation items
- Test active route highlighting
- Test collapse/expand functionality
- Test mobile responsive behavior
- Test navigation click handlers

**Backend Routes:**
- Test /chatbot/message-public endpoint
- Test optional authentication middleware
- Test rate limiting for public endpoint
- Test rate limiting for authenticated endpoint
- Test error responses

### Property-Based Tests

**Property 1: Chatbot Availability**
- Generate random authentication states
- Generate random page routes
- Verify ChatWidget renders in all cases

**Property 2: Authentication-Aware Responses**
- Generate random messages
- Generate random authentication states
- Verify response type matches authentication state

**Property 3: Rate Limiting**
- Generate random request sequences
- Verify rate limit enforcement
- Verify different limits for auth/unauth users

**Property 4: Sidebar Navigation**
- Generate random routes
- Verify correct active state highlighting
- Verify all navigation items present

**Property 5: Responsive Behavior**
- Generate random viewport widths
- Verify sidebar state matches breakpoint
- Verify touch target sizes on mobile

**Property 6: Font Application**
- Query random dashboard elements
- Verify font-family includes SF Pro
- Verify fallback fonts present

### Integration Tests

1. **End-to-End Chatbot Flow**
   - User opens chatbot
   - User sends message
   - System streams response
   - User receives complete answer

2. **Dashboard Navigation Flow**
   - User logs in
   - Dashboard loads with sidebar
   - User clicks navigation item
   - Correct page loads
   - Active state updates

3. **Responsive Layout Flow**
   - Load dashboard on desktop
   - Resize to mobile
   - Verify sidebar collapses
   - Verify chatbot adjusts
   - Verify fonts remain consistent

### Manual Testing Checklist

- [ ] Chatbot appears on home page (unauthenticated)
- [ ] Chatbot appears on all authenticated pages
- [ ] Chatbot provides general info when not logged in
- [ ] Chatbot provides personalized info when logged in
- [ ] Dashboard sidebar appears after login
- [ ] All navigation links work correctly
- [ ] Active route is highlighted
- [ ] Sidebar collapses on mobile
- [ ] SF Pro font loads on dashboard
- [ ] Font fallback works if SF Pro fails
- [ ] Touch targets are adequate on mobile
- [ ] Chatbot input remains visible with keyboard
- [ ] Rate limiting prevents spam
- [ ] Error messages are user-friendly

## Performance Considerations

1. **Font Loading**
   - Use font-display: swap to prevent FOIT (Flash of Invisible Text)
   - Preload critical font weights
   - Lazy load additional weights

2. **Chatbot Streaming**
   - Maintain existing streaming implementation
   - Optimize chunk size for smooth rendering
   - Implement request cancellation on component unmount

3. **Sidebar Rendering**
   - Use CSS transforms for smooth animations
   - Implement will-change for collapse/expand
   - Memoize navigation items

4. **Rate Limiting**
   - Use in-memory cache (Redis) for rate limit tracking
   - Implement sliding window algorithm
   - Clean up expired entries automatically

## Security Considerations

1. **Public Chatbot Endpoint**
   - Implement strict rate limiting (10 requests per minute per IP)
   - Validate and sanitize all input
   - Prevent prompt injection attacks
   - Log all public requests for monitoring

2. **Optional Authentication**
   - Verify JWT tokens properly
   - Handle expired tokens gracefully
   - Don't expose sensitive data in public responses

3. **CORS Configuration**
   - Allow font loading from CDN
   - Restrict API access to known origins
   - Implement proper CORS headers

## Deployment Considerations

1. **Feature Flags**
   - Enable public chatbot gradually
   - Monitor usage and errors
   - Rollback capability if issues arise

2. **Monitoring**
   - Track chatbot usage (auth vs unauth)
   - Monitor rate limit hits
   - Track font loading success rate
   - Monitor sidebar interaction metrics

3. **Rollout Plan**
   - Phase 1: Deploy backend changes
   - Phase 2: Deploy frontend chatbot changes
   - Phase 3: Deploy sidebar and font changes
   - Phase 4: Monitor and optimize

## Accessibility

1. **Chatbot**
   - Maintain ARIA labels
   - Ensure keyboard navigation works
   - Provide screen reader announcements for new messages

2. **Sidebar**
   - Use semantic HTML (nav, ul, li)
   - Implement ARIA current for active route
   - Ensure keyboard navigation
   - Provide skip navigation link

3. **Typography**
   - Maintain sufficient contrast ratios
   - Ensure text remains readable at all sizes
   - Support browser zoom up to 200%
