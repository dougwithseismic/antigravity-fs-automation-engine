import { useState } from 'react';
import { GoogleSearchMockup } from './GoogleSearchMockup';
import { LandingPageMockup } from './LandingPageMockup';
import './ClientNodes.css';

interface ClientNodeRendererProps {
    node: {
        id: string;
        type: string;
        data?: any;
    };
    onSubmit: (data: any) => void;
    stepInfo?: { current: number; total: number }; // e.g., "Step 2 of 4"
}

/**
 * Generic renderer for client-side nodes
 * Handles all node types that execute in the browser
 */
export function ClientNodeRenderer({ node, onSubmit, stepInfo }: ClientNodeRendererProps) {
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [landingPageData, setLandingPageData] = useState<{
        source: 'ppc' | 'shopping' | 'organic';
        utmParams: Record<string, string>;
    } | null>(null);

    const handleSubmit = (additionalData?: any) => {
        onSubmit({
            ...formData,
            ...additionalData,
            nodeId: node.id,
            nodeType: node.type,
            submittedAt: new Date().toISOString()
        });
    };

    // Render based on node type
    switch (node.type) {
        case 'banner-form':
            return (
                <div className="client-node-widget banner-form-widget">
                    <div className="widget-header">
                        <div className="widget-header-content">
                            <span className="widget-icon">📝</span>
                            <div className="widget-title-group">
                                <h3>{node.data?.label || 'Form'}</h3>
                                {stepInfo && (
                                    <span className="step-badge">Step {stepInfo.current} of {stepInfo.total}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="widget-body">
                        <p className="widget-message">{node.data?.message || 'Please fill out the form below'}</p>
                        <input
                            type="text"
                            className="input-field"
                            placeholder="Your name"
                            value={formData.name || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        />
                        <input
                            type="email"
                            className="input-field"
                            placeholder="Your email"
                            value={formData.email || ''}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        />
                        <button
                            className="submit-button primary"
                            onClick={() => handleSubmit()}
                            disabled={!formData.email}
                        >
                            {node.data?.submitText || 'Submit'}
                        </button>
                    </div>
                </div>
            );

        case 'window-alert':
            return (
                <div className="client-node-widget alert-widget">
                    <div className="widget-header alert">
                        <div className="widget-header-content">
                            <span className="widget-icon">💬</span>
                            <div className="widget-title-group">
                                <h3>{node.data?.label || 'Alert'}</h3>
                                {stepInfo && (
                                    <span className="step-badge">Step {stepInfo.current} of {stepInfo.total}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="widget-body">
                        <div className="alert-message">
                            {node.data?.message || 'Operation completed successfully!'}
                        </div>
                        <button
                            className="submit-button success"
                            onClick={() => handleSubmit({ acknowledged: true })}
                        >
                            OK
                        </button>
                    </div>
                </div>
            );

        case 'start':
            return (
                <div className="client-node-widget start-widget">
                    <div className="widget-header">
                        <div className="widget-header-content">
                            <span className="widget-icon">🚀</span>
                            <div className="widget-title-group">
                                <h3>{node.data?.label || 'Start'}</h3>
                                {stepInfo && (
                                    <span className="step-badge">Step {stepInfo.current} of {stepInfo.total}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="widget-body">
                        <p className="widget-message">{node.data?.message || 'Click Continue to begin the workflow'}</p>
                        <button
                            className="submit-button"
                            onClick={() => handleSubmit({ started: true })}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            );

        case 'google-search':
            // If landing page data is set, show the landing page
            if (landingPageData) {
                return (
                    <LandingPageMockup
                        source={landingPageData.source}
                        utmParams={landingPageData.utmParams}
                        onContinue={(data) => handleSubmit(data)}
                    />
                );
            }

            // Otherwise show the Google search results
            return (
                <GoogleSearchMockup
                    onResultClick={(source, utmParams) => {
                        setLandingPageData({ source, utmParams });
                    }}
                />
            );

        default:
            return (
                <div className="client-node-widget default-widget">
                    <div className="widget-header">
                        <div className="widget-header-content">
                            <span className="widget-icon">⚡</span>
                            <div className="widget-title-group">
                                <h3>{node.data?.label || node.type.replace(/-/g, ' ').toUpperCase()}</h3>
                                {stepInfo && (
                                    <span className="step-badge">Step {stepInfo.current} of {stepInfo.total}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="widget-body">
                        <div className="node-data">
                            <pre>{JSON.stringify(node.data, null, 2)}</pre>
                        </div>
                        <button
                            className="submit-button"
                            onClick={() => handleSubmit({ executed: true })}
                        >
                            Continue
                        </button>
                    </div>
                </div>
            );
    }
}
