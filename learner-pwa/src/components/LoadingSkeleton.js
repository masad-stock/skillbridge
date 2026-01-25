import { Card, Placeholder } from 'react-bootstrap';

export function CardSkeleton() {
    return (
        <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-light border-0 py-3">
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={6} />
                </Placeholder>
            </Card.Header>
            <Card.Body>
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-3" />
                    <Placeholder xs={8} className="mb-3" />
                    <Placeholder xs={10} />
                </Placeholder>
            </Card.Body>
        </Card>
    );
}

export function ModuleCardSkeleton() {
    return (
        <Card className="h-100 border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-3">
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={8} className="mb-2" />
                    <Placeholder xs={5} />
                </Placeholder>
            </Card.Header>
            <Card.Body className="p-4">
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={12} className="mb-3" />
                    <Placeholder xs={10} className="mb-3" />
                    <Placeholder xs={12} style={{ height: '6px' }} className="mb-3" />
                    <Placeholder xs={6} className="mb-2" />
                    <Placeholder xs={8} />
                </Placeholder>
            </Card.Body>
            <Card.Footer className="bg-transparent border-0 p-4 pt-0">
                <Placeholder.Button variant="primary" xs={12} />
            </Card.Footer>
        </Card>
    );
}

export function DashboardSkeleton() {
    return (
        <div>
            <Placeholder as="div" animation="glow" className="mb-4">
                <Placeholder xs={4} style={{ height: '40px' }} />
            </Placeholder>
            <div className="row mb-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="col-md-3 mb-3">
                        <Card className="border-0 bg-primary text-white h-100">
                            <Card.Body className="text-center">
                                <Placeholder as="div" animation="glow">
                                    <Placeholder xs={2} className="mb-3" style={{ height: '30px' }} />
                                    <Placeholder xs={4} className="mb-2" />
                                    <Placeholder xs={6} />
                                </Placeholder>
                            </Card.Body>
                        </Card>
                    </div>
                ))}
            </div>
            <CardSkeleton />
        </div>
    );
}

export function ProfileSkeleton() {
    return (
        <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light border-0 py-4">
                <Placeholder as="div" animation="glow">
                    <Placeholder xs={4} style={{ height: '30px' }} />
                    <Placeholder xs={8} className="mt-2" />
                </Placeholder>
            </Card.Header>
            <Card.Body className="p-4">
                <div className="row">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="col-md-6 mb-3">
                            <Placeholder as="div" animation="glow">
                                <Placeholder xs={3} className="mb-2" />
                                <Placeholder xs={8} />
                            </Placeholder>
                        </div>
                    ))}
                </div>
            </Card.Body>
        </Card>
    );
}

export default CardSkeleton;
