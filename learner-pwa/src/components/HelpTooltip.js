import { OverlayTrigger, Tooltip } from 'react-bootstrap';

function HelpTooltip({ text, placement = 'top', children, ...props }) {
    const tooltip = (
        <Tooltip id={`tooltip-${text}`} {...props}>
            {text}
        </Tooltip>
    );

    return (
        <OverlayTrigger placement={placement} overlay={tooltip}>
            {children || (
                <span className="text-muted ms-1" style={{ cursor: 'help' }}>
                    <small>ℹ️</small>
                </span>
            )}
        </OverlayTrigger>
    );
}

export default HelpTooltip;
