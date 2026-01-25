/**
 * Course Content Data
 *
 * This file contains all course content for learning modules.
 * It's structured for easy maintenance and updates.
 */

import { KIHARU_MODULES } from './kiharuContent.js';

export const courseContentMap = {
    // Kiharu Constituency Specific Modules
    ...KIHARU_MODULES,

    // Basic Digital Skills Modules
    'bd_001': {
        title: 'Mobile Phone Basics',
        lessons: [
            {
                title: 'Introduction to Mobile Phone Basics',
                content: 'Learn the fundamentals of using mobile phones, including basic operations and essential features.',
                duration: 30,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=Wy2FGPRFNuY',
                textContent: `
**What You'll Learn:**
• Understanding mobile phone hardware and components
• Basic phone operations and navigation
• Essential features and settings
• Power management and battery care
• Screen locking and basic security

**Key Takeaways:**
- Your mobile phone is a powerful tool for communication and productivity
- Proper setup ensures optimal performance
- Security features protect your personal information
- Regular maintenance keeps your device running smoothly
                `
            },
            {
                title: 'Smartphone Fundamentals Quiz',
                content: 'Test your knowledge of smartphone basics and essential features.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the main purpose of a smartphone?',
                        options: ['Only making calls', 'Communication, internet access, and apps', 'Just taking photos'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of these is NOT a common smartphone feature?',
                        options: ['Touch screen', 'Voice calls', 'Typewriter keyboard'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you do first when you get a new smartphone?',
                        options: ['Install games', 'Charge it and follow setup instructions', 'Throw away the box'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is it important to set a screen lock?',
                        options: ['To make the phone look cool', 'To prevent unauthorized access', 'To save battery power'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a smartphone app?',
                        options: ['A type of food', 'A software program you can download', 'A phone accessory'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Phone Communication Quiz',
                content: 'Test your understanding of phone calls and messaging.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'How do you make a phone call on a smartphone?',
                        options: ['Shake the phone', 'Open phone app and tap contact', 'Press the camera button'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What does SMS stand for?',
                        options: ['Super Mobile System', 'Short Message Service', 'Smart Messaging Software'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Where should you save important phone numbers?',
                        options: ['In your wallet', 'In the phone contacts app', 'On a piece of paper'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do if you receive a call from an unknown number?',
                        options: ['Always answer', 'Check who it is first, or let it go to voicemail', 'Hang up immediately'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Hands-On Practice',
                content: 'Now it\'s time to practice! Complete these exercises: 1) Make a call to a family member, 2) Send a text message, 3) Add 3 new contacts, 4) Install WhatsApp, 5) Connect to Wi-Fi.',
                duration: 20,
                type: 'practice'
            }
        ]
    },
    'bd_002': {
        title: 'Internet Basics & Safety',
        lessons: [
            {
                title: 'Introduction to Internet Basics & Safety',
                content: 'Learn the fundamentals of internet usage, safe browsing practices, and online security.',
                duration: 45,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M',
                textContent: `
**What You'll Learn:**
• Understanding the internet and how it works
• Safe browsing practices and security measures
• Identifying and avoiding online threats
• Using search engines effectively
• Protecting personal information online

**Key Takeaways:**
- The internet is a powerful tool for information and communication
- Safe browsing habits protect you from online threats
- Strong passwords and security practices are essential
- Be cautious with personal information sharing
- Regular security updates keep you protected
                `
            },
            {
                title: 'Internet Fundamentals Quiz',
                content: 'Test your knowledge of internet basics and online safety.',
                duration: 20,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the internet?',
                        options: ['A type of computer', 'A global network connecting computers worldwide', 'A social media platform'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which of these is a safe browsing practice?',
                        options: ['Clicking on every pop-up ad', 'Using the same password for all accounts', 'Checking for https:// in the URL'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What is phishing?',
                        options: ['A type of fish', 'Fraudulent attempts to obtain sensitive information', 'A web browser'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do if you receive a suspicious email asking for your password?',
                        options: ['Reply with your password', 'Click the link to verify', 'Delete it and report as spam'],
                        correctAnswer: 2
                    },
                    {
                        question: 'Why is it important to use strong passwords?',
                        options: ['To make logging in faster', 'To protect your accounts from hackers', 'To impress your friends'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Web Browsing Quiz',
                content: 'Test your understanding of web browsers and online navigation.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is a web browser?',
                        options: ['A type of spider', 'Software for accessing websites', 'A search engine'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What does the padlock icon in a browser address bar indicate?',
                        options: ['The site is locked', 'The connection is secure (HTTPS)', 'The site is popular'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you search for information on the internet?',
                        options: ['Ask your neighbor', 'Use a search engine like Google', 'Call a friend'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do before downloading a file from the internet?',
                        options: ['Download immediately', 'Check for viruses and ensure it\'s from a trusted source', 'Share the link with friends'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Safe Browsing Practice',
                content: 'Practice exercises: 1) Search for "weather in Nairobi", 2) Create a strong password, 3) Identify warning signs in suspicious emails, 4) Bookmark useful websites, 5) Check if a website is secure.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'bd_003': {
        title: 'Digital Communication & Email',
        lessons: [
            {
                title: 'Introduction to Digital Communication & Email',
                content: 'Learn the fundamentals of digital communication tools and professional email practices.',
                duration: 40,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_bd003',
                textContent: `
**What You'll Learn:**
• Understanding digital communication channels
• Professional email writing and etiquette
• Using messaging apps for business
• Managing digital communication tools
• Building effective communication habits

**Key Takeaways:**
- Clear communication is essential for business success
- Professional email etiquette builds credibility
- Different tools serve different communication needs
- Organization and follow-up are key to effective communication
- Digital literacy enhances professional relationships
                `
            },
            {
                title: 'Email Communication Quiz',
                content: 'Test your knowledge of professional email communication and digital etiquette.',
                duration: 20,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the most important part of a professional email?',
                        options: ['Fancy signature', 'Clear subject line', 'Colorful background'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How quickly should you respond to a business email?',
                        options: ['Within a week', 'Within 24-48 hours', 'Whenever you feel like it'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do before sending an important email?',
                        options: ['Add lots of emojis', 'Proofread carefully', 'Send it to everyone you know'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is it important to use proper email etiquette?',
                        options: ['To look professional', 'To build good business relationships', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What is NOT appropriate in a business email?',
                        options: ['Using all caps', 'Clear and concise language', 'Proper grammar'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                title: 'Digital Communication Quiz',
                content: 'Test your understanding of various digital communication tools and platforms.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is WhatsApp primarily used for?',
                        options: ['Video streaming', 'Instant messaging and calls', 'Online shopping'],
                        correctAnswer: 1
                    },
                    {
                        question: 'When should you use email instead of instant messaging?',
                        options: ['For quick questions', 'For formal business communication', 'For sharing photos'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a professional way to end an email?',
                        options: ['Bye', 'Best regards', 'See ya'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why should you organize your inbox?',
                        options: ['To look busy', 'To find emails quickly and stay organized', 'To impress your boss'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Email Practice',
                content: 'Practice: 1) Create a professional email account, 2) Write a business inquiry email, 3) Organize inbox with folders, 4) Send an email with attachment, 5) Set up WhatsApp Business profile.',
                duration: 20,
                type: 'practice'
            }
        ]
    },

    // Financial Management Modules
    'fm_001': {
        title: 'M-Pesa & Mobile Money',
        lessons: [
            {
                title: 'Introduction to M-Pesa & Mobile Money',
                content: 'Learn the fundamentals of mobile money services, focusing on M-Pesa operations and financial management.',
                duration: 35,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_fm001',
                textContent: `
**What You'll Learn:**
• Understanding mobile money services and M-Pesa
• Basic transactions: sending, receiving, and withdrawing money
• Security practices and PIN management
• Transaction fees and limits
• Integration with daily financial activities

**Key Takeaways:**
- Mobile money revolutionizes financial access
- Security is paramount in digital transactions
- Understanding fees helps manage costs
- Mobile money enables financial inclusion
- Regular monitoring prevents fraud
                `
            },
            {
                title: 'M-Pesa Fundamentals Quiz',
                content: 'Test your knowledge of M-Pesa services and basic operations.',
                duration: 20,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is M-Pesa?',
                        options: ['A type of phone', 'A mobile money service', 'A social media app'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you send money using M-Pesa?',
                        options: ['Dial *150*00#', 'Go to M-Pesa menu and select Send Money', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What is the maximum amount you can withdraw from an M-Pesa agent?',
                        options: ['KSh 10,000', 'KSh 50,000', 'KSh 100,000'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you pay bills using M-Pesa?',
                        options: ['Use Lipa Na M-Pesa option', 'Send money to the company', 'Call customer service'],
                        correctAnswer: 0
                    },
                    {
                        question: 'Why should you never share your M-Pesa PIN?',
                        options: ['It\'s private information', 'Someone might steal your money', 'Both A and B'],
                        correctAnswer: 2
                    }
                ]
            },
            {
                title: 'M-Pesa Security Quiz',
                content: 'Test your understanding of M-Pesa security and safe practices.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What should you do if you receive a wrong M-Pesa transaction?',
                        options: ['Accept it and keep the money', 'Reverse it immediately', 'Wait for the sender to ask for it back'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How often should you change your M-Pesa PIN?',
                        options: ['Never', 'Every few months', 'Only if you forget it'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a common M-Pesa scam?',
                        options: ['Prize winning messages', 'Bill payment confirmations', 'Balance notifications'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What should you do if you lose your phone?',
                        options: ['Wait for someone to return it', 'Contact Safaricom immediately to block your SIM', 'Buy a new phone'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'M-Pesa Practice',
                content: 'Practice: 1) Check M-Pesa balance, 2) Buy airtime, 3) Send money to family, 4) Pay an electricity bill, 5) Request M-Pesa statement.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'fm_002': {
        title: 'Digital Bookkeeping',
        lessons: [
            {
                title: 'Introduction to Digital Bookkeeping',
                content: 'Learn the basics of digital bookkeeping, financial record keeping, and business accounting principles.',
                duration: 40,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_fm002',
                textContent: `
**What You'll Learn:**
• Understanding bookkeeping and its importance
• Basic accounting principles and terminology
• Recording income and expenses digitally
• Financial reporting and analysis
• Using digital tools for bookkeeping

**Key Takeaways:**
- Accurate bookkeeping is essential for business success
- Digital tools simplify financial management
- Regular record-keeping enables better decisions
- Understanding financial statements reveals business health
- Compliance with regulations protects your business
                `
            },
            {
                title: 'Bookkeeping Fundamentals Quiz',
                content: 'Test your knowledge of basic accounting principles and financial record keeping.',
                duration: 20,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the main purpose of bookkeeping?',
                        options: ['To spend money', 'To record and track financial transactions', 'To hide money'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is profit?',
                        options: ['Money coming in', 'Money going out', 'Income minus expenses'],
                        correctAnswer: 2
                    },
                    {
                        question: 'Why should you keep financial records?',
                        options: ['To know if business is profitable', 'To prepare taxes', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What is cash flow?',
                        options: ['How much money you have', 'Money movement timing', 'Bank balance'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you record in your books?',
                        options: ['Only big transactions', 'All income and expenses', 'Only expenses'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Financial Records Quiz',
                content: 'Test your understanding of financial record keeping and business transactions.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is an income statement?',
                        options: ['List of expenses', 'Summary of income and expenses over time', 'Bank statement'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is it important to track expenses?',
                        options: ['To spend more money', 'To know where money is going', 'To avoid paying taxes'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a business expense?',
                        options: ['Personal shopping', 'Money spent on business operations', 'Gambling losses'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How often should you review your financial records?',
                        options: ['Never', 'Monthly or quarterly', 'Only at tax time'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Bookkeeping Practice',
                content: 'Practice: 1) Record 5 sales transactions, 2) Track daily expenses, 3) Calculate profit for the week, 4) Create a simple income statement, 5) Use the Business Tools to manage finances.',
                duration: 25,
                type: 'practice'
            }
        ]
    },

    // Business Automation Modules
    'ba_001': {
        title: 'Digital Inventory Management',
        lessons: [
            {
                title: 'Introduction to Digital Inventory Management',
                content: 'Learn how to manage inventory digitally, track stock levels, and optimize business operations.',
                duration: 30,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_ba001',
                textContent: `
**What You'll Learn:**
• Understanding inventory management principles
• Digital tools for stock tracking
• Setting reorder points and managing stock levels
• Inventory valuation and cost management
• Reducing waste and optimizing stock

**Key Takeaways:**
- Effective inventory management prevents stockouts and overstocking
- Digital systems provide real-time visibility
- Proper valuation ensures accurate financial reporting
- Regular audits maintain inventory accuracy
- Technology streamlines inventory processes
                `
            },
            {
                title: 'Inventory Management Quiz',
                content: 'Test your knowledge of inventory tracking and stock management.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is inventory?',
                        options: ['Money in the bank', 'Products you have for sale', 'Customer information'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is it important to track stock levels?',
                        options: ['To avoid running out of products', 'To know how much money you have', 'To count your customers'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is a reorder point?',
                        options: ['When to sell products', 'When to buy more stock', 'When to hire staff'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is SKU?',
                        options: ['Stock Keeping Unit - product code', 'Sales Keeping Unit', 'Stock Keeping User'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is the benefit of digital inventory management?',
                        options: ['It costs more money', 'It saves time and reduces errors', 'It requires more paperwork'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Stock Control Quiz',
                content: 'Test your understanding of stock control and inventory best practices.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What should you do with slow-moving stock?',
                        options: ['Ignore it', 'Monitor it closely and consider discounts', 'Throw it away'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How often should you update stock levels?',
                        options: ['Once a year', 'Daily or after each sale', 'Never'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is cost price?',
                        options: ['What customers pay', 'What you paid for the product', 'Your profit'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why should you keep supplier information?',
                        options: ['To contact them for reorders', 'To share with competitors', 'To increase prices'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                title: 'Inventory Practice',
                content: 'Practice: 1) Add 10 products to inventory, 2) Set reorder levels, 3) Record a sale and update stock, 4) Generate inventory report, 5) Identify low stock items.',
                duration: 20,
                type: 'practice'
            }
        ]
    },
    'ba_002': {
        title: 'Customer Relationship Management',
        lessons: [
            {
                title: 'Introduction to Customer Relationship Management',
                content: 'Learn the fundamentals of CRM, customer service, and building lasting customer relationships.',
                duration: 35,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_ba002',
                textContent: `
**What You'll Learn:**
• Understanding CRM and its importance
• Customer data management and segmentation
• Communication strategies and customer service
• Building customer loyalty and retention
• Using digital tools for CRM

**Key Takeaways:**
- Strong customer relationships drive business growth
- Personalization enhances customer experience
- Consistent communication builds trust
- Customer feedback guides improvements
- Technology enables scalable customer management
                `
            },
            {
                title: 'CRM Fundamentals Quiz',
                content: 'Test your knowledge of customer relationship management and customer service best practices.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What does CRM stand for?',
                        options: ['Customer Relationship Management', 'Customer Retail Marketing', 'Customer Response Management'],
                        correctAnswer: 0
                    },
                    {
                        question: 'Why is CRM important for business?',
                        options: ['To increase customer loyalty', 'To track competitor prices', 'To manage inventory'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What information should you track about customers?',
                        options: ['Only their names', 'Contact details, purchase history, and preferences', 'Only their payment methods'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How can you improve customer retention?',
                        options: ['Ignore customer feedback', 'Follow up after sales and provide excellent service', 'Only focus on new customers'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is customer segmentation?',
                        options: ['Dividing customers into groups', 'Counting total customers', 'Tracking customer locations'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                title: 'Customer Service Quiz',
                content: 'Test your understanding of customer service and communication.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'How quickly should you respond to customer inquiries?',
                        options: ['Within a week', 'Within 24 hours', 'Only when convenient'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do when a customer complains?',
                        options: ['Ignore them', 'Listen actively and try to resolve the issue', 'Argue with them'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why should you personalize customer communication?',
                        options: ['To waste time', 'To make customers feel valued', 'To increase costs'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a good way to build customer loyalty?',
                        options: ['Offer discounts occasionally', 'Provide consistent excellent service', 'Both A and B'],
                        correctAnswer: 2
                    }
                ]
            },
            {
                title: 'CRM Practice',
                content: 'Practice: 1) Add 5 customers to database, 2) Record customer purchases, 3) Segment customers by type, 4) Send follow-up message, 5) Track customer satisfaction.',
                duration: 20,
                type: 'practice'
            }
        ]
    },

    // E-Commerce Modules
    'ec_001': {
        title: 'Online Store Setup',
        lessons: [
            {
                title: 'Introduction to Online Store Setup',
                content: 'Learn how to set up and manage an online store, including platform selection and basic operations.',
                duration: 45,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_ec001',
                textContent: `
**What You'll Learn:**
• Understanding e-commerce and online selling
• Choosing the right platform for your business
• Setting up your online store
• Product listing and presentation
• Payment processing and fulfillment

**Key Takeaways:**
- E-commerce expands market reach
- Platform choice affects success
- Professional presentation builds trust
- Secure payments protect both buyer and seller
- Customer experience drives repeat business
                `
            },
            {
                title: 'E-commerce Fundamentals Quiz',
                content: 'Test your knowledge of online selling and e-commerce basics.',
                duration: 20,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is e-commerce?',
                        options: ['Selling products online', 'Buying groceries', 'Using social media'],
                        correctAnswer: 0
                    },
                    {
                        question: 'Which platform is good for beginners?',
                        options: ['Complex coding platforms', 'Facebook Shop - easy to set up', 'Advanced enterprise systems'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why are product photos important?',
                        options: ['They make the listing look professional', 'Customers can see what they\'re buying', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you include in product descriptions?',
                        options: ['Only the price', 'Detailed information about features and benefits', 'Nothing, photos are enough'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How should you price your products online?',
                        options: ['Much higher than in-store', 'Competitively, considering costs and market', 'Much lower than competitors'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Online Selling Quiz',
                content: 'Test your understanding of online store management and customer service.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is important for online customer service?',
                        options: ['Respond quickly to inquiries', 'Ignore customer messages', 'Only respond when convenient'],
                        correctAnswer: 0
                    },
                    {
                        question: 'How should you handle online orders?',
                        options: ['Process them immediately', 'Confirm details and delivery options', 'Cancel them'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why should you encourage customer reviews?',
                        options: ['To build trust with new customers', 'To waste time', 'To argue with customers'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What payment methods should you offer?',
                        options: ['Only cash on delivery', 'Multiple options including M-Pesa', 'Only expensive methods'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'E-commerce Practice',
                content: 'Practice: 1) Create Facebook Shop, 2) List 5 products with photos, 3) Write product descriptions, 4) Set up payment method, 5) Process a test order.',
                duration: 30,
                type: 'practice'
            }
        ]
    },

    // Digital Marketing Modules
    'dm_001': {
        title: 'Social Media Marketing',
        lessons: [
            {
                title: 'Introduction to Social Media Marketing',
                content: 'Learn the fundamentals of social media marketing, platform strategies, and content creation.',
                duration: 40,
                type: 'video',
                youtubeUrl: 'https://www.youtube.com/watch?v=example_dm001',
                textContent: `
**What You'll Learn:**
• Understanding social media marketing
• Platform selection and audience targeting
• Content creation and posting strategies
• Engagement and community building
• Measuring marketing success

**Key Takeaways:**
- Social media reaches customers directly
- Consistent branding builds recognition
- Engagement drives organic growth
- Analytics guide marketing decisions
- Authenticity resonates with audiences
                `
            },
            {
                title: 'Social Media Platforms Quiz',
                content: 'Test your knowledge of different social media platforms and their business applications.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'Which platform is best for B2B marketing?',
                        options: ['Instagram', 'LinkedIn', 'TikTok'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What type of content performs best on Instagram?',
                        options: ['Long text posts', 'Visual content like photos and videos', 'Email newsletters'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is the main purpose of Twitter for businesses?',
                        options: ['Photo sharing', 'Customer service and news sharing', 'Long-form content'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which platform is known for short-form video content?',
                        options: ['Facebook', 'TikTok', 'LinkedIn'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you include in social media posts?',
                        options: ['Only product information', 'Engaging content, hashtags, and calls to action', 'Personal opinions only'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Content Strategy Quiz',
                content: 'Test your understanding of social media content creation and strategy.',
                duration: 15,
                type: 'quiz',
                questions: [
                    {
                        question: 'How often should businesses post on social media?',
                        options: ['Once a month', 'Daily or 3-5 times per week', 'Only when they have sales'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What is a hashtag used for?',
                        options: ['To make text bold', 'To categorize content and increase visibility', 'To tag friends only'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is engagement important on social media?',
                        options: ['It looks good', 'It builds relationships and increases reach', 'It wastes time'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What type of content gets the most engagement?',
                        options: ['Sales pitches only', 'Valuable content like tips, behind-the-scenes, and user-generated content', 'Personal complaints'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How can you measure social media success?',
                        options: ['Only by sales numbers', 'By tracking engagement, reach, and follower growth', 'By how many posts you make'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Social Media Practice',
                content: 'Practice: 1) Create business Facebook page, 2) Post 3 pieces of content, 3) Engage with 5 followers, 4) Use 5 relevant hashtags, 5) Analyze post performance.',
                duration: 25,
                type: 'practice'
            }
        ]
    },

    // Mobile Basics Modules
    'mb_001': {
        title: 'Module 1: Getting Started with Your Smartphone',
        lessons: [
            {
                title: 'Introduction to Smartphone Basics',
                content: 'Learn the fundamentals of using your smartphone, including setup, navigation, and basic features.',
                duration: 30,
                type: 'video',
                youtubeUrl: 'https://youtu.be/2PnJ1cDb2LI?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Understanding smartphone hardware and components
• Initial setup and configuration
• Basic navigation and gestures
• Power management and battery care
• Screen locking and security basics

**Key Takeaways:**
- Your smartphone is a powerful personal assistant
- Proper setup ensures optimal performance
- Security features protect your personal information
- Regular maintenance keeps your device running smoothly
                `
            },
            {
                title: 'Module 1 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the first step in setting up a new smartphone?',
                        options: ['Install apps', 'Charge the battery', 'Turn it on and follow setup wizard'],
                        correctAnswer: 2
                    },
                    {
                        question: 'Which gesture is used to go back on most Android phones?',
                        options: ['Swipe left', 'Swipe right', 'Tap the back button'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you do to save battery life?',
                        options: ['Keep screen brightness high', 'Close unused apps', 'Use location services always'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why is it important to set a screen lock?',
                        options: ['To prevent unauthorized access', 'To make the phone faster', 'To change the wallpaper'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                title: 'Module 1 Practical Task',
                content: 'Do-it-now: 1) Install a calendar app on your phone, 2) Create a calendar invite for tomorrow, 3) Set up a screen lock PIN or pattern, 4) Adjust screen brightness to save battery.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_002': {
        title: 'Module 2: Making Calls and Messaging',
        lessons: [
            {
                title: 'Making Calls and Messaging',
                content: 'Learn how to make and receive calls, send text messages, and manage contacts on your smartphone.',
                duration: 25,
                type: 'video',
                youtubeUrl: 'https://youtu.be/4fjEL_pjHw4?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Making and receiving phone calls
• Managing contacts and address book
• Sending and receiving text messages (SMS)
• Using voice mail
• Call blocking and Do Not Disturb features

**Key Takeaways:**
- Clear communication is essential for business
- Organize contacts for easy access
- Use messaging for quick, written communication
- Respect privacy and call etiquette
                `
            },
            {
                title: 'Module 2 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'How do you add a new contact to your phone?',
                        options: ['Open contacts app and tap add', 'Send a text message', 'Make a call first'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is SMS?',
                        options: ['Short Message Service', 'Social Media Sharing', 'Smartphone Management System'],
                        correctAnswer: 0
                    },
                    {
                        question: 'How can you block unwanted calls?',
                        options: ['Go to call settings and block number', 'Delete the contact', 'Turn off the phone'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What should you do before making an important call?',
                        options: ['Check your signal strength', 'Find a quiet place', 'Both A and B'],
                        correctAnswer: 2
                    }
                ]
            },
            {
                title: 'Module 2 Practical Task',
                content: 'Do-it-now: 1) Add 3 new contacts to your phone, 2) Send a text message to a contact, 3) Make a call and leave a voicemail if unanswered, 4) Block an unwanted number.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_003': {
        title: 'Module 3: Internet Browsing and Apps',
        lessons: [
            {
                title: 'Internet Browsing and Apps',
                content: 'Explore web browsing, downloading apps, and using mobile applications effectively.',
                duration: 30,
                type: 'video',
                youtubeUrl: 'https://youtu.be/R18ZJUAkWJQ?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Using web browsers (Chrome, Safari, etc.)
• Searching the internet effectively
• Downloading and installing apps
• Managing app permissions
• Updating apps and system software

**Key Takeaways:**
- The internet is a vast resource for information
- Apps extend your phone's capabilities
- Be cautious with app downloads and permissions
- Regular updates keep your device secure
                `
            },
            {
                title: 'Module 3 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the most popular mobile web browser?',
                        options: ['Internet Explorer', 'Google Chrome', 'Firefox Mobile'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Where do you download apps on Android?',
                        options: ['App Store', 'Google Play Store', 'Microsoft Store'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Why should you update apps regularly?',
                        options: ['To get new features', 'For security fixes', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you check before downloading an app?',
                        options: ['App reviews and ratings', 'Developer information', 'Both A and B'],
                        correctAnswer: 2
                    }
                ]
            },
            {
                title: 'Module 3 Practical Task',
                content: 'Do-it-now: 1) Install a web browser app if not already installed, 2) Search for "local weather" online, 3) Download and install a free productivity app, 4) Check for and install app updates.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_004': {
        title: 'Module 4: Camera and Multimedia',
        lessons: [
            {
                title: 'Camera and Multimedia',
                content: 'Master taking photos, recording videos, and managing multimedia files on your smartphone.',
                duration: 25,
                type: 'video',
                youtubeUrl: 'https://youtu.be/iiqEWNUG6eM?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Using the camera app for photos and videos
• Camera settings and modes
• Managing photo and video galleries
• Sharing multimedia content
• Basic photo editing

**Key Takeaways:**
- Your phone camera is a powerful tool
- Good lighting and composition improve photos
- Organize your media files regularly
- Respect privacy when sharing photos
                `
            },
            {
                title: 'Module 4 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is the best way to take a clear photo?',
                        options: ['In low light', 'With steady hands and good lighting', 'Moving quickly'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you switch between photo and video mode?',
                        options: ['Shake the phone', 'Tap the mode button', 'Press volume keys'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Where are photos stored on most smartphones?',
                        options: ['In the browser', 'In the Gallery or Photos app', 'In the Contacts app'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What should you do with old photos you no longer need?',
                        options: ['Keep them forever', 'Delete or backup and delete', 'Share with everyone'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Module 4 Practical Task',
                content: 'Do-it-now: 1) Take 3 photos of different subjects, 2) Record a short video (10 seconds), 3) Organize photos into an album, 4) Share a photo via messaging app.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_005': {
        title: 'Module 5: Productivity Apps',
        lessons: [
            {
                title: 'Productivity Apps',
                content: 'Learn to use calendar, notes, calculator, and other productivity tools on your smartphone.',
                duration: 20,
                type: 'video',
                youtubeUrl: 'https://youtu.be/wsHvFOun1Kc?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Using calendar and reminder apps
• Taking notes and organizing information
• Calculator and basic math functions
• File management and storage
• Basic productivity workflows

**Key Takeaways:**
- Productivity apps help manage time and tasks
- Regular note-taking improves memory and organization
- Back up important files regularly
- Use reminders to stay on track
                `
            },
            {
                title: 'Module 5 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'What is a good use for the calendar app?',
                        options: ['Playing games', 'Scheduling appointments and reminders', 'Taking photos'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How can you organize your notes?',
                        options: ['By color coding', 'By folders or categories', 'Both A and B'],
                        correctAnswer: 2
                    },
                    {
                        question: 'What should you do with important notes?',
                        options: ['Delete them immediately', 'Save and backup regularly', 'Share with strangers'],
                        correctAnswer: 1
                    },
                    {
                        question: 'Which app helps with quick calculations?',
                        options: ['Calendar', 'Calculator', 'Notes'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Module 5 Practical Task',
                content: 'Do-it-now: 1) Create a calendar event for next week, 2) Take notes on 3 important tasks, 3) Use calculator for a simple budget calculation, 4) Create a reminder for tomorrow.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_006': {
        title: 'Module 6: Security and Settings',
        lessons: [
            {
                title: 'Security and Settings',
                content: 'Understand phone security features, privacy settings, and system configuration.',
                duration: 25,
                type: 'video',
                youtubeUrl: 'https://youtu.be/KMtlRzY_6Sg?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Setting up security features (PIN, fingerprint, face unlock)
• Managing app permissions and privacy
• System settings and customization
• Data backup and restore
• Troubleshooting common issues

**Key Takeaways:**
- Security protects your personal information
- Regular backups prevent data loss
- Be mindful of app permissions
- Keep your system updated for security
                `
            },
            {
                title: 'Module 6 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'Why is a strong screen lock important?',
                        options: ['To prevent unauthorized access', 'To make the phone look cool', 'To save battery'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What should you do if you lose your phone?',
                        options: ['Panic', 'Use Find My Device to locate it', 'Buy a new phone'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How often should you backup your data?',
                        options: ['Never', 'Weekly or monthly', 'Only when you remember'],
                        correctAnswer: 1
                    },
                    {
                        question: 'What are app permissions?',
                        options: ['App prices', 'Access rights for camera, location, etc.', 'App ratings'],
                        correctAnswer: 1
                    }
                ]
            },
            {
                title: 'Module 6 Practical Task',
                content: 'Do-it-now: 1) Change your screen lock to a stronger method, 2) Review and adjust app permissions for 2 apps, 3) Check storage usage and free up space, 4) Enable automatic backups.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_007': {
        title: 'Module 7: Advanced Features',
        lessons: [
            {
                title: 'Advanced Features',
                content: 'Explore advanced smartphone features like gestures, shortcuts, and customization options.',
                duration: 30,
                type: 'video',
                youtubeUrl: 'https://youtu.be/pWAjtuRU1-o?list=PLGGw4PSQESsBIirGizUscBJVbhSSimBH8',
                textContent: `
**What You'll Learn:**
• Advanced gestures and navigation
• Customizing home screen and widgets
• Using shortcuts and quick actions
• Accessibility features
• Advanced camera features

**Key Takeaways:**
- Advanced features can improve efficiency
- Customization makes the phone feel personal
- Accessibility features help everyone use technology
- Explore features gradually to avoid overwhelm
                `
            },
            {
                title: 'Module 7 Quiz',
                content: 'Test your knowledge with these 4 questions.',
                duration: 10,
                type: 'quiz',
                questions: [
                    {
                        question: 'What are widgets on a smartphone?',
                        options: ['Small games', 'Mini apps on home screen', 'Phone accessories'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How can you access quick settings?',
                        options: ['Swipe down from top of screen', 'Press the power button', 'Shake the phone'],
                        correctAnswer: 0
                    },
                    {
                        question: 'What is a good use for accessibility features?',
                        options: ['Making the phone harder to use', 'Helping people with disabilities', 'Saving battery'],
                        correctAnswer: 1
                    },
                    {
                        question: 'How do you create app shortcuts?',
                        options: ['Long press app icon', 'Delete the app', 'Restart the phone'],
                        correctAnswer: 0
                    }
                ]
            },
            {
                title: 'Module 7 Practical Task',
                content: 'Do-it-now: 1) Add a widget to your home screen, 2) Create an app shortcut, 3) Try an advanced gesture (like split screen), 4) Customize your phone\'s theme or wallpaper.',
                duration: 15,
                type: 'practice'
            }
        ]
    },
    'mb_008': {
        title: 'Final Mini-Project: Personal Digital Organizer',
        lessons: [
            {
                title: 'Final Mini-Project',
                content: 'Create a comprehensive personal digital organizer using your smartphone skills. This project combines all the modules you\'ve learned.',
                duration: 45,
                type: 'project',
                textContent: `
**Project Overview:**
Create a personal digital organizer that includes contacts, calendar events, notes, photos, and more. This project demonstrates your mastery of smartphone basics.

**Project Tasks:**
1. **Contacts Management:** Add 10 important contacts with photos and notes
2. **Calendar Planning:** Create a weekly schedule with appointments and reminders
3. **Note Organization:** Create categorized notes for work, personal, and ideas
4. **Photo Gallery:** Organize photos into albums (family, work, hobbies)
5. **Productivity Setup:** Set up daily reminders and use calculator for budgeting
6. **Security Check:** Ensure all data is backed up and phone is secure
7. **Customization:** Personalize your phone with widgets and shortcuts

**Success Criteria:**
✓ All contacts organized and labeled
✓ Calendar shows a full week of planned activities
✓ Notes are categorized and searchable
✓ Photos organized in logical albums
✓ Daily reminders set up
✓ Phone security features enabled
✓ Home screen customized for productivity

**Tips for Success:**
- Start with small tasks and build up
- Use the skills from each module
- Take screenshots of your progress
- Share your organizer with a friend for feedback
                `
            }
        ]
    }
};

export const getModuleContent = (moduleId) => {
    return courseContentMap[moduleId] || {
        title: 'Course Content',
        lessons: [
            {
                title: 'Main Lesson',
                content: 'Complete course content for this module.',
                duration: 30,
                type: 'video',
                textContent: 'Detailed text content will be available soon.'
            }
        ]
    };
};

export const getAvailableModuleIds = () => {
    return Object.keys(courseContentMap);
};

export const hasModuleContent = (moduleId) => {
    return !!courseContentMap[moduleId];
};

export default courseContentMap;
