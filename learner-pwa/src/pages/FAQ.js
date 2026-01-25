import React from 'react';
import { Container, Row, Col, Accordion, Card } from 'react-bootstrap';

function FAQ() {
    const faqs = [
        {
            category: "Getting Started",
            questions: [
                {
                    q: "What is SkillBridge254?",
                    a: "SkillBridge254 is an AI-driven digital skills platform designed to empower youth aged 18-35 in Kiharu Constituency, Murang'a County, Kenya. We provide accessible, offline-first learning experiences in digital literacy, business skills, and entrepreneurship."
                },
                {
                    q: "How do I create an account?",
                    a: "Click the 'Sign Up' button on the homepage or in the navigation menu. Fill in your details including name, email, and password. You'll receive a verification email to activate your account."
                },
                {
                    q: "Is SkillBridge254 free to use?",
                    a: "Yes! SkillBridge254 is completely free for all learners in Kiharu Constituency. Our mission is to provide accessible digital skills training to empower youth economically."
                }
            ]
        },
        {
            category: "Learning & Courses",
            questions: [
                {
                    q: "What courses are available?",
                    a: "We offer courses in Digital Literacy (computer basics, internet skills, mobile technology), Business Skills (entrepreneurship, financial literacy, marketing), and practical business tools for managing your enterprise."
                },
                {
                    q: "Can I learn offline?",
                    a: "Yes! SkillBridge254 is designed as an offline-first platform. You can download course materials and continue learning even without an internet connection. Your progress will sync when you're back online."
                },
                {
                    q: "How long does it take to complete a course?",
                    a: "Course duration varies. Most modules can be completed in 1-3 hours, and full courses typically take 10-20 hours. You can learn at your own pace and revisit materials anytime."
                },
                {
                    q: "Will I receive a certificate?",
                    a: "Yes! Upon successfully completing a course and passing the assessment, you'll receive a digital certificate that you can download and share with employers or on social media."
                }
            ]
        },
        {
            category: "Skills Assessment",
            questions: [
                {
                    q: "What is the Skills Assessment?",
                    a: "Our AI-powered Skills Assessment evaluates your current digital and business skills to recommend personalized learning paths tailored to your needs and goals."
                },
                {
                    q: "How long does the assessment take?",
                    a: "The assessment typically takes 15-20 minutes to complete. It includes questions about your current skills, experience, and learning goals."
                },
                {
                    q: "Can I retake the assessment?",
                    a: "Yes! You can retake the assessment anytime to update your learning path as your skills improve or your goals change."
                }
            ]
        },
        {
            category: "Business Tools",
            questions: [
                {
                    q: "What business tools are available?",
                    a: "We provide practical tools for managing your business including inventory management, customer tracking, financial reports, sales forecasting, and workflow management."
                },
                {
                    q: "Do I need business experience to use the tools?",
                    a: "No! Our tools are designed to be user-friendly for beginners. We provide tutorials and guidance to help you get started, even if you're new to business management."
                },
                {
                    q: "Can I use the tools offline?",
                    a: "Yes! Most business tools work offline and will sync your data when you reconnect to the internet."
                }
            ]
        },
        {
            category: "Technical Support",
            questions: [
                {
                    q: "What devices can I use?",
                    a: "SkillBridge254 works on smartphones, tablets, and computers. We recommend using a modern web browser like Chrome, Firefox, Safari, or Edge for the best experience."
                },
                {
                    q: "I'm having trouble logging in. What should I do?",
                    a: "First, check that you're using the correct email and password. If you've forgotten your password, use the 'Forgot Password' link. If issues persist, contact our support team at support@skillbridge254.co.ke."
                },
                {
                    q: "How do I report a bug or technical issue?",
                    a: "You can report issues through our chat widget (bottom right corner) or email tech@skillbridge254.co.ke. Please include details about what you were doing when the issue occurred."
                },
                {
                    q: "Is my data secure?",
                    a: "Yes! We take data security seriously. All data is encrypted, and we follow industry best practices to protect your personal information. See our Privacy Policy for more details."
                }
            ]
        },
        {
            category: "Account & Profile",
            questions: [
                {
                    q: "How do I update my profile?",
                    a: "Go to your Dashboard and click on 'Profile' in the navigation menu. From there, you can update your personal information, profile picture, and preferences."
                },
                {
                    q: "Can I change my password?",
                    a: "Yes! Go to your Profile page and click 'Change Password'. You'll need to enter your current password and then your new password."
                },
                {
                    q: "How do I delete my account?",
                    a: "If you wish to delete your account, please contact our support team at support@skillbridge254.co.ke. Note that this action is permanent and cannot be undone."
                }
            ]
        }
    ];

    return (
        <Container className="py-5">
            <Row className="justify-content-center">
                <Col lg={10}>
                    <h1 className="mb-4">❓ Frequently Asked Questions</h1>

                    <Card className="mb-4">
                        <Card.Body>
                            <p className="mb-0">
                                Find answers to common questions about SkillBridge254. If you can't find what you're
                                looking for, feel free to <a href="/contact">contact us</a> or use our chat widget.
                            </p>
                        </Card.Body>
                    </Card>

                    {faqs.map((category, categoryIndex) => (
                        <div key={categoryIndex} className="mb-4">
                            <h4 className="mb-3">{category.category}</h4>
                            <Accordion>
                                {category.questions.map((faq, faqIndex) => (
                                    <Accordion.Item
                                        key={faqIndex}
                                        eventKey={`${categoryIndex}-${faqIndex}`}
                                    >
                                        <Accordion.Header>{faq.q}</Accordion.Header>
                                        <Accordion.Body>{faq.a}</Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>
                        </div>
                    ))}

                    <Card className="mt-5 bg-light">
                        <Card.Body>
                            <h5 className="mb-3">Still have questions?</h5>
                            <p className="mb-3">
                                We're here to help! Reach out to us through any of these channels:
                            </p>
                            <ul>
                                <li>📱 Phone: +254 700 000 000 (Mon-Fri, 8AM-6PM)</li>
                                <li>✉️ Email: support@skillbridge254.co.ke</li>
                                <li>💬 Live Chat: Use the chat widget at the bottom right</li>
                                <li>📞 <a href="/contact">Contact Page</a></li>
                            </ul>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
}

export default FAQ;
