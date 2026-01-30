import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ListGroup, Accordion } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../services/api';
import './Pricing.css';

function Pricing() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [pricingPlans, setPricingPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default pricing plans (fallback if API fails)
  const defaultPlans = [
    {
      _id: '1',
      name: 'Free',
      price: 0,
      interval: 'forever',
      popular: false,
      features: [
        'Access to basic courses',
        'Community support',
        'Course completion certificates',
        'Mobile app access',
        'Limited course materials'
      ],
      limitations: [
        'No advanced courses',
        'No 1-on-1 mentoring',
        'No priority support'
      ]
    },
    {
      _id: '2',
      name: 'Pro',
      price: 29,
      interval: 'month',
      popular: true,
      features: [
        'Access to all courses',
        'Priority email support',
        'Downloadable resources',
        'Course completion certificates',
        'Mobile app access',
        'Offline viewing',
        'Monthly live Q&A sessions',
        'Access to course projects'
      ],
      limitations: [
        'No 1-on-1 mentoring'
      ]
    },
    {
      _id: '3',
      name: 'Enterprise',
      price: 99,
      interval: 'month',
      popular: false,
      features: [
        'Everything in Pro',
        '1-on-1 mentoring sessions',
        'Custom learning paths',
        'Team collaboration tools',
        'Advanced analytics',
        'API access',
        'Dedicated account manager',
        'Custom integrations',
        'Priority support (24/7)'
      ],
      limitations: []
    }
  ];

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pricing');
      setPricingPlans(response.data.plans || defaultPlans);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      // Use default plans if API fails
      setPricingPlans(defaultPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    if (!user) {
      navigate('/');
      return;
    }

    if (plan.price === 0) {
      navigate('/courses');
    } else {
      // TODO: Integrate with payment system
      alert(`Payment integration coming soon! Selected plan: ${plan.name}`);
    }
  };

  const faqs = [
    {
      question: 'Can I switch plans later?',
      answer: 'Yes! You can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise plans.'
    },
    {
      question: 'Is there a free trial?',
      answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required.'
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Absolutely! You can cancel your subscription at any time. No questions asked.'
    },
    {
      question: 'Do you offer student discounts?',
      answer: 'Yes! Students get 50% off on all paid plans. Contact us with your student ID for verification.'
    },
    {
      question: 'What happens to my progress if I cancel?',
      answer: 'Your progress is saved for 6 months after cancellation. You can reactivate anytime and continue where you left off.'
    }
  ];

  return (
    <div className="pricing-page">
      {/* Hero Section */}
      <section className="pricing-hero bg-primary text-white py-5">
        <Container>
          <div className="text-center">
            <h1 className="display-4 fw-bold mb-3">Choose Your Plan</h1>
            <p className="lead mb-4">
              Start learning today with our flexible pricing options. All plans include lifetime access to purchased courses.
            </p>
            <div className="pricing-toggle d-inline-flex bg-white rounded p-1">
              <Button variant="primary" size="sm" className="px-4">Monthly</Button>
              <Button variant="light" size="sm" className="px-4">
                Yearly <Badge bg="success" className="ms-1">Save 20%</Badge>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {/* Pricing Cards */}
      <section className="pricing-cards py-5">
        <Container>
          <Row className="g-4 justify-content-center">
            {pricingPlans.map((plan) => (
              <Col key={plan._id} lg={4} md={6}>
                <Card className={`pricing-card h-100 ${plan.popular ? 'popular' : ''}`}>
                  {plan.popular && (
                    <div className="popular-badge">
                      <Badge bg="warning" text="dark">Most Popular</Badge>
                    </div>
                  )}
                  <Card.Body className="d-flex flex-column">
                    <div className="text-center mb-4">
                      <h3 className="plan-name mb-3">{plan.name}</h3>
                      <div className="price-wrapper">
                        <span className="currency">$</span>
                        <span className="price">{plan.price}</span>
                        <span className="interval">/{plan.interval}</span>
                      </div>
                      {plan.price > 0 && (
                        <p className="text-muted small mt-2">14-day free trial included</p>
                      )}
                    </div>

                    <ListGroup variant="flush" className="mb-4 flex-grow-1">
                      {plan.features.map((feature, index) => (
                        <ListGroup.Item key={index} className="border-0 px-0">
                          <i className="bi bi-check-circle-fill text-success me-2"></i>
                          {feature}
                        </ListGroup.Item>
                      ))}
                      {plan.limitations && plan.limitations.map((limitation, index) => (
                        <ListGroup.Item key={`limit-${index}`} className="border-0 px-0 text-muted">
                          <i className="bi bi-x-circle me-2"></i>
                          {limitation}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>

                    <Button
                      variant={plan.popular ? 'primary' : 'outline-primary'}
                      size="lg"
                      className="w-100"
                      onClick={() => handleSelectPlan(plan)}
                    >
                      {plan.price === 0 ? 'Get Started Free' : 'Start Free Trial'}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <div className="text-center mt-5">
            <p className="text-muted">
              Need a custom plan for your organization?{' '}
              <Link to="/contact" className="text-primary fw-bold">Contact us</Link>
            </p>
          </div>
        </Container>
      </section>

      {/* Comparison Table */}
      <section className="comparison-section py-5 bg-light">
        <Container>
          <h2 className="text-center mb-5">Compare Plans</h2>
          <div className="table-responsive">
            <table className="table table-hover comparison-table">
              <thead>
                <tr>
                  <th>Features</th>
                  <th className="text-center">Free</th>
                  <th className="text-center bg-primary text-white">Pro</th>
                  <th className="text-center">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Number of courses</td>
                  <td className="text-center">10</td>
                  <td className="text-center">Unlimited</td>
                  <td className="text-center">Unlimited</td>
                </tr>
                <tr>
                  <td>Video quality</td>
                  <td className="text-center">720p</td>
                  <td className="text-center">1080p</td>
                  <td className="text-center">4K</td>
                </tr>
                <tr>
                  <td>Downloadable resources</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
                <tr>
                  <td>Offline viewing</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
                <tr>
                  <td>Certificates</td>
                  <td className="text-center">Basic</td>
                  <td className="text-center">Verified</td>
                  <td className="text-center">Verified + Custom</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td className="text-center">Community</td>
                  <td className="text-center">Email (24h)</td>
                  <td className="text-center">24/7 Priority</td>
                </tr>
                <tr>
                  <td>1-on-1 Mentoring</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
                <tr>
                  <td>Custom learning paths</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
                <tr>
                  <td>API access</td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-x text-danger"></i></td>
                  <td className="text-center"><i className="bi bi-check text-success"></i></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Container>
      </section>

      {/* FAQ Section */}
      <section className="faq-section py-5">
        <Container>
          <h2 className="text-center mb-5">Frequently Asked Questions</h2>
          <Row className="justify-content-center">
            <Col lg={8}>
              <Accordion>
                {faqs.map((faq, index) => (
                  <Accordion.Item eventKey={index.toString()} key={index}>
                    <Accordion.Header>{faq.question}</Accordion.Header>
                    <Accordion.Body>{faq.answer}</Accordion.Body>
                  </Accordion.Item>
                ))}
              </Accordion>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col lg={8}>
              <h2 className="mb-3">Ready to start learning?</h2>
              <p className="lead mb-0">
                Join thousands of students already learning on SkillBridge254. Start your free trial today!
              </p>
            </Col>
            <Col lg={4} className="text-lg-end">
              <Button
                variant="light"
                size="lg"
                onClick={() => navigate(user ? '/courses' : '/')}
                className="px-5"
              >
                Get Started Now
              </Button>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
}

export default Pricing;
