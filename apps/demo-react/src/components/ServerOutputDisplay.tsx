interface ServerOutputDisplayProps {
    nodeResults: Record<string, any>;
    nodes: any[];
}

/**
 * Display server-side node outputs in a user-friendly way
 * Shows discount codes, analytics events, etc.
 */
export function ServerOutputDisplay({ nodeResults, nodes }: ServerOutputDisplayProps) {
    const discountNodes = nodes.filter(n => n.type === 'discount');
    const analyticsNodes = nodes.filter(n => n.type === 'analytics');
    const emailNodes = nodes.filter(n => n.type === 'email');

    const discountCodes = discountNodes
        .map(n => nodeResults[n.id])
        .filter(Boolean)
        .filter(r => r.code);

    const analyticsEvents = analyticsNodes
        .map(n => ({ id: n.id, ...nodeResults[n.id] }))
        .filter(r => r.eventName);

    const emailsSent = emailNodes
        .map(n => ({ id: n.id, ...nodeResults[n.id] }))
        .filter(r => r.sent || r.queued);

    return (
        <div className="server-output-display">
            {discountCodes.length > 0 && (
                <div className="output-section">
                    <h4>🎁 Discount Codes</h4>
                    {discountCodes.map((discount, idx) => (
                        <div key={idx} className="discount-card">
                            <div className="discount-code">{discount.code}</div>
                            <div className="discount-details">
                                {discount.percentage}% off • Expires {new Date(discount.expiresAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {analyticsEvents.length > 0 && (
                <div className="output-section">
                    <h4>📊 Analytics</h4>
                    {analyticsEvents.map((event, idx) => (
                        <div key={idx} className="analytics-event">
                            <span className="event-name">{event.eventName}</span>
                            <span className="event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </div>
            )}

            {emailsSent.length > 0 && (
                <div className="output-section">
                    <h4>📧 Emails</h4>
                    {emailsSent.map((email, idx) => (
                        <div key={idx} className="email-sent">
                            <span>Email sent via {email.provider}</span>
                            <span className="email-template">{email.templateId}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
