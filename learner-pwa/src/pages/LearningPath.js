import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, ProgressBar, Badge, Modal, Alert } from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { useOffline } from '../context/OfflineContext';
import { SKILL_CATEGORIES } from '../services/aiAssessment';
import YouTubePlayer from '../components/YouTubePlayer';
import ContentRenderer from '../components/ContentRenderer';
import InAppViewer from '../components/InAppViewer';
import CompletionCelebration from '../components/CompletionCelebration';
import { learningAPI, certificateAPI } from '../services/api';
import offlineCertificateGenerator from '../services/offlineStorage/OfflineCertificateGenerator';

function LearningPath() {
    const { learningPath, progress, dispatch } = useUser();
    const isOnline = useOffline();
    const [showCelebration, setShowCelebration] = useState(false);
    const [completedModuleTitle, setCompletedModuleTitle] = useState('');
    const location = useLocation();
    const [selectedModule, setSelectedModule] = useState(null);
    const [showModule, setShowModule] = useState(false);
    const [currentLesson, setCurrentLesson] = useState(0);
    const [moduleProgress, setModuleProgress] = useState(0);
    const [lessonProgress, setLessonProgress] = useState({});
    const [videoCompleted, setVideoCompleted] = useState(false);
    const [videoError, setVideoError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [modules, setModules] = useState([]);
    const [certificateGenerated, setCertificateGenerated] = useState(false);
    const [generatedCertificate, setGeneratedCertificate] = useState(null);
    const [showViewer, setShowViewer] = useState(false);
    const [viewerContent, setViewerContent] = useState(null);
    const [materialProgress, setMaterialProgress] = useState({});
    const [autoStartHandled, setAutoStartHandled] = useState(false);

    // Debug: Log when celebration modal state changes
    useEffect(() => {
        console.log('[LearningPath] showCelebration state changed:', showCelebration);
        console.log('[LearningPath] certificateGenerated state changed:', certificateGenerated);
    }, [showCelebration, certificateGenerated]);

    // Load modules from API
    useEffect(() => {
        loadModules();
    }, []);

    // Handle auto-start first module from navigation state (e.g., from assessment completion)
    useEffect(() => {
        if (!autoStartHandled && !loading && modules.length > 0) {
            const autoStartFirst = location.state?.autoStartFirst;
            if (autoStartFirst) {
                // Find the first uncompleted module or just the first module
                const displayModules = learningPath && learningPath.length > 0 ? learningPath : modules;
                const firstModule = displayModules.find(m => !progress[m._id || m.id]?.completed) || displayModules[0];

                if (firstModule) {
                    console.log('Auto-starting first module:', firstModule.title);
                    startModule(firstModule);
                }
                setAutoStartHandled(true);
            }
        }
    }, [loading, modules, learningPath, progress, location.state, autoStartHandled]);

    const loadModules = async () => {
        try {
            setLoading(true);
            const response = await learningAPI.getModules();
            if (response.data && response.data.data) {
                setModules(response.data.data);
            }
        } catch (error) {
            console.error('Failed to load modules:', error);
        } finally {
            setLoading(false);
        }
    };

    const getCategoryName = (category) => {
        const names = {
            [SKILL_CATEGORIES.BASIC_DIGITAL]: 'Basic Digital Skills',
            [SKILL_CATEGORIES.BUSINESS_AUTOMATION]: 'Business Automation',
            [SKILL_CATEGORIES.E_COMMERCE]: 'E-Commerce',
            [SKILL_CATEGORIES.DIGITAL_MARKETING]: 'Digital Marketing',
            [SKILL_CATEGORIES.FINANCIAL_MANAGEMENT]: 'Financial Management',
            [SKILL_CATEGORIES.COMMUNICATION]: 'Communication',
            'basic_digital': 'Basic Digital Skills',
            'business_automation': 'Business Automation',
            'e_commerce': 'E-Commerce',
            'digital_marketing': 'Digital Marketing',
            'financial_management': 'Financial Management',
            'communication': 'Communication'
        };
        return names[category] || category;
    };

    const getCategoryIcon = (category) => {
        const icons = {
            [SKILL_CATEGORIES.BASIC_DIGITAL]: '📱',
            [SKILL_CATEGORIES.BUSINESS_AUTOMATION]: '⚙️',
            [SKILL_CATEGORIES.E_COMMERCE]: '🛒',
            [SKILL_CATEGORIES.DIGITAL_MARKETING]: '📢',
            [SKILL_CATEGORIES.FINANCIAL_MANAGEMENT]: '💰',
            [SKILL_CATEGORIES.COMMUNICATION]: '💬',
            'basic_digital': '📱',
            'business_automation': '⚙️',
            'e_commerce': '🛒',
            'digital_marketing': '📢',
            'financial_management': '💰',
            'communication': '💬'
        };
        return icons[category] || '📚';
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 1: return 'success';
            case 2: return 'warning';
            case 3: return 'info';
            case 4: return 'danger';
            default: return 'secondary';
        }
    };

    const getDifficultyText = (difficulty) => {
        switch (difficulty) {
            case 1: return 'Easy';
            case 2: return 'Medium';
            case 3: return 'Hard';
            case 4: return 'Expert';
            default: return 'Unknown';
        }
    };

    const startModule = (module) => {
        setSelectedModule(module);
        setCurrentLesson(0);
        setModuleProgress(0);
        setLessonProgress({});
        setVideoCompleted(false);
        setVideoError(null);
        setShowModule(true);
    };

    const handleVideoProgress = (progressData) => {
        const lessonKey = `${selectedModule._id}_${currentLesson}`;
        setLessonProgress(prev => ({
            ...prev,
            [lessonKey]: progressData
        }));
    };

    const handleVideoComplete = (completionData) => {
        setVideoCompleted(true);
        const lessonKey = `${selectedModule._id}_${currentLesson}`;
        setLessonProgress(prev => ({
            ...prev,
            [lessonKey]: { ...completionData, completed: true }
        }));
    };

    const handleMaterialClick = (material, moduleId) => {
        setViewerContent({
            url: material.url,
            title: material.title,
            type: material.type,
            moduleId: moduleId,
            materialId: material._id || material.title
        });
        setShowViewer(true);
    };

    const handleMaterialProgress = (progressData) => {
        const key = `${viewerContent.moduleId}_${viewerContent.materialId}`;
        setMaterialProgress(prev => ({
            ...prev,
            [key]: progressData
        }));
    };

    const handleMaterialComplete = (completionData) => {
        const key = `${viewerContent.moduleId}_${viewerContent.materialId}`;
        setMaterialProgress(prev => ({
            ...prev,
            [key]: { ...completionData, completed: true }
        }));
    };

    const handleVideoError = (error) => {
        console.log('Video error:', error);
        setVideoError(error);
    };

    const completeModule = async () => {
        console.log('[LearningPath] completeModule called');
        try {
            // Calculate overall score based on video watch progress
            const lessonScores = Object.values(lessonProgress).map(p => p.progress || 0);
            const averageScore = lessonScores.length > 0
                ? lessonScores.reduce((a, b) => a + b, 0) / lessonScores.length
                : 100;

            const completedAt = new Date().toISOString();
            const score = Math.round(averageScore);
            const totalWatchTime = Object.values(lessonProgress).reduce((total, p) => total + (p.watchTime || 0), 0);

            console.log('[LearningPath] Score calculated:', score);

            const progressData = {
                completed: true,
                completedAt,
                score,
                lessonProgress: lessonProgress,
                totalWatchTime
            };

            // Update progress in context
            dispatch({
                type: 'UPDATE_PROGRESS',
                moduleId: selectedModule._id,
                progress: progressData
            });
            console.log('[LearningPath] Progress updated in context');

            // Get user info for certificate
            const userStr = localStorage.getItem('user') || localStorage.getItem('cachedUser');
            const user = userStr ? JSON.parse(userStr) : null;
            const userName = user?.profile?.firstName
                ? `${user.profile.firstName} ${user.profile.lastName || ''}`.trim()
                : user?.name || user?.email || 'Learner';

            // Extract skills from module
            const skillsAcquired = selectedModule.skills ||
                (selectedModule.content?.skills ? selectedModule.content.skills.map(s => s.name || s) : []) ||
                [];

            let certificateGenerated = false;

            // Try online certificate generation first if online
            if (navigator.onLine) {
                try {
                    console.log('[LearningPath] Attempting online certificate generation...');
                    // First update progress on server
                    await learningAPI.updateProgress(selectedModule._id, {
                        progress: 100,
                        status: 'completed',
                        completedAt,
                        score,
                        timeSpent: totalWatchTime,
                        activity: {
                            type: 'module_completed',
                            timestamp: completedAt,
                            score
                        }
                    });
                    console.log('[LearningPath] Progress updated on server');

                    // Small delay to ensure progress is saved
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Generate certificate online
                    console.log('[LearningPath] Calling certificate API...');
                    const certificateResponse = await certificateAPI.generate(selectedModule._id);
                    console.log('[LearningPath] Certificate API response:', certificateResponse.data);

                    if (certificateResponse.data?.success || certificateResponse.data?.certificate) {
                        const cert = certificateResponse.data.certificate || certificateResponse.data.data;
                        const certificateData = {
                            ...cert,
                            courseName: selectedModule.title,
                            userName: userName
                        };
                        console.log('[LearningPath] Setting certificate data:', certificateData);
                        setGeneratedCertificate(certificateData);
                        setCertificateGenerated(true);
                        certificateGenerated = true;
                        console.log('[LearningPath] Online certificate generated successfully');
                    }
                } catch (onlineError) {
                    console.error('[LearningPath] Online certificate generation failed:', onlineError);
                    console.error('[LearningPath] Error details:', onlineError.response?.data);
                }
            } else {
                console.log('[LearningPath] Offline - skipping online certificate generation');
            }

            // Fallback to offline certificate generation
            if (!certificateGenerated) {
                try {
                    console.log('[LearningPath] Generating offline certificate...');
                    console.log('[LearningPath] Offline cert params:', {
                        userName,
                        courseName: selectedModule.title,
                        completionDate: completedAt,
                        skillsAcquired: skillsAcquired.slice(0, 5),
                        courseId: selectedModule._id,
                        userId: user?._id || user?.id
                    });

                    const offlineCertificate = await offlineCertificateGenerator.generateCertificate({
                        userName: userName,
                        courseName: selectedModule.title,
                        completionDate: completedAt,
                        skillsAcquired: skillsAcquired.slice(0, 5),
                        courseId: selectedModule._id,
                        userId: user?._id || user?.id
                    });

                    const certificateData = {
                        ...offlineCertificate,
                        certificateNumber: offlineCertificate.id,
                        grade: calculateGrade(score),
                        score: score,
                        courseName: selectedModule.title,
                        userName: userName
                    };
                    console.log('[LearningPath] Setting offline certificate data:', certificateData);
                    setGeneratedCertificate(certificateData);
                    setCertificateGenerated(true);
                    console.log('[LearningPath] Offline certificate generated successfully');
                } catch (offlineError) {
                    console.error('[LearningPath] Offline certificate generation failed:', offlineError);
                    console.error('[LearningPath] Offline error stack:', offlineError.stack);

                    // Create a simple fallback certificate for display
                    const fallbackCertificate = {
                        id: `local-${Date.now()}`,
                        certificateNumber: `SB-${new Date().getFullYear()}-LOCAL`,
                        verificationCode: `LOCAL-${Date.now().toString(36).toUpperCase()}`,
                        courseName: selectedModule.title,
                        userName: userName,
                        score: score,
                        grade: calculateGrade(score),
                        completionDate: completedAt,
                        issueDate: completedAt,
                        skillsAcquired: skillsAcquired.slice(0, 5),
                        isLocal: true
                    };
                    console.log('[LearningPath] Setting fallback certificate:', fallbackCertificate);
                    setGeneratedCertificate(fallbackCertificate);
                    setCertificateGenerated(true);
                    console.log('[LearningPath] Fallback certificate created');
                }
            } else {
                console.log('[LearningPath] Skipping offline generation - certificate already generated');
            }

            // Store the module title before clearing selectedModule
            const moduleTitle = selectedModule.title;
            setCompletedModuleTitle(moduleTitle);
            console.log('[LearningPath] Module title stored:', moduleTitle);

            // Close the module modal first
            setShowModule(false);
            console.log('[LearningPath] Module modal closed');

            // Small delay to ensure modal transition completes
            await new Promise(resolve => setTimeout(resolve, 300));

            // Clear selected module
            setSelectedModule(null);

            // Show celebration modal
            console.log('[LearningPath] About to show celebration modal');
            console.log('[LearningPath] Certificate data:', generatedCertificate);
            setShowCelebration(true);
            console.log('[LearningPath] Celebration modal state set to true');
        } catch (error) {
            console.error('[LearningPath] Failed to complete module:', error);
            console.error('[LearningPath] Error stack:', error.stack);
            // Still close modal even if operations fail
            setShowModule(false);
            setSelectedModule(null);
        }
    };
    // Helper function to calculate grade from score
    const calculateGrade = (score) => {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        if (score >= 65) return 'D+';
        if (score >= 60) return 'D';
        return 'F';
    };

    // Use modules from API if learningPath is not available
    const displayModules = learningPath && learningPath.length > 0 ? learningPath : modules;

    if (loading) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading courses...</p>
                    </Col>
                </Row>
            </Container>
        );
    }

    if (!displayModules || displayModules.length === 0) {
        return (
            <Container className="py-5">
                <Row className="justify-content-center">
                    <Col lg={8} className="text-center">
                        <Card className="border-0 shadow-sm">
                            <Card.Body className="p-5">
                                <div className="fs-1 mb-4">📊</div>
                                <h3 className="fw-bold mb-3">No Learning Path Available</h3>
                                <p className="text-muted mb-4">
                                    To get your personalized learning path, you need to complete the skills assessment first.
                                </p>
                                <Button href="/assessment" variant="primary" size="lg">
                                    <span className="me-2">📊</span>
                                    Take Assessment
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        );
    }

    return (
        <Container className="py-5">
            <Row>
                <Col>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-2">
                                <span className="me-2">🎯</span>
                                Your Learning Path
                            </h2>
                            <p className="text-muted">
                                Personalized training modules designed for your skill level
                            </p>
                        </div>
                        {!isOnline && (
                            <Alert variant="warning" className="mb-0">
                                <small>📱 Cached content available</small>
                            </Alert>
                        )}
                    </div>
                </Col>
            </Row>

            <Row>
                {displayModules.map((module) => {
                    const moduleProgress = progress[module._id || module.id];
                    const isCompleted = moduleProgress?.completed || false;
                    const progressPercent = moduleProgress?.score || 0;

                    return (
                        <Col lg={4} md={6} key={module._id || module.id} className="mb-4">
                            <Card className={`h-100 border-0 shadow-sm ${isCompleted ? 'border-success' : ''}`}>
                                {/* Module Image */}
                                <div style={{ height: '200px', overflow: 'hidden' }}>
                                    {module.imageUrl ? (
                                        <img
                                            src={module.imageUrl}
                                            alt={`${module.title} course image`}
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                            onError={(e) => {
                                                e.target.src = `https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&h=600&fit=crop&crop=center`;
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="w-100 h-100 d-flex align-items-center justify-content-center bg-light"
                                            style={{ fontSize: '3rem' }}
                                        >
                                            {getCategoryIcon(module.category)}
                                        </div>
                                    )}
                                </div>

                                <Card.Header className="bg-light border-0 py-3">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <div className="d-flex align-items-center">
                                            <span className="fs-4 me-2">
                                                {getCategoryIcon(module.category)}
                                            </span>
                                            <div>
                                                <h6 className="mb-0 fw-bold">{module.title}</h6>
                                                <small className="text-muted">
                                                    {getCategoryName(module.category)}
                                                </small>
                                            </div>
                                        </div>
                                        {isCompleted && (
                                            <span className="text-success fs-4">✅</span>
                                        )}
                                    </div>
                                </Card.Header>

                                <Card.Body className="p-4">
                                    <p className="text-muted mb-3">{module.description}</p>

                                    <div className="mb-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">Progress</small>
                                            <small className="text-muted">{progressPercent}%</small>
                                        </div>
                                        <ProgressBar
                                            now={progressPercent}
                                            variant={isCompleted ? 'success' : 'primary'}
                                            style={{ height: '6px' }}
                                        />
                                    </div>

                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <Badge bg={getDifficultyColor(module.difficulty)}>
                                            {getDifficultyText(module.difficulty)}
                                        </Badge>
                                        <small className="text-muted">
                                            <span className="me-1">⏱️</span>
                                            {module.estimatedTime || module.baseTime || 60} minutes
                                        </small>
                                    </div>

                                    <div className="mb-3">
                                        {module.recommended && (
                                            <Badge bg="warning" className="me-2">
                                                <span className="me-1">⭐</span>
                                                Recommended
                                            </Badge>
                                        )}
                                        {(module.content?.youtubeUrl || module.youtubeUrl) && (
                                            <Badge bg="danger">
                                                <span className="me-1">▶️</span>
                                                Video Course
                                            </Badge>
                                        )}
                                        {module.content?.materials && module.content.materials.length > 0 && (
                                            <Badge bg="info" className="ms-2">
                                                <span className="me-1">📄</span>
                                                {module.content.materials.length} Materials
                                            </Badge>
                                        )}
                                    </div>

                                    {(module.content?.instructor || module.instructor) && (
                                        <p className="small text-muted mb-2">
                                            <strong>Instructor:</strong> {module.content?.instructor || module.instructor}
                                        </p>
                                    )}
                                </Card.Body>

                                <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                                    <Button
                                        variant={isCompleted ? 'outline-success' : 'primary'}
                                        className="w-100"
                                        onClick={() => startModule(module)}
                                    >
                                        {isCompleted ? (
                                            <>
                                                <span className="me-2">🔄</span>
                                                Retake
                                            </>
                                        ) : (
                                            <>
                                                <span className="me-2">▶️</span>
                                                Start
                                            </>
                                        )}
                                    </Button>
                                </Card.Footer>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Module Learning Modal */}
            <Modal
                show={showModule}
                onHide={() => setShowModule(false)}
                size="lg"
                centered
            >
                {selectedModule && (
                    <>
                        <Modal.Header closeButton className="bg-primary text-white">
                            <Modal.Title>
                                <span className="me-2">{getCategoryIcon(selectedModule.category)}</span>
                                {selectedModule.title}
                            </Modal.Title>
                        </Modal.Header>
                        <Modal.Body className="p-4">
                            <div className="mb-4">
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h5 className="mb-0">Course Content</h5>
                                    <Badge bg="info">
                                        {selectedModule.content?.instructor || selectedModule.instructor || 'Self-paced'}
                                    </Badge>
                                </div>
                                <ProgressBar
                                    now={moduleProgress}
                                    className="mb-3"
                                    style={{ height: '8px' }}
                                />
                            </div>

                            <div className="lesson-content">
                                {/* Module Description */}
                                <div className="mb-4">
                                    <h6 className="fw-bold mb-2">About this course</h6>
                                    <p className="text-muted">{selectedModule.description}</p>
                                </div>

                                {/* Video Content */}
                                {(selectedModule.content?.youtubeUrl || selectedModule.youtubeUrl) && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Video Lesson</h6>
                                        <YouTubePlayer
                                            videoUrl={selectedModule.content?.youtubeUrl || selectedModule.youtubeUrl}
                                            title={selectedModule.title}
                                            instructor={selectedModule.content?.instructor || selectedModule.instructor}
                                            duration={selectedModule.estimatedTime || selectedModule.baseTime}
                                            onProgress={handleVideoProgress}
                                            onComplete={handleVideoComplete}
                                            onError={handleVideoError}
                                            autoplay={false}
                                            debugMode={false}
                                            enableAdaptiveQuality={true}
                                            enableOfflineSupport={true}
                                            enableNetworkDetection={true}
                                        />
                                    </div>
                                )}

                                {/* Text Content */}
                                {selectedModule.content?.textContent && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Course Materials</h6>
                                        <div className="bg-light p-3 rounded">
                                            <ContentRenderer
                                                content={selectedModule.content.textContent}
                                                moduleId={selectedModule._id}
                                                lessonId="main-content"
                                                enableAccessibility={true}
                                                enableResponsive={true}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Additional Materials */}
                                {selectedModule.content?.materials && selectedModule.content.materials.length > 0 && (
                                    <div className="mb-4">
                                        <h6 className="fw-bold mb-3">Additional Resources</h6>
                                        <div className="row">
                                            {selectedModule.content.materials.map((material, index) => {
                                                const progressKey = `${selectedModule._id}_${material._id || material.title}`;
                                                const materialProgressData = materialProgress[progressKey];
                                                const isCompleted = materialProgressData?.completed || false;

                                                return (
                                                    <div key={index} className="col-md-6 mb-3">
                                                        <Card className={`border-0 shadow-sm ${isCompleted ? 'border-success' : ''}`}>
                                                            <Card.Body className="p-3">
                                                                <div className="d-flex align-items-center">
                                                                    <span className="fs-4 me-3">
                                                                        {material.type === 'pdf' && '📄'}
                                                                        {material.type === 'video' && '🎥'}
                                                                        {material.type === 'document' && '📝'}
                                                                        {material.type === 'image' && '🖼️'}
                                                                        {!['pdf', 'video', 'document', 'image'].includes(material.type) && '📎'}
                                                                    </span>
                                                                    <div className="flex-grow-1">
                                                                        <h6 className="mb-1">{material.title}</h6>
                                                                        <small className="text-muted">
                                                                            {material.type} • {material.size ? `${Math.round(material.size / 1024)} KB` : 'Unknown size'}
                                                                        </small>
                                                                        {materialProgressData && (
                                                                            <div className="mt-2">
                                                                                <div className="d-flex justify-content-between align-items-center mb-1">
                                                                                    <small className="text-muted">Progress</small>
                                                                                    <small className="text-muted">{Math.round(materialProgressData.progress || 0)}%</small>
                                                                                </div>
                                                                                <ProgressBar
                                                                                    now={materialProgressData.progress || 0}
                                                                                    variant={isCompleted ? 'success' : 'primary'}
                                                                                    style={{ height: '4px' }}
                                                                                />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <div className="d-flex flex-column gap-2">
                                                                        <Button
                                                                            variant="primary"
                                                                            size="sm"
                                                                            onClick={() => handleMaterialClick(material, selectedModule._id)}
                                                                        >
                                                                            {isCompleted ? '✅ View' : '👁️ View'}
                                                                        </Button>
                                                                        <Button
                                                                            variant="outline-secondary"
                                                                            size="sm"
                                                                            onClick={() => window.open(material.url, '_blank')}
                                                                        >
                                                                            🔗 External
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </Card.Body>
                                                        </Card>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Video Error State */}
                                {videoError && (
                                    <Alert variant="warning" className="mb-4">
                                        <Alert.Heading className="h6">
                                            <span className="me-2">⚠️</span>
                                            Video Playback Issue
                                        </Alert.Heading>
                                        <p className="mb-2">
                                            There was an issue playing the video. You can still access the course materials above.
                                        </p>
                                        <small className="text-muted">Error: {videoError.message}</small>
                                    </Alert>
                                )}
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-4">
                                <small className="text-muted">
                                    <span className="me-1">⏱️</span>
                                    Duration: {selectedModule.estimatedTime || selectedModule.baseTime || 60} minutes
                                </small>
                                <div className="d-flex align-items-center gap-2">
                                    {(selectedModule.content?.youtubeUrl || selectedModule.youtubeUrl) && !videoCompleted && (
                                        <small className="text-warning">
                                            <span className="me-1">⏳</span>
                                            Complete video to finish course
                                        </small>
                                    )}
                                    {videoCompleted && (
                                        <small className="text-success">
                                            <span className="me-1">✅</span>
                                            Video completed
                                        </small>
                                    )}
                                    <Button
                                        variant="primary"
                                        onClick={completeModule}
                                        disabled={(selectedModule.content?.youtubeUrl || selectedModule.youtubeUrl) && !videoCompleted}
                                    >
                                        <span className="me-2">✅</span>
                                        Complete Course
                                    </Button>
                                </div>
                            </div>
                        </Modal.Body>
                    </>
                )}
            </Modal>
            {/* In-App Content Viewer */}
            {viewerContent && (
                <InAppViewer
                    show={showViewer}
                    onHide={() => setShowViewer(false)}
                    url={viewerContent.url}
                    title={viewerContent.title}
                    type={viewerContent.type}
                    moduleId={viewerContent.moduleId}
                    materialId={viewerContent.materialId}
                    onProgress={handleMaterialProgress}
                    onComplete={handleMaterialComplete}
                />
            )}

            {/* Completion Celebration Modal */}
            <CompletionCelebration
                show={showCelebration || certificateGenerated}
                onHide={() => {
                    setShowCelebration(false);
                    setCertificateGenerated(false);
                    setCompletedModuleTitle('');
                }}
                courseTitle={generatedCertificate?.courseName || completedModuleTitle || 'Course'}
                certificate={generatedCertificate}
                score={generatedCertificate?.score}
                timeSpent={Object.values(lessonProgress).reduce((total, p) => total + (p.watchTime || 0), 0)}
            />
        </Container>
    );
}

export default LearningPath;