/**
 * Kiharu Constituency Specific Content
 * Localized content for Kiharu Constituency youth and business community
 */

export const KIHARU_LOCALIZATION = {
  name: 'Kiharu Constituency',
  region: 'Murang\'a County, Kenya',
  population: 45000,
  youthPopulation: 17100,
  coordinates: { lat: -0.95, lng: 37.15 },

  // Local business context
  localBusinesses: [
    'Agri-business (coffee, tea, dairy farming)',
    'Retail shops and supermarkets',
    'Motorcycle transport (boda boda)',
    'Small-scale manufacturing',
    'Digital services and mobile money'
  ],

  // Local challenges
  challenges: [
    'Limited access to formal employment',
    'Seasonal agricultural income',
    'High cost of business startup',
    'Limited digital skills training',
    'Poor internet connectivity in rural areas'
  ],

  // Success stories
  successStories: [
    {
      name: 'James Kariuki',
      business: 'Digital Farm Management',
      impact: 'Increased coffee yield by 40% using mobile apps',
      location: 'Kiharu Town'
    },
    {
      name: 'Grace Wanjiku',
      business: 'Online Boutique',
      impact: 'Expanded customer base to Nairobi using social media',
      location: 'Kangari'
    }
  ]
};

export const KIHARU_MODULES = [
  // Localized Basic Digital Skills
  {
    id: 'kiharu_bd_001',
    title: 'Mobile Money & M-Pesa Mastery',
    category: 'basic_digital',
    difficulty: 1,
    priority: 10,
    baseTime: 45,
    description: 'Master M-Pesa, Airtel Money, and other mobile payment systems used in Kiharu',
    youtubeUrl: 'https://www.youtube.com/watch?v=qJXmdY4lVR0',
    instructor: 'Safaricom PLC',
    localContext: 'Essential for all business transactions in Kiharu markets',
    kiharuness: 9
  },
  {
    id: 'kiharu_bd_002',
    title: 'Rural Internet & Data Management',
    category: 'basic_digital',
    difficulty: 1,
    priority: 9,
    baseTime: 30,
    description: 'Managing data bundles and internet access in low-connectivity areas',
    youtubeUrl: 'https://www.youtube.com/watch?v=Dxcc6ycZ73M',
    instructor: 'GCFGlobal',
    localContext: 'Critical for business owners in areas with poor network coverage',
    kiharuness: 8
  },

  // Localized Business Automation
  {
    id: 'kiharu_ba_001',
    title: 'Farm Record Keeping with Mobile Apps',
    category: 'business_automation',
    difficulty: 2,
    priority: 9,
    baseTime: 60,
    description: 'Track farm inputs, yields, and profits using simple mobile applications',
    youtubeUrl: 'https://www.youtube.com/watch?v=ZNZGHjWYVqQ',
    instructor: 'Digital Green',
    localContext: 'Perfect for coffee and dairy farmers in Kiharu',
    kiharuness: 10
  },
  {
    id: 'kiharu_ba_002',
    title: 'Shop Inventory Management',
    category: 'business_automation',
    difficulty: 2,
    priority: 8,
    baseTime: 75,
    description: 'Manage shop stock, sales, and suppliers using digital tools',
    youtubeUrl: 'https://www.youtube.com/watch?v=Q_O-X3qn9_s',
    instructor: 'Cin7 Omni',
    localContext: 'Essential for retail shops in Kiharu markets',
    kiharuness: 9
  },

  // Localized E-commerce
  {
    id: 'kiharu_ec_001',
    title: 'Selling Agricultural Products Online',
    category: 'e_commerce',
    difficulty: 2,
    priority: 8,
    baseTime: 90,
    description: 'List and sell coffee, tea, and other farm products on online marketplaces',
    youtubeUrl: 'https://www.youtube.com/watch?v=4qTOg4dGjQE',
    instructor: 'Jumia',
    localContext: 'Connect Kiharu farmers directly to Nairobi and international buyers',
    kiharuness: 10
  },
  {
    id: 'kiharu_ec_002',
    title: 'Local Market Photography & Listing',
    category: 'e_commerce',
    difficulty: 2,
    priority: 7,
    baseTime: 60,
    description: 'Take professional photos and create attractive listings for local products',
    youtubeUrl: 'https://www.youtube.com/watch?v=GvvKbcCkzgE',
    instructor: 'Peter McKinnon',
    localContext: 'Showcase Kiharu agricultural products to the world',
    kiharuness: 8
  },

  // Localized Digital Marketing
  {
    id: 'kiharu_dm_001',
    title: 'WhatsApp Business for Local Traders',
    category: 'digital_marketing',
    difficulty: 1,
    priority: 9,
    baseTime: 45,
    description: 'Use WhatsApp Business to connect with customers and manage orders',
    youtubeUrl: 'https://www.youtube.com/watch?v=xkUpn4bnOVE',
    instructor: 'WhatsApp',
    localContext: 'Most popular communication tool in Kiharu markets',
    kiharuness: 10
  },
  {
    id: 'kiharu_dm_002',
    title: 'Facebook Marketplace for Kiharu Businesses',
    category: 'digital_marketing',
    difficulty: 2,
    priority: 8,
    baseTime: 60,
    description: 'Sell products and services to local and regional customers',
    youtubeUrl: 'https://www.youtube.com/watch?v=hW98BFnVCm8',
    instructor: 'Facebook',
    localContext: 'Connect Kiharu businesses with Murang\'a and Nairobi customers',
    kiharuness: 9
  },

  // Localized Financial Management
  {
    id: 'kiharu_fm_001',
    title: 'Business Loan Applications Online',
    category: 'financial_management',
    difficulty: 2,
    priority: 7,
    baseTime: 75,
    description: 'Apply for business loans and track applications digitally',
    youtubeUrl: 'https://www.youtube.com/watch?v=rF5Z8xfSMkE',
    instructor: 'KCB Group',
    localContext: 'Access formal financing for Kiharu entrepreneurs',
    kiharuness: 8
  },
  {
    id: 'kiharu_fm_002',
    title: 'Tax Filing for Small Businesses',
    category: 'financial_management',
    difficulty: 3,
    priority: 6,
    baseTime: 90,
    description: 'File taxes and maintain financial records for small businesses',
    youtubeUrl: 'https://www.youtube.com/watch?v=AccountingKE',
    instructor: 'Kenya Revenue Authority',
    localContext: 'Comply with tax requirements for Kiharu businesses',
    kiharuness: 7
  }
];

