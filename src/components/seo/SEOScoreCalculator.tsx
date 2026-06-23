import { useState } from 'react';
import { C, glassStyle } from '../../lib/tokens';
import { analyzeSEO } from '../../lib/seoAnalyzer';
import type { SEOAnalysis } from '../../types/seo';
import {
  Search, Gauge, CheckCircle, XCircle, AlertTriangle, Zap, Loader2
} from 'lucide-react';

export function SEOScoreCalculator() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SEOAnalysis | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setError('');
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      const data = await analyzeSEO(targetUrl);
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return '#22c55e';
    if (score >= 70) return '#3b82f6';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: C.text, margin: '0 0 8px' }}>
          SEO Score Calculator
        </h2>
        <p style={{ fontSize: '14px', color: C.textSoft, margin: 0 }}>
          Analyze your website's SEO score across all key factors
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, ...glassStyle, padding: '4px 4px 4px 14px' }}>
          <Search size={16} color={C.textMuted} />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter website URL..."
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: '14px', outline: 'none', padding: '10px 0' }}
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading || !url.trim()}
          style={{
            background: 'linear-gradient(135deg, #D4A853, #7A5520)',
            color: '#0A0E1A', border: 'none', borderRadius: 12,
            padding: '10px 20px', fontSize: '14px', fontWeight: 700,
            cursor: loading || !url.trim() ? 'not-allowed' : 'pointer',
            opacity: loading || !url.trim() ? 0.6 : 1,
          }}
        >
          {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Gauge size={16} />}
        </button>
      </div>

      {error && (
        <div style={{ ...glassStyle, padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16, color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {result && (
        <div>
          {/* Overall Score */}
          <div style={{ ...glassStyle, padding: '24px', marginBottom: 16, textAlign: 'center' }}>
            <div style={{ fontSize: '14px', color: C.textSoft, marginBottom: 8 }}>Overall SEO Score</div>
            <div style={{ fontSize: '56px', fontWeight: 800, color: getScoreColor(result.score), lineHeight: 1 }}>
              {result.score}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(result.score), marginTop: 4 }}>
              {result.score >= 90 ? 'Excellent' : result.score >= 70 ? 'Good' : result.score >= 50 ? 'Needs Work' : 'Critical'}
            </div>
          </div>

          {/* Individual Scores */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
            {[
              { label: 'Meta Tags', score: result.metaTags.title.optimal && result.metaTags.description.optimal ? 85 : 55, icon: Zap },
              { label: 'Headings', score: result.headings.structure === 'good' ? 88 : 62, icon: Zap },
              { label: 'Images', score: Math.floor((result.images.withAlt / Math.max(1, result.images.total)) * 100), icon: Zap },
              { label: 'Performance', score: result.performance.score, icon: Zap },
              { label: 'Mobile', score: result.mobile.score, icon: Zap },
              { label: 'Security', score: result.security.score, icon: Zap },
              { label: 'Backlinks', score: result.backlinks.score, icon: Zap },
              { label: 'Keywords', score: result.keywords.score, icon: Zap },
              { label: 'Traffic', score: result.traffic.score, icon: Zap },
              { label: 'Sitemap', score: result.sitemap.present ? 80 : 30, icon: Zap },
            ].map((item, i) => (
              <div key={i} style={{ ...glassStyle, padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>{item.label}</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: getScoreColor(item.score) }}>{item.score}</span>
                </div>
                <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${item.score}%`, height: '100%', background: getScoreColor(item.score), borderRadius: 2, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>

          {/* Issues */}
          {result.issues.length > 0 && (
            <div style={{ ...glassStyle, padding: '16px', marginBottom: 16 }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#ef4444', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={16} /> Issues Found
              </h3>
              {result.issues.map((issue, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(239,68,68,0.08)', borderRadius: 8, marginBottom: 6 }}>
                  <XCircle size={14} color="#ef4444" />
                  <span style={{ fontSize: '13px', color: C.text }}>{issue}</span>
                </div>
              ))}
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div style={{ ...glassStyle, padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#3b82f6', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle size={16} /> Recommendations
              </h3>
              {result.recommendations.map((rec, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(59,130,246,0.08)', borderRadius: 8, marginBottom: 6 }}>
                  <CheckCircle size={14} color="#3b82f6" />
                  <span style={{ fontSize: '13px', color: C.text }}>{rec}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
