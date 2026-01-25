# SkillBridge ML Service

Machine Learning microservice for adaptive learning, personalized recommendations, and predictive analytics.

## Features

- **Skills Assessment**: ML-powered competency evaluation
- **Content Recommendation**: Personalized learning path generation
- **Dropout Prediction**: Early warning system for at-risk learners
- **Learning Analytics**: Advanced analytics and insights

## Technology Stack

- **Framework**: FastAPI
- **ML Libraries**: scikit-learn, TensorFlow
- **Model Management**: MLflow
- **Data Processing**: pandas, numpy

## Setup

### Prerequisites

- Python 3.11+
- pip or conda

### Installation

1. Create virtual environment:
```bash
cd ml-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the service:
```bash
python main.py
```

The service will be available at `http://localhost:8000`

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop service
docker-compose down
```

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- Health Check: `http://localhost:8000/health`

## API Endpoints

### Health & Info
- `GET /health` - Service health check
- `GET /models/info` - Information about loaded models

### Assessment (Coming in Task 1.2)
- `POST /ml/assess-competency` - Assess user competency
- `POST /ml/predict-dropout` - Predict dropout risk

### Recommendations (Coming in Task 1.2)
- `POST /ml/recommend-content` - Get personalized recommendations
- `POST /ml/generate-learning-path` - Generate learning path

## Authentication

All endpoints (except `/health` and `/`) require API key authentication:

```bash
curl -H "X-API-Key: your-api-key" http://localhost:8000/models/info
```

## Development

### Project Structure

```
ml-service/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── Dockerfile             # Docker configuration
├── docker-compose.yml     # Docker Compose setup
├── api/                   # API endpoints
│   ├── assessment_api.py  # Assessment endpoints
│   ├── recommendation_api.py  # Recommendation endpoints
│   └── analytics_api.py   # Analytics endpoints
├── models/                # ML models
│   ├── assessment_classifier.py
│   ├── recommendation_engine.py
│   └── dropout_predictor.py
├── training/              # Model training scripts
│   ├── train_assessment_model.py
│   └── data_preprocessing.py
└── utils/                 # Utility functions
    ├── feature_engineering.py
    └── model_loader.py
```

### Running Tests

```bash
pytest
```

### Model Training

Model training scripts will be added in Task 1.1.

## Integration with Node.js Backend

The Node.js backend communicates with this service via the `mlServiceClient.js`:

```javascript
const mlService = require('./services/mlServiceClient');

// Assess competency
const result = await mlService.assessCompetency(userId, responses, timings, confidence);

// Get recommendations
const recommendations = await mlService.getRecommendations(userId, currentModule, performance, context);

// Predict dropout
const prediction = await mlService.predictDropout(userId, engagementMetrics, performanceHistory);
```

## Circuit Breaker

The ML service client implements a circuit breaker pattern:
- **CLOSED**: Normal operation
- **OPEN**: Service unavailable, fallback to rule-based algorithms
- **HALF_OPEN**: Testing if service recovered

## Fallback Mechanisms

When ML service is unavailable, the system automatically falls back to rule-based algorithms to ensure continuous operation.

## Monitoring

- Health checks: `GET /health`
- Model metrics: Available via MLflow UI
- Logs: JSON-formatted logs in `logs/ml-service.log`

## Performance

- Target inference time: < 500ms
- Batch prediction support
- Model caching for faster responses
- Request timeout: 30 seconds

## Security

- API key authentication
- CORS configuration
- Input validation
- Rate limiting (to be implemented)

## License

Part of the SkillBridge platform.
