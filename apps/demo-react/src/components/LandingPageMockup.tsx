import './LandingPageMockup.css';

interface LandingPageMockupProps {
    source: 'ppc' | 'shopping' | 'organic';
    utmParams: Record<string, string>;
    onContinue: (data: any) => void;
}

export function LandingPageMockup({ source, utmParams, onContinue }: LandingPageMockupProps) {
    const getSourceConfig = () => {
        switch (source) {
            case 'ppc':
                return {
                    title: 'PPC Landing Page',
                    headline: '🎯 Special 25% OFF for Paid Traffic!',
                    subheadline: 'Limited Time Offer - PPC Visitors Only',
                    description: 'You came from a paid ad, so you get our best discount!',
                    workflowPath: 'PPC Path → Show Special Offer → Generate 25% Code → Display Code',
                    bgColor: '#e3f2fd',
                    accentColor: '#1976d2'
                };
            case 'shopping':
                return {
                    title: 'Shopping Landing Page',
                    headline: '🛍️ Product-Specific Offer',
                    subheadline: 'Shopping Ad Visitors Get 15% OFF',
                    description: 'You clicked on a shopping ad, so we have a special product offer for you!',
                    workflowPath: 'Shopping Path → Product Landing → Generate 15% Code → Add to Cart',
                    bgColor: '#fff3e0',
                    accentColor: '#f57c00'
                };
            case 'organic':
                return {
                    title: 'Organic Landing Page',
                    headline: '📧 Join Our Newsletter',
                    subheadline: 'Welcome Organic Visitor!',
                    description: 'You found us through search! Sign up for our newsletter to get updates.',
                    workflowPath: 'Organic Path → Track Visit → Send Nurture Email → Follow-up Sequence',
                    bgColor: '#f1f8e9',
                    accentColor: '#689f38'
                };
        }
    };

    const config = getSourceConfig();

    return (
        <div className="landing-page-mockup" style={{ background: config.bgColor }}>
            {/* Browser Chrome */}
            <div className="browser-chrome">
                <div className="browser-dots">
                    <span className="dot red"></span>
                    <span className="dot yellow"></span>
                    <span className="dot green"></span>
                </div>
                <div className="browser-url">
                    <span className="lock-icon">🔒</span>
                    <span className="url-text">
                        www.example.com/?{Object.entries(utmParams).map(([key, value]) =>
                            `${key}=${value}`).join('&')}
                    </span>
                </div>
            </div>

            {/* Page Content */}
            <div className="landing-content">
                <div className="landing-hero" style={{ borderLeft: `4px solid ${config.accentColor}` }}>
                    <h1>{config.headline}</h1>
                    <h2>{config.subheadline}</h2>
                    <p className="hero-description">{config.description}</p>
                </div>

                {/* UTM Parameters Display */}
                <div className="utm-display">
                    <h3>🔍 Detected UTM Parameters</h3>
                    <div className="utm-grid">
                        {Object.entries(utmParams).map(([key, value]) => (
                            <div key={key} className="utm-param">
                                <span className="param-key">{key}</span>
                                <span className="param-value">{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Workflow Path */}
                <div className="workflow-path">
                    <h3>⚡ Workflow Execution Path</h3>
                    <div className="path-steps">
                        {config.workflowPath.split('→').map((step, idx, arr) => (
                            <div key={idx} className="path-step">
                                <div className="step-content" style={{ background: config.bgColor }}>
                                    {step.trim()}
                                </div>
                                {idx < arr.length - 1 && <div className="step-arrow">→</div>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Source Explanation */}
                <div className="source-explanation">
                    <h3>📊 Traffic Source Analysis</h3>
                    <div className="explanation-grid">
                        <div className="explanation-item">
                            <strong>Traffic Source:</strong>
                            <span className="badge" style={{ background: config.accentColor }}>
                                {source.toUpperCase()}
                            </span>
                        </div>
                        <div className="explanation-item">
                            <strong>Campaign Type:</strong>
                            <span>{utmParams.utm_medium || 'N/A'}</span>
                        </div>
                        <div className="explanation-item">
                            <strong>Workflow Branch:</strong>
                            <span>{source === 'ppc' ? 'Premium Offer' : source === 'shopping' ? 'Product Focus' : 'Content Nurture'}</span>
                        </div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="landing-cta"
                    style={{ background: config.accentColor }}
                    onClick={() => onContinue({
                        source,
                        utmParams,
                        acknowledged: true,
                        timestamp: new Date().toISOString()
                    })}
                >
                    Continue to See {source === 'organic' ? 'Email' : 'Discount Code'} →
                </button>

                {/* Info Box */}
                <div className="info-box">
                    <div className="info-icon">💡</div>
                    <div className="info-text">
                        <strong>What's happening?</strong>
                        <p>
                            Based on your traffic source (<strong>{source}</strong>), the workflow has automatically
                            routed you to the appropriate path. Different UTM parameters trigger different
                            marketing automation sequences.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
