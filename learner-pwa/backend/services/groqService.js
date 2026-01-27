const Groq = require('groq-sdk');

class GroqService {
    constructor() {
        this.apiKey = process.env.GROQ_API_KEY;
        if (!this.apiKey) {
            console.warn('GROQ_API_KEY not found in environment variables');
        }
        this.groq = this.apiKey ? new Groq({ apiKey: this.apiKey }) : null;
        this.model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    }

    /**
     * Build system instruction with context
     */
    buildSystemInstruction(userContext, courseContext) {
        const { userName, language } = userContext;
        const { courseName, moduleName, pageContent, isPublic } = courseContext;

        if (isPublic) {
            return `You are an AI learning assistant for SkillBridge254, a digital skills platform for youth in Kiharu Constituency, Kenya.

**Your Role (Public Mode):**
- Provide general information about SkillBridge254 platform
- Explain available courses and learning paths
- Guide visitors on how to sign up and get started
- Answer questions about digital skills training
- Encourage visitors to enroll and start learning

**Language Instructions:**
- Detect the user's input language (English or Swahili)
- Respond in the SAME language as the user's input
- Use simple, clear language appropriate for potential learners

**What You CAN Discuss:**
- Available courses (Digital Skills, E-Commerce, Business Automation, etc.)
- Platform features and benefits
- How to create an account and enroll
- General information about digital skills
- Success stories and testimonials
- Course structure and learning approach

**What You CANNOT Discuss:**
- Specific user progress or personal data
- Detailed course content (encourage sign-up to access)
- Personalized recommendations (require account)
- Certificate details (require completion)

**Tone:**
- Welcoming and encouraging
- Informative but not overwhelming
- Emphasize the value of learning
- Culturally appropriate for Kenyan youth
- Always encourage sign-up to access full features`;
        }

        return `You are an AI learning assistant for SkillBridge254, a digital skills platform for youth in Kiharu Constituency, Kenya.

**Your Role:**
- Help learners understand course content
- Answer questions about modules and lessons
- Provide encouragement and motivation
- Guide learners through their learning journey
- Celebrate their achievements

**Language Instructions:**
- Detect the user's input language (English or Swahili)
- Respond in the SAME language as the user's input
- Maintain a consistent helpful persona in both languages
- Use simple, clear language appropriate for learners

**Current Context:**
- User: ${userName || 'Learner'}
- Current Course: ${courseName || 'General Learning'}
- Current Module: ${moduleName || 'N/A'}
${pageContent ? `- Current Content: ${pageContent.substring(0, 500)}...` : ''}

**Scope Limitations:**
- ONLY answer questions related to SkillBridge254 educational content
- ONLY discuss topics covered in the platform's courses
- If asked about unrelated topics, politely redirect to learning content
- Do not provide personal advice outside of learning context

**Tone:**
- Friendly and encouraging
- Patient and supportive
- Culturally appropriate for Kenyan youth
- Professional but approachable`;
    }

    /**
     * Generate chat response with streaming
     */
    async *generateChatStream(message, userContext, courseContext) {
        if (!this.groq) {
            throw new Error('Groq API not configured');
        }

        try {
            const systemInstruction = this.buildSystemInstruction(userContext, courseContext);

            const stream = await this.groq.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: message }
                ],
                temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7,
                max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 2048,
                stream: true
            });

            for await (const chunk of stream) {
                const content = chunk.choices[0]?.delta?.content;
                if (content) {
                    yield content;
                }
            }
        } catch (error) {
            console.error('Groq API Error:', error);
            throw new Error('Failed to generate response');
        }
    }

    /**
     * Generate non-streaming response
     */
    async generateChatResponse(message, userContext, courseContext) {
        if (!this.groq) {
            throw new Error('Groq API not configured');
        }

        try {
            const systemInstruction = this.buildSystemInstruction(userContext, courseContext);

            const completion = await this.groq.chat.completions.create({
                model: this.model,
                messages: [
                    { role: 'system', content: systemInstruction },
                    { role: 'user', content: message }
                ],
                temperature: parseFloat(process.env.GROQ_TEMPERATURE) || 0.7,
                max_tokens: parseInt(process.env.GROQ_MAX_TOKENS) || 2048
            });

            return completion.choices[0]?.message?.content || '';
        } catch (error) {
            console.error('Groq API Error:', error);
            throw new Error('Failed to generate response');
        }
    }

    /**
     * Generate celebration message
     */
    async generateCelebrationMessage(eventType, context) {
        const { userName, moduleName, courseName, language } = context;

        let prompt = '';

        if (eventType === 'MODULE_COMPLETE') {
            prompt = language === 'sw'
                ? `Tuma ujumbe mfupi wa pongezi kwa ${userName} kwa kukamilisha moduli "${moduleName}". Tumia maneno ya kuvutia na ya kuhamasisha.`
                : `Generate a short congratulatory message for ${userName} completing the module "${moduleName}". Use engaging and motivating language.`;
        } else if (eventType === 'COURSE_COMPLETE') {
            prompt = language === 'sw'
                ? `Tuma ujumbe wa pongezi kwa ${userName} kwa kukamilisha kozi "${courseName}". Eleza mafanikio yao na uwahimize kuendelea kujifunza.`
                : `Generate a congratulatory message for ${userName} completing the course "${courseName}". Highlight their achievement and encourage continued learning.`;
        } else if (eventType === 'VIDEO_COMPLETE') {
            prompt = language === 'sw'
                ? `Tuma ujumbe mfupi wa pongezi kwa ${userName} kwa kumaliza video. Wape motisha kuendelea.`
                : `Generate a short congratulatory message for ${userName} completing a video. Motivate them to continue.`;
        } else if (eventType === 'PDF_VIEWED') {
            prompt = language === 'sw'
                ? `Tuma ujumbe mfupi wa pongezi kwa ${userName} kwa kusoma nyaraka. Wape motisha kuendelea.`
                : `Generate a short congratulatory message for ${userName} reading a document. Motivate them to continue.`;
        }

        try {
            const response = await this.generateChatResponse(prompt,
                { userName, language },
                { courseName, moduleName }
            );
            return response;
        } catch (error) {
            if (language === 'sw') {
                return `Hongera ${userName}! 🎉 Umemaliza hatua hii. Endelea hivyo!`;
            }
            return `Congratulations ${userName}! 🎉 You've completed this step. Keep it up!`;
        }
    }
}

module.exports = new GroqService();