export const KIHARU_BUSINESS_PROFILES = [
  {
    type: 'Coffee Farmer',
    skills: ['Farm record keeping', 'Mobile money', 'Online selling'],
    challenges: ['Price fluctuations', 'Input costs', 'Market access'],
    opportunities: ['Direct export', 'Value addition', 'Organic certification']
  },
  {
    type: 'Retail Shop Owner',
    skills: ['Inventory management', 'Customer records', 'Digital payments'],
    challenges: ['Competition', 'Stock management', 'Cash flow'],
    opportunities: ['Online ordering', 'Loyalty programs', 'Delivery services']
  },
  {
    type: 'Boda Boda Rider',
    skills: ['Ride-hailing apps', 'Customer service', 'Route optimization'],
    challenges: ['Competition', 'Vehicle maintenance', 'Weather dependence'],
    opportunities: ['Delivery services', 'Tour guide', 'Vehicle rental']
  },
  {
    type: 'Youth Entrepreneur',
    skills: ['Business planning', 'Digital marketing', 'Financial management'],
    challenges: ['Limited capital', 'Market knowledge', 'Business skills'],
    opportunities: ['Innovation', 'Technology adoption', 'Youth networks']
  }
];

export const KIHARU_LANGUAGE_PACK = {
  swahili: {
    welcome: 'Karibu Kiharu - Jifunze Ujuzi wa Dijitali',
    assessment: 'Tathmini ya Ujuzi',
    business: 'Biashara',
    farming: 'Kilimo',
    market: 'Soko',
    success: 'Mafanikio',
    learn: 'Jifunze',
    practice: 'Fanya Mazoezi',
    certificate: 'Cheti',
    community: 'Jamii'
  }
};

export const KIHARU_NETWORK_PARTNERS = [
  {
    name: 'Kiharu Youth Group',
    type: 'Community Organization',
    services: ['Mentorship', 'Business networking', 'Skill sharing'],
    contact: 'youth@kiharu.go.ke'
  },
  {
    name: 'Murang\'a County SME Hub',
    type: 'Government',
    services: ['Business registration', 'Training programs', 'Funding access'],
    contact: 'sme@muranga.go.ke'
  },
  {
    name: 'Digital Farmers Kenya',
    type: 'NGO',
    services: ['Agricultural technology', 'Market linkages', 'Training'],
    contact: 'info@digitalfarmers.co.ke'
  }
];
