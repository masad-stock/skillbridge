import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function EmptyState({ 
    icon = '📦', 
    title = 'No Data Available', 
    message = 'There is nothing to display here.',
    actionLabel,
    actionLink,
    onAction
}) {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-5 text-center">
                <div className="fs-1 mb-3">{icon}</div>
                <h5 className="fw-bold mb-2">{title}</h5>
                <p className="text-muted mb-4">{message}</p>
                {actionLabel && (
                    actionLink ? (
                        <Button as={Link} to={actionLink} variant="primary">
                            {actionLabel}
                        </Button>
                    ) : onAction ? (
                        <Button onClick={onAction} variant="primary">
                            {actionLabel}
                        </Button>
                    ) : null
                )}
            </Card.Body>
        </Card>
    );
}

export default EmptyState;
