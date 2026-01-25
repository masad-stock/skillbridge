import { Badge } from 'react-bootstrap';

function VersionInfo() {
    const version = process.env.REACT_APP_VERSION || '1.0.0';
    const environment = process.env.REACT_APP_ENVIRONMENT || 'development';
    const researchCode = process.env.REACT_APP_RESEARCH_CODE || 'MIT/2025/42733';

    if (environment === 'production') {
        return null; // Hide in production
    }

    return (
        <div className="position-fixed bottom-0 end-0 p-2" style={{ zIndex: 1050 }}>
            <div className="d-flex gap-2 flex-wrap justify-content-end">
                <Badge bg="secondary" className="small">
                    v{version}
                </Badge>
                <Badge bg={environment === 'production' ? 'success' : 'warning'} className="small">
                    {environment}
                </Badge>
                <Badge bg="info" className="small" title="Research Project Code">
                    {researchCode}
                </Badge>
            </div>
        </div>
    );
}

export default VersionInfo;
