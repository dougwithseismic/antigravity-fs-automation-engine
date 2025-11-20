import { useState } from 'react';
import './GoogleSearchMockup.css';

interface GoogleSearchMockupProps {
    onResultClick: (source: 'ppc' | 'shopping' | 'organic', utmParams: Record<string, string>) => void;
}

export function GoogleSearchMockup({ onResultClick }: GoogleSearchMockupProps) {
    const [searchQuery] = useState('best running shoes 2025');

    const handlePPCClick = () => {
        onResultClick('ppc', {
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'running_shoes_brand',
            utm_content: 'text_ad_1',
            gclid: 'Cj0KCQiA1'
        });
    };

    const handleShoppingClick = () => {
        onResultClick('shopping', {
            utm_source: 'google',
            utm_medium: 'cpc',
            utm_campaign: 'shopping_running_shoes',
            utm_content: 'product_ad',
            gclid: 'Cj0KCQiA2'
        });
    };

    const handleOrganicClick = () => {
        onResultClick('organic', {
            utm_source: 'google',
            utm_medium: 'organic'
        });
    };

    return (
        <div className="google-mockup">
            {/* Google Header */}
            <div className="google-header">
                <div className="google-logo">
                    <span className="g-blue">G</span>
                    <span className="g-red">o</span>
                    <span className="g-yellow">o</span>
                    <span className="g-blue">g</span>
                    <span className="g-green">l</span>
                    <span className="g-red">e</span>
                </div>
                <div className="search-bar">
                    <input type="text" value={searchQuery} readOnly />
                    <button className="search-icon">🔍</button>
                </div>
            </div>

            {/* Search Results */}
            <div className="search-results">
                {/* PPC Ads */}
                <div className="results-section">
                    <div className="ad-result" onClick={handlePPCClick}>
                        <div className="ad-badge">Ad</div>
                        <div className="result-url">www.premiumrunners.com</div>
                        <div className="result-title">Premium Running Shoes - Free Shipping | 30% Off Today</div>
                        <div className="result-description">
                            Shop the latest running shoes from top brands. Get 30% off your first order.
                            Free returns. Fast shipping. Limited time offer!
                        </div>
                        <div className="utm-preview">
                            <span className="utm-tag">utm_source=google</span>
                            <span className="utm-tag">utm_medium=cpc</span>
                            <span className="utm-tag">utm_campaign=running_shoes_brand</span>
                        </div>
                    </div>
                </div>

                {/* Shopping Results */}
                <div className="results-section shopping-section">
                    <div className="section-header">Shopping results</div>
                    <div className="shopping-results">
                        <div className="shopping-card" onClick={handleShoppingClick}>
                            <div className="product-image">👟</div>
                            <div className="product-info">
                                <div className="product-price">$89.99</div>
                                <div className="product-name">Nike Air Zoom</div>
                                <div className="product-store">RunnerStore.com</div>
                            </div>
                            <div className="ad-badge small">Sponsored</div>
                        </div>
                        <div className="shopping-card" onClick={handleShoppingClick}>
                            <div className="product-image">👟</div>
                            <div className="product-info">
                                <div className="product-price">$119.99</div>
                                <div className="product-name">Adidas Ultraboost</div>
                                <div className="product-store">SportGear.com</div>
                            </div>
                            <div className="ad-badge small">Sponsored</div>
                        </div>
                        <div className="shopping-card" onClick={handleShoppingClick}>
                            <div className="product-image">👟</div>
                            <div className="product-info">
                                <div className="product-price">$74.99</div>
                                <div className="product-name">New Balance 1080</div>
                                <div className="product-store">AthleteHub.com</div>
                            </div>
                            <div className="ad-badge small">Sponsored</div>
                        </div>
                    </div>
                    <div className="utm-preview">
                        <span className="utm-tag">utm_source=google</span>
                        <span className="utm-tag">utm_medium=cpc</span>
                        <span className="utm-tag">utm_campaign=shopping_running_shoes</span>
                    </div>
                </div>

                {/* Organic Results */}
                <div className="results-section">
                    <div className="organic-result" onClick={handleOrganicClick}>
                        <div className="result-url">www.runningmagazine.com</div>
                        <div className="result-title">Best Running Shoes of 2025: Expert Reviews & Buying Guide</div>
                        <div className="result-description">
                            Jan 15, 2025 — Our expert team tested 50+ running shoes to find the best options for
                            every runner. Compare top models, read reviews, and find your perfect fit.
                        </div>
                        <div className="utm-preview">
                            <span className="utm-tag">utm_source=google</span>
                            <span className="utm-tag">utm_medium=organic</span>
                        </div>
                    </div>

                    <div className="organic-result" onClick={handleOrganicClick}>
                        <div className="result-url">www.runnersworld.com</div>
                        <div className="result-title">2025 Running Shoe Reviews - Runner's World</div>
                        <div className="result-description">
                            Find the perfect running shoe for your needs. Our comprehensive reviews cover
                            cushioning, stability, weight, and performance for all types of runners.
                        </div>
                    </div>

                    <div className="organic-result" onClick={handleOrganicClick}>
                        <div className="result-url">www.youtube.com</div>
                        <div className="result-title">Top 10 Running Shoes 2025 - YouTube</div>
                        <div className="result-description">
                            Dec 28, 2024 — Watch our in-depth review and comparison of the best running shoes
                            for 2025. See them in action and get expert recommendations.
                        </div>
                    </div>
                </div>

                {/* Helper Text */}
                <div className="helper-text">
                    <div className="helper-icon">💡</div>
                    <div className="helper-content">
                        <strong>Click any result</strong> to see how different traffic sources trigger different workflow paths:
                        <ul>
                            <li><strong>PPC Ad</strong> → Special 25% discount offer</li>
                            <li><strong>Shopping Result</strong> → Product-specific landing page</li>
                            <li><strong>Organic Result</strong> → Standard nurture email sequence</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
