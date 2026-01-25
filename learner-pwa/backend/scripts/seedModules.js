require('dotenv').config();
const mongoose = require('mongoose');
const Module = require('../models/Module');

const modules = [

    {
        moduleId: 'bd_001',
        title: 'Mobile Phone Basics',
        description: 'Master essential smartphone operations including calls, messages, and basic navigation for everyday use',
        category: 'basic_digital',
        difficulty: 1,
        priority: 10,
        estimatedTime: 45,
        content: {
            youtubeId: 'pWPO_1y_Fk8',
            videoUrl: 'https://www.youtube.com/watch?v=pWPO_1y_Fk8',
            instructor: 'Techboomers',
            materials: [
                {
                    title: 'Smartphone Basics Guide (PDF)',
                    type: 'pdf',
                    url: 'https://edu.gcfglobal.org/en/smartphone-basics/',
                    size: 2.5
                },
                {
                    title: 'Android Beginner\'s Manual',
                    type: 'pdf',
                    url: 'https://static.googleusercontent.com/media/www.android.com/en//static/2011/images/android_4.0/Android_4.0_User_Guide.pdf',
                    size: 10
                }
            ],
            textContent: `
# Mobile Phone Basics - Complete Guide

## Introduction
Welcome to the world of smartphones! This course will teach you everything you need to know to confidently use your mobile phone for daily tasks.

## Lesson 1: Understanding Your Phone

### Parts of a Smartphone
- **Screen (Display)**: The main interface where you see everything
- **Power Button**: Usually on the side, used to turn on/off or lock your phone
- **Volume Buttons**: Control sound levels
- **Home Button/Gesture**: Returns you to the main screen
- **Camera**: Front and back cameras for photos and videos
- **Charging Port**: Where you plug in the charger

### Turning Your Phone On and Off
1. **To Turn On**: Press and hold the power button for 2-3 seconds
2. **To Lock**: Press the power button once
3. **To Unlock**: Press power button and swipe up or enter PIN/pattern
4. **To Turn Off**: Press and hold power button, then select "Power Off"

## Lesson 2: Making and Receiving Calls

### Making a Call
1. Open the Phone app (usually green icon with phone symbol)
2. Tap the keypad icon
3. Enter the phone number (include country code if needed)
4. Press the green call button
5. To end call, press the red button

### Receiving a Call
1. When phone rings, you'll see caller information
2. Swipe or tap the green button to answer
3. Swipe or tap the red button to decline
4. Use volume buttons to adjust call volume

### Managing Contacts
1. Open Contacts app
2. Tap "+" to add new contact
3. Enter name, phone number, and other details
4. Save the contact
5. To call a contact, tap their name and select "Call"

## Lesson 3: Text Messaging (SMS)

### Sending a Text Message
1. Open Messages app
2. Tap the compose icon (usually a pencil or "+" symbol)
3. Enter recipient's phone number or select from contacts
4. Type your message in the text box
5. Tap send button (usually an arrow or paper plane)

### Reading Messages
1. Open Messages app
2. Tap on a conversation to read messages
3. Scroll up to see older messages
4. Tap back to return to message list

## Lesson 4: Basic Phone Settings

### Adjusting Volume
- Use volume buttons on side of phone
- Or go to Settings > Sound > Volume
- Adjust ringer, media, and alarm volumes separately

### Connecting to Wi-Fi
1. Go to Settings
2. Tap Wi-Fi
3. Turn Wi-Fi on
4. Select your network from the list
5. Enter password if required
6. Tap Connect

### Managing Battery
- Check battery level in status bar (top of screen)
- Enable Battery Saver mode in Settings
- Close unused apps to save battery
- Reduce screen brightness
- Turn off Wi-Fi/Bluetooth when not needed

## Lesson 5: Installing and Using Apps

### Finding Apps
1. Open Play Store (Android) or App Store (iPhone)
2. Tap search icon
3. Type app name
4. Tap the app from results

### Installing Apps
1. Tap "Install" or "Get"
2. Enter password if prompted
3. Wait for download and installation
4. Tap "Open" to launch app

### Organizing Apps
- Long-press an app icon to move it
- Drag apps to create folders
- Swipe left/right to see different home screens
- Remove apps by dragging to "Uninstall" or "Remove"

## Practice Exercises

1. **Exercise 1**: Make a call to a family member
2. **Exercise 2**: Send a text message to a friend
3. **Exercise 3**: Add 3 new contacts to your phone
4. **Exercise 4**: Connect to a Wi-Fi network
5. **Exercise 5**: Install WhatsApp or another messaging app

## Safety Tips

- Never share your PIN or password
- Lock your phone when not in use
- Be careful with unknown numbers
- Don't click suspicious links in messages
- Keep your phone updated
- Back up important contacts and photos

## Common Problems and Solutions

**Problem**: Phone won't turn on
**Solution**: Charge for 30 minutes, then try again

**Problem**: Can't hear caller
**Solution**: Check volume, remove any covers from speaker

**Problem**: Phone is slow
**Solution**: Close unused apps, restart phone, clear cache

**Problem**: Can't connect to Wi-Fi
**Solution**: Turn Wi-Fi off and on, forget network and reconnect

## Next Steps
Once you're comfortable with these basics, you're ready to explore:
- Internet browsing
- Email
- Social media
- Mobile banking
- Photography and videos

Remember: Practice makes perfect! Don't be afraid to explore your phone.
            `
        },
        learningObjectives: [
            'Navigate mobile phone interface confidently',
            'Make and receive calls effectively',
            'Send and manage text messages',
            'Adjust phone settings and preferences',
            'Install and organize apps',
            'Manage contacts and phone book',
            'Understand basic phone security'
        ],
        skills: ['mobile_navigation', 'basic_communication', 'app_management'],
        offlineAvailable: true
    },
    {
        moduleId: 'bd_002',
        title: 'Internet Basics & Safety',
        description: 'Learn to browse the internet safely, search for information, and protect yourself from online threats',
        category: 'basic_digital',
        difficulty: 1,
        priority: 9,
        estimatedTime: 50,
        content: {
            youtubeId: 'y2Khx8hZ_kQ',
            videoUrl: 'https://www.youtube.com/watch?v=y2Khx8hZ_kQ',
            instructor: 'GCFLearnFree.org',
            materials: [
                {
                    title: 'Internet Safety Cheat Sheet',
                    type: 'pdf',
                    url: 'https://www.cisa.gov/sites/default/files/publications/NCSAM_101_Cheat_Sheet.pdf',
                    size: 1.2
                },
                {
                    title: 'Online Safety Handbook',
                    type: 'pdf',
                    url: 'https://www.safety.google/intl/en/static/pdf/safety_handbook.pdf',
                    size: 5.4
                }
            ],
            textContent: `
# Internet Basics & Online Safety

## Introduction
The internet is a powerful tool for learning, business, and communication. This course teaches you how to use it safely and effectively.

## Lesson 1: What is the Internet?

### Understanding the Internet
- **The Internet**: A global network connecting millions of computers
- **The Web**: Websites and pages you can visit
- **Browser**: Software to access websites (Chrome, Firefox, Safari)
- **URL/Web Address**: The address of a website (e.g., www.google.com)

### How to Connect to the Internet
1. **Wi-Fi**: Wireless connection at home, cafes, or public places
2. **Mobile Data**: Using your phone's cellular connection
3. **Check Connection**: Look for Wi-Fi or signal bars at top of screen

## Lesson 2: Using a Web Browser

### Opening a Browser
- Tap the browser icon (Chrome, Safari, Firefox)
- You'll see a search bar or homepage

### Searching for Information
1. Tap the search bar
2. Type what you're looking for
3. Press Enter or Search button
4. Tap on results to visit websites

### Popular Search Engines
- **Google**: www.google.com - Most popular
- **Bing**: www.bing.com
- **DuckDuckGo**: www.duckduckgo.com - Privacy-focused

### Navigating Websites
- **Tap links** to go to new pages
- **Back button** (←) to return to previous page
- **Home button** to return to homepage
- **Refresh** to reload the page
- **Bookmarks** to save favorite sites

## Lesson 3: Online Safety & Security

### Recognizing Scams and Threats

#### Common Online Scams
1. **Phishing**: Fake emails/messages asking for passwords
2. **Prize Scams**: "You've won!" messages asking for money
3. **Fake Websites**: Sites that look real but steal information
4. **Romance Scams**: Fake relationships asking for money

#### Warning Signs
- Urgent messages demanding immediate action
- Requests for passwords or PIN numbers
- Too-good-to-be-true offers
- Poor grammar and spelling
- Suspicious email addresses
- Requests for money or gift cards

### Protecting Your Personal Information

#### Never Share Online:
- Passwords or PINs
- ID numbers (National ID, Passport)
- Bank account details
- Credit card numbers
- Home address (unless necessary)
- Phone number to strangers

#### Safe Sharing Practices:
- Only share on secure websites (look for padlock icon)
- Use strong, unique passwords
- Enable two-factor authentication
- Log out after using shared computers
- Don't save passwords on public devices

## Lesson 4: Creating Strong Passwords

### Password Best Practices
- **Length**: At least 8 characters (longer is better)
- **Mix**: Use uppercase, lowercase, numbers, symbols
- **Unique**: Different password for each account
- **Avoid**: Names, birthdays, common words

### Example Strong Passwords
- Bad: password123, john1990, 12345678
- Good: M@r1b0!2024, Tr@v3l#K3ny@, B!zN3s$2024

### Password Management
- Write passwords in a secure notebook
- Use a password manager app
- Never share passwords
- Change passwords if account is compromised

## Lesson 5: Safe Browsing Habits

### Before Clicking Links
1. Hover over link to see actual URL
2. Check if URL matches the claimed website
3. Look for "https://" and padlock icon
4. Be suspicious of shortened URLs from unknown sources

### Safe Download Practices
- Only download from trusted sources
- Check file type before opening
- Scan downloads with antivirus if available
- Avoid downloading from pop-ups

### Social Media Safety
- Adjust privacy settings
- Think before posting
- Don't accept friend requests from strangers
- Report suspicious accounts
- Be careful with location sharing

## Lesson 6: Using Search Effectively

### Search Tips
1. **Be Specific**: "how to start small business in Kenya" vs "business"
2. **Use Quotes**: "exact phrase" for exact matches
3. **Exclude Words**: use minus sign (business -online)
4. **Site Search**: site:wikipedia.org [your search]

### Evaluating Search Results
- Check website credibility
- Look for recent dates
- Cross-reference multiple sources
- Prefer official or educational sites (.gov, .edu)

## Lesson 7: Common Internet Services

### Email
- Send and receive messages
- Attach files and photos
- Organize with folders
- Popular: Gmail, Yahoo, Outlook

### Social Media
- Connect with friends and family
- Share updates and photos
- Popular: Facebook, WhatsApp, Instagram, Twitter

### Online Shopping
- Buy products online
- Compare prices
- Read reviews
- Track deliveries

### Online Banking
- Check account balance
- Transfer money
- Pay bills
- M-Pesa, bank apps

## Practice Exercises

1. **Exercise 1**: Search for "weather in Nairobi" and find today's forecast
2. **Exercise 2**: Create a strong password for a practice account
3. **Exercise 3**: Identify 3 warning signs in a suspicious email
4. **Exercise 4**: Bookmark 3 useful websites
5. **Exercise 5**: Check if a website is secure (look for padlock)

## Safety Checklist

✓ Use strong, unique passwords
✓ Never share personal information with strangers
✓ Check for https:// and padlock before entering data
✓ Be skeptical of too-good-to-be-true offers
✓ Keep software and apps updated
✓ Use secure Wi-Fi networks
✓ Log out of accounts on shared devices
✓ Report suspicious activity

## Common Problems and Solutions

**Problem**: Website won't load
**Solution**: Check internet connection, try refreshing, clear browser cache

**Problem**: Forgot password
**Solution**: Use "Forgot Password" link, verify identity, create new password

**Problem**: Pop-ups everywhere
**Solution**: Enable pop-up blocker in browser settings

**Problem**: Slow internet
**Solution**: Close unused tabs, disconnect other devices, restart router

## Red Flags - When to Be Suspicious

🚩 Unexpected emails asking for passwords
🚩 Messages with urgent threats or deadlines
🚩 Requests for money from "friends" or "family"
🚩 Websites with many spelling errors
🚩 Offers that seem too good to be true
🚩 Requests to click links in unsolicited messages

## Next Steps
After mastering internet basics, explore:
- Email communication
- Online shopping
- Social media for business
- Online learning platforms
- Digital banking

Remember: When in doubt, don't click! Ask someone you trust for help.
            `
        },
        learningObjectives: [
            'Understand how the internet works',
            'Browse websites safely and effectively',
            'Recognize and avoid online scams',
            'Protect personal information online',
            'Create strong passwords',
            'Use search engines efficiently',
            'Practice safe online habits'
        ],
        skills: ['internet_browsing', 'online_safety', 'information_literacy'],
        offlineAvailable: true
    },
    {
        moduleId: 'bd_003',
        title: 'Digital Communication & Email',
        description: 'Master email, WhatsApp, and professional digital communication for business and personal use',
        category: 'basic_digital',
        difficulty: 2,
        priority: 8,
        estimatedTime: 55,
        content: {
            youtubeId: 'AEQOK_g09Qs',
            videoUrl: 'https://www.youtube.com/watch?v=AEQOK_g09Qs',
            instructor: 'Technology for Teachers and Students',
            textContent: `
# Digital Communication & Email Mastery

## Introduction
Email and digital messaging are essential for modern business and personal communication. Learn to communicate professionally and effectively online.

## Lesson 1: Creating an Email Account

### Choosing an Email Provider
- **Gmail** (Google): Most popular, 15GB free storage
- **Yahoo Mail**: Easy to use, good spam protection
- **Outlook** (Microsoft): Professional, integrates with Office

### Creating a Gmail Account
1. Go to www.gmail.com
2. Click "Create account"
3. Fill in your information:
   - First and last name
   - Desired email address (username@gmail.com)
   - Strong password
   - Phone number (for security)
   - Recovery email (optional)
4. Verify phone number
5. Accept terms and conditions
6. Your email is ready!

### Choosing a Professional Email Address
**Good Examples:**
- john.kamau@gmail.com
- marywanjiku.business@gmail.com
- techsolutions.ke@gmail.com

**Avoid:**
- coolboy123@gmail.com
- sexykitten@gmail.com
- ihatemondays@gmail.com

## Lesson 2: Email Basics

### Understanding Email Interface
- **Inbox**: Where new emails arrive
- **Sent**: Emails you've sent
- **Drafts**: Unfinished emails
- **Spam**: Suspicious or unwanted emails
- **Trash**: Deleted emails
- **Compose**: Button to write new email

### Sending an Email
1. Click "Compose" or "+" button
2. **To**: Enter recipient's email address
3. **Subject**: Brief description of email content
4. **Body**: Your message
5. Click "Send"

### Email Etiquette - Subject Lines
**Good Subject Lines:**
- "Meeting Request: Project Discussion"
- "Invoice #1234 - Payment Due"
- "Job Application: Marketing Position"

**Bad Subject Lines:**
- "Hi"
- "URGENT!!!"
- "Read this now"
- (No subject)

## Lesson 3: Professional Email Writing

### Email Structure

**1. Greeting**
- Formal: "Dear Mr. Kamau," or "Dear Sir/Madam,"
- Semi-formal: "Hello John," or "Hi Mary,"
- Casual: "Hey!" (only for friends)

**2. Opening**
- "I hope this email finds you well."
- "Thank you for your email regarding..."
- "I am writing to inquire about..."

**3. Body**
- Keep paragraphs short
- One main idea per paragraph
- Use bullet points for lists
- Be clear and concise

**4. Closing**
- "Thank you for your time."
- "I look forward to hearing from you."
- "Please let me know if you need any clarification."

**5. Sign-off**
- Formal: "Sincerely," "Best regards," "Respectfully,"
- Semi-formal: "Best," "Thanks," "Regards,"
- Include your full name and contact information

### Sample Professional Email


~~~
Subject: Business Partnership Inquiry

Dear Mr.Ochieng,


            I hope this email finds you well.

I am writing to express my interest in exploring a potential business partnership between our companies.I believe our services complement each other well and could benefit both our customer bases.

Would you be available for a brief call next week to discuss this opportunity ? I am flexible with timing and happy to work around your schedule.

Thank you for considering this proposal.I look forward to hearing from you.

Best regards,

            Jane Wanjiru
Managing Director
ABC Solutions Ltd
Phone: +254 712 345 678
Email: jane.wanjiru@abcsolutions.co.ke
        ~~~


## Lesson 4: Email Management

### Organizing Your Inbox

** Create Folders/ Labels:**
    - Work
    - Personal
    - Bills
    - Important
    - Follow - up

    ** Use Stars / Flags:**
    - Mark important emails
    - Create to -do lists
        - Set reminders

    ** Archive vs Delete:**
- ** Archive **: Keep for reference, remove from inbox
    - ** Delete **: Permanently remove(use for spam)

### Managing Email Overload
1. ** Unsubscribe ** from unwanted newsletters
2. ** Set filters ** to auto - organize emails
3. ** Check email ** at specific times(not constantly)
4. ** Respond quickly ** to urgent emails
5. ** Archive ** emails you've dealt with

## Lesson 5: Email Attachments

### Sending Attachments
1. Click attachment icon(📎)
2. Select file from your device
3. Wait for upload to complete
4. Add message and send

### Attachment Best Practices
    - ** File Size **: Keep under 25MB(use cloud links for larger files)
- ** File Names **: Use descriptive names(Invoice_Jan2024.pdf)
    - ** Virus Check **: Scan files before sending
        - ** Mention in Email **: "Please find attached..."

### Receiving Attachments
    - ** Preview ** before downloading
        - ** Scan ** for viruses
            - ** Save ** to appropriate folder
    - ** Be cautious ** of unexpected attachments

## Lesson 6: WhatsApp for Business

### Setting Up WhatsApp
1. Download WhatsApp from Play Store / App Store
2. Install and open
3. Enter phone number
4. Verify with SMS code
5. Set up profile(name, photo)

### WhatsApp Features
    - ** Text Messages **: Quick communication
        - ** Voice Messages **: Speak instead of type
            - ** Voice / Video Calls **: Free calls over internet
                - ** Groups **: Communicate with multiple people
                    - ** Status **: Share updates(disappear after 24 hours)
                        - ** Business Profile **: Show business hours, location, catalog

### WhatsApp Business Etiquette
    - Respond within 24 hours
        - Use professional language
            - Don't spam customers
                - Respect business hours
                    - Use status for announcements
                        - Create product catalogs
    - Set automated greetings

### WhatsApp for Customer Service
1. ** Quick Replies **: Save common responses
2. ** Labels **: Organize chats(New Customer, Pending, Paid)
3. ** Catalog **: Showcase products with prices
4. ** Broadcast Lists **: Send updates to multiple customers
5. ** Away Messages **: Auto - reply when unavailable

## Lesson 7: Other Communication Tools

### Telegram
    - Similar to WhatsApp
        - Better for large groups
            - More privacy features
                - File sharing up to 2GB

### Zoom / Google Meet
    - Video conferencing
        - Screen sharing
            - Virtual meetings
                - Webinars

### Slack / Microsoft Teams
    - Team collaboration
        - Project management
            - File sharing
                - Integration with other tools

## Practice Exercises

1. ** Exercise 1 **: Create a professional email account
2. ** Exercise 2 **: Write a business inquiry email
3. ** Exercise 3 **: Organize your inbox with folders
4. ** Exercise 4 **: Send an email with an attachment
5. ** Exercise 5 **: Set up WhatsApp Business profile

## Communication Do's and Don'ts

### DO:
✓ Proofread before sending
✓ Use clear subject lines
✓ Respond within 24 - 48 hours
✓ Be polite and professional
✓ Use proper grammar and spelling
✓ Keep messages concise
✓ Include contact information

### DON'T:
✗ Use all caps(IT LOOKS LIKE SHOUTING)
✗ Send emails when angry
✗ Forward chain emails
✗ Reply all unnecessarily
✗ Use too many emojis in business emails
✗ Send large attachments without warning
✗ Forget to check recipient address

## Common Email Mistakes to Avoid

1. ** Wrong Recipient **: Always double - check email addresses
2. ** Missing Attachment **: Mention attachment in email, then attach
3. ** Reply All **: Only use when everyone needs to see response
4. ** Unclear Subject **: Be specific about email content
5. ** Too Long **: Keep emails brief and to the point
6. ** No Signature **: Always include your contact information

## Security Tips

    - Never share passwords via email
        - Be suspicious of unexpected attachments
            - Verify sender before clicking links
                - Use two - factor authentication
                    - Log out on shared devices
                        - Don't auto-save passwords on public computers
                            - Report phishing emails

## Next Steps
After mastering digital communication:
- Learn video conferencing
    - Explore project management tools
        - Study social media for business
            - Practice professional networking online

Remember: Clear communication builds trust and professionalism!
            `
        },
        learningObjectives: [
            'Create and manage professional email accounts',
            'Write clear, professional emails',
            'Organize and manage inbox effectively',
            'Send and receive email attachments',
            'Use WhatsApp for business communication',
            'Practice proper digital communication etiquette',
            'Understand email security basics'
        ],
        skills: ['email_management', 'professional_communication', 'whatsapp_business'],
        offlineAvailable: true
    },
    {
        moduleId: 'ba_001',
        title: 'Digital Inventory Management',
        description: 'Track and manage business inventory digitally',
        category: 'business_automation',
        difficulty: 2,
        priority: 8,
        estimatedTime: 90,
        content: {
            youtubeId: 'B7wKi5yqXn0',
            videoUrl: 'https://www.youtube.com/watch?v=B7wKi5yqXn0',
            instructor: 'Inventory Management Pro',
            materials: [
                {
                    title: 'Introduction to Inventory Management (PDF)',
                    type: 'pdf',
                    url: 'https://www.netsuite.com/portal/assets/pdf/ds-inventory-management-101.pdf',
                    size: 1.8
                }
            ]
        },
        learningObjectives: [
            'Set up digital inventory system',
            'Track stock levels',
            'Generate inventory reports',
            'Manage reorder points'
        ],
        skills: ['inventory_tracking', 'data_management'],
        offlineAvailable: true
    },
    {
        moduleId: 'ba_002',
        title: 'Customer Relationship Management',
        description: 'Manage customer data and relationships',
        category: 'business_automation',
        difficulty: 2,
        priority: 7,
        estimatedTime: 120,
        content: {
            youtubeId: 'H_v66m9TqC4',
            videoUrl: 'https://www.youtube.com/watch?v=H_v66m9TqC4',
            instructor: 'Salesforce',
            materials: [
                {
                    title: 'CRM Best Practices eBook',
                    type: 'pdf',
                    url: 'https://www.salesforce.com/content/dam/web/en_us/www/documents/e-books/crm-handbook.pdf',
                    size: 4.5
                }
            ]
        },
        learningObjectives: [
            'Understand CRM concepts',
            'Manage customer database',
            'Track customer interactions',
            'Improve customer retention'
        ],
        skills: ['crm_management', 'customer_service'],
        offlineAvailable: true
    },
    {
        moduleId: 'ec_001',
        title: 'Online Store Setup',
        description: 'Create and manage online stores',
        category: 'e_commerce',
        difficulty: 2,
        priority: 7,
        estimatedTime: 120,
        content: {
            youtubeId: '7o0jQ_j4G-0',
            videoUrl: 'https://www.youtube.com/watch?v=7o0jQ_j4G-0',
            instructor: 'Shopify',
            materials: [
                {
                    title: 'E-commerce Getting Started Guide',
                    type: 'pdf',
                    url: 'https://cdn.shopify.com/static/shopify-ecommerce-guide.pdf',
                    size: 2.1
                }
            ]
        },
        learningObjectives: [
            'Choose e-commerce platform',
            'Set up online store',
            'Add products and pricing',
            'Configure payment methods'
        ],
        skills: ['ecommerce_setup', 'online_selling'],
        offlineAvailable: true
    },
    {
        moduleId: 'dm_001',
        title: 'Social Media Marketing',
        description: 'Leverage social media for business growth',
        category: 'digital_marketing',
        difficulty: 2,
        priority: 8,
        estimatedTime: 90,
        content: {
            youtubeId: 'Ka56J66g_Wk',
            videoUrl: 'https://www.youtube.com/watch?v=Ka56J66g_Wk',
            instructor: 'Neil Patel',
            materials: [
                {
                    title: 'Social Media Marketing Strategy Guide',
                    type: 'pdf',
                    url: 'https://cdn.hubspot.com/hub/53/file-13221814-pdf/docs/hubspot_social_media_marketing_guide.pdf',
                    size: 3.5
                }
            ]
        },
        learningObjectives: [
            'Create business social media profiles',
            'Develop content strategy',
            'Engage with customers online',
            'Measure social media ROI'
        ],
        skills: ['social_media', 'content_marketing'],
        offlineAvailable: true
    },
    {
        moduleId: 'fm_001',
        title: 'Mobile Money & Digital Payments',
        description: 'Master M-Pesa and digital payment systems',
        category: 'financial_management',
        difficulty: 1,
        priority: 9,
        estimatedTime: 60,
        content: {
            youtubeId: 'W1YfzF1f6rE',
            videoUrl: 'https://www.youtube.com/watch?v=W1YfzF1f6rE',
            instructor: 'Safaricom',
            materials: [
                {
                    title: 'M-Pesa User Guide',
                    type: 'pdf',
                    url: 'https://www.safaricom.co.ke/personal/m-pesa/getting-started',
                    size: 0.5
                }
            ]
        },
        learningObjectives: [
            'Use M-Pesa for transactions',
            'Understand digital payment security',
            'Accept mobile payments for business',
            'Track digital transactions'
        ],
        skills: ['mobile_money', 'digital_payments'],
        offlineAvailable: true
    },
    {
        moduleId: 'fm_002',
        title: 'Digital Bookkeeping',
        description: 'Track business finances digitally',
        category: 'financial_management',
        difficulty: 2,
        priority: 7,
        estimatedTime: 120,
        content: {
            youtubeId: '0Y_B5nJ6o1w',
            videoUrl: 'https://www.youtube.com/watch?v=0Y_B5nJ6o1w',
            instructor: 'QuickBooks',
            materials: [
                {
                    title: 'Small Business Bookkeeping Basics',
                    type: 'pdf',
                    url: 'https://www.freshbooks.com/wp-content/uploads/2021/03/Small-Business-Bookkeeping-Basics.pdf',
                    size: 1.2
                }
            ]
        },
        learningObjectives: [
            'Record income and expenses',
            'Generate financial reports',
            'Track business profitability',
            'Prepare for tax compliance'
        ],
        skills: ['bookkeeping', 'financial_reporting'],
        offlineAvailable: true
    }
];

async function seedModules() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing modules
        await Module.deleteMany({});
        console.log('Cleared existing modules');

        // Insert new modules
        await Module.insertMany(modules);
        console.log(`Seeded ${modules.length} modules successfully`);

        process.exit(0);
    } catch (error) {
        console.error('Error seeding modules:', error);
        process.exit(1);
    }
}

seedModules();
