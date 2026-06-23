import { useState, useEffect } from 'react';
import { useStore } from '../lib/store';
import { C, glassStyle } from '../lib/tokens';
import { analyzeSEO } from '../lib/seoAnalyzer';
import type { SEOAnalysis } from '../types/seo';
import {
  Search, ArrowLeft, Zap, Globe, KeyRound, Tags, Link2,
  Map, Shield, FileText, Smartphone, Gauge, Activity,
  CheckCircle, XCircle, AlertTriangle, Info,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  Hash, Eye, Lock, Loader2, Award
} from 'lucide-react';

const TOOLS = [
  { id: 'seo-score', label: 'SEO Score Calculator', icon: Zap },
  { id: 'traffic', label: 'Traffic Checker', icon: Globe },
  { id: 'keywords', label: 'Keyword Checker', icon: KeyRound },
  { id: 'meta', label: 'Meta Tags Validator', icon: Tags },
  { id: 'backlinks', label: 'Backlink Checker', icon: Link2 },
  { id: 'sitemap', label: 'Sitemap Checker', icon: Map },
  { id: 'robots', label: 'Robots.txt Checker', icon: FileText },
  { id: 'ssl', label: 'SSL Checker', icon: Shield },
  { id: 'speed', label: 'Page Speed Checker', icon: Gauge },
  { id: 'mobile', label: 'Mobile Responsive', icon: Smartphone },
  { id: 'health', label: 'Overall Health Score', icon: Activity },
];

function getScoreColor(score: number) {
  if (score >= 90) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 50) return '#f59e0b';
  return '#ef4444';
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'needs-work': return 'Needs Work';
    case 'critical': return 'Critical';
    default: return 'Unknown';
  }
}

function CircularScore({ score, size = 120, label }: { score: number; size?: number; label?: string }) {
  const sw = 8;
  const r = (size - sw) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  const col = getScoreColor(score);
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={sw} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth={sw} strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div style={{ textAlign: 'center', zIndex: 1 }}>
        <div style={{ fontSize: size > 100 ? '32px' : '22px', fontWeight: 800, color: col }}>{score}</div>
        {label && <div style={{ fontSize: '11px', color: C.textMuted, marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

function StatusBadge({ score }: { score: number }) {
  const status = score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'needs-work' : 'critical';
  const c = getScoreColor(score);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: c + '18', color: c, fontSize: '12px', fontWeight: 700 }}>
      {status === 'excellent' ? <CheckCircle size={12} /> : status === 'critical' ? <XCircle size={12} /> : <AlertTriangle size={12} />}
      {getStatusLabel(status)}
    </span>
  );
}

function Collapsible({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...glassStyle, marginBottom: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'none', border: 'none', color: C.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
        {title}
        {open ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
    </div>
  );
}

function ScoreCards({ result }: { result: SEOAnalysis }) {
  const cards = [
    { title: 'SEO Score', score: result.score, icon: Zap },
    { title: 'Meta Tags', score: Math.floor((result.metaTags.title.optimal ? 25 : 0) + (result.metaTags.description.optimal ? 25 : 0) + (result.metaTags.ogTags.present ? 20 : 0) + (result.metaTags.schema.present ? 20 : 0) + (result.metaTags.canonical.present ? 10 : 0)), icon: Tags },
    { title: 'Headings', score: result.headings.h1.present && result.headings.structure === 'good' ? 90 : 60, icon: Hash },
    { title: 'Images', score: result.images.total > 0 ? Math.floor((result.images.withAlt / result.images.total) * 100) : 0, icon: Eye },
    { title: 'Performance', score: result.performance.score, icon: Gauge },
    { title: 'Mobile', score: result.mobile.score, icon: Smartphone },
    { title: 'Security', score: result.security.score, icon: Shield },
    { title: 'Backlinks', score: result.backlinks.score, icon: Link2 },
    { title: 'Keywords', score: result.keywords.score, icon: KeyRound },
    { title: 'Traffic', score: result.traffic.score, icon: Globe },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
      {cards.map((card, i) => {
        const color = getScoreColor(card.score);
        return (
          <div key={i} style={{ ...glassStyle, padding: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <card.icon size={14} color={color} />
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: C.textSoft }}>{card.title}</span>
              </div>
              <span style={{ fontSize: '18px', fontWeight: 800, color }}>{card.score}</span>
            </div>
            <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
              <div style={{ width: `${card.score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MetaTagsPanel({ data }: { data: SEOAnalysis['metaTags'] }) {
  const items = [
    { label: 'Title Tag', ...data.title, check: data.title.present && data.title.optimal },
    { label: 'Meta Description', ...data.description, check: data.description.present && data.description.optimal },
    { label: 'Viewport', ...data.viewport, check: data.viewport.present },
    { label: 'Canonical', ...data.canonical, check: data.canonical.present },
    { label: 'Open Graph', ...data.ogTags, check: data.ogTags.present },
    { label: 'Twitter Cards', ...data.twitterTags, check: data.twitterTags.present },
    { label: 'Schema Markup', ...data.schema, check: data.schema.present },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {item.check ? <CheckCircle size={16} color="#22c55e" /> : <XCircle size={16} color="#ef4444" />}
            <span style={{ fontSize: '14px', color: C.text }}>{item.label}</span>
          </div>
          <span style={{ fontSize: '12px', color: C.textMuted }}>
            {'count' in item ? `${item.count} tags` : 'value' in item && item.value ? 'Present' : 'Missing'}
          </span>
        </div>
      ))}
    </div>
  );
}

function KeywordsPanel({ data }: { data: SEOAnalysis['keywords'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Top Keywords</h4>
        {data.topKeywords.map((kw, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.topKeywords.length - 1 ? `1px solid ${C.surface2}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: C.gold + '18', color: C.gold, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
              <span style={{ fontSize: '14px', color: C.text }}>{kw.keyword}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '12px', color: C.textMuted }}>{kw.count} times</span>
              <span style={{ fontSize: '12px', color: C.gold }}>{(kw.density * 100).toFixed(1)}%</span>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '12px' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Title Keywords</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {data.titleKeywords.map((k, i) => (
              <span key={i} style={{ padding: '4px 8px', borderRadius: 6, background: C.gold + '18', color: C.gold, fontSize: '11px', fontWeight: 600 }}>{k}</span>
            ))}
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '12px' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Heading Keywords</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {data.headingKeywords.map((k, i) => (
              <span key={i} style={{ padding: '4px 8px', borderRadius: 6, background: 'rgba(59,130,246,0.1)', color: '#3b82f6', fontSize: '11px', fontWeight: 600 }}>{k}</span>
            ))}
          </div>
        </div>
      </div>
      {data.keywordCannibalization.length > 0 && (
        <div style={{ ...glassStyle, padding: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Keyword Cannibalization</span>
          </div>
          {data.keywordCannibalization.map((issue, i) => (
            <div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function TrafficPanel({ data }: { data: SEOAnalysis['traffic'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Monthly Visits</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.text }}>{data.estimatedMonthly.toLocaleString()}</div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Trend</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            {data.trend === 'up' ? <TrendingUp size={20} color="#22c55e" /> : data.trend === 'down' ? <TrendingDown size={20} color="#ef4444" /> : <Minus size={20} color={C.textMuted} />}
            <span style={{ fontSize: '18px', fontWeight: 700, color: data.trend === 'up' ? '#22c55e' : data.trend === 'down' ? '#ef4444' : C.textMuted }}>
              {data.trend === 'up' ? 'Up' : data.trend === 'down' ? 'Down' : 'Stable'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Traffic Sources</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {data.sources.map((src, i) => (
            <div key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: '13px', color: C.textSoft }}>{src.source}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{src.percentage}%</span>
              </div>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ width: `${src.percentage}%`, height: '100%', background: i === 0 ? '#22c55e' : i === 1 ? '#3b82f6' : i === 2 ? '#f59e0b' : '#8b5cf6', borderRadius: 3, transition: 'width 1s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Organic</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#22c55e' }}>{data.organic}%</div>
        </div>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Paid</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: '#f59e0b' }}>{data.paid}%</div>
        </div>
      </div>
    </div>
  );
}

function BacklinksPanel({ data }: { data: SEOAnalysis['backlinks'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Total Backlinks</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.text }}>{data.total.toLocaleString()}</div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Domain Authority</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.gold }}>{data.authority}/100</div>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Dofollow</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>{data.dofollow}</div>
        </div>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Nofollow</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#f59e0b' }}>{data.nofollow}</div>
        </div>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Domains</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: C.text }}>{data.domains}</div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Top Referring Domains</h4>
        {data.topDomains.map((domain, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < data.topDomains.length - 1 ? `1px solid ${C.surface2}` : 'none' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{domain.domain}</div>
              <div style={{ fontSize: '12px', color: C.textMuted }}>{domain.count} links</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: '12px', color: C.textMuted }}>DA</span>
              <span style={{ fontSize: '14px', fontWeight: 700, color: C.gold }}>{domain.authority}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SitemapPanel({ data }: { data: SEOAnalysis['sitemap'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.present ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.present ? '#22c55e' : '#ef4444' }}>{data.present ? 'Found' : 'Missing'}</span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Valid</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.valid ? <CheckCircle size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#f59e0b" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.valid ? '#22c55e' : '#f59e0b' }}>{data.valid ? 'Valid' : 'Invalid'}</span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Sitemap URL</div>
        <div style={{ fontSize: '14px', color: C.text, wordBreak: 'break-all' }}>{data.url}</div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>URLs</div>
          <div style={{ fontSize: '18px', fontWeight: 700, color: C.text }}>{data.urls}</div>
        </div>
        <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted }}>Last Modified</div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{data.lastModified}</div>
        </div>
      </div>
      {data.issues.length > 0 && (
        <div style={{ ...glassStyle, padding: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Issues</span>
          </div>
          {data.issues.map((issue, i) => (<div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>))}
        </div>
      )}
    </div>
  );
}

function RobotsPanel({ data }: { data: SEOAnalysis['robots'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.present ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.present ? '#22c55e' : '#ef4444' }}>{data.present ? 'Found' : 'Missing'}</span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Valid</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.valid ? <CheckCircle size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#f59e0b" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.valid ? '#22c55e' : '#f59e0b' }}>{data.valid ? 'Valid' : 'Invalid'}</span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Robots.txt URL</div>
        <div style={{ fontSize: '14px', color: C.text, wordBreak: 'break-all' }}>{data.url}</div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Sitemap Reference</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.sitemapRef ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
          <span style={{ fontSize: '14px', color: data.sitemapRef ? '#22c55e' : '#ef4444' }}>{data.sitemapRef ? 'Sitemap referenced' : 'No sitemap reference'}</span>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Disallowed Paths</div>
        {data.disallowedPaths.map((path, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0' }}>
            <Lock size={12} color={C.textMuted} />
            <span style={{ fontSize: '13px', color: C.text, fontFamily: 'monospace' }}>{path}</span>
          </div>
        ))}
      </div>
      {data.issues.length > 0 && (
        <div style={{ ...glassStyle, padding: '12px', border: '1px solid rgba(239,68,68,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#ef4444" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ef4444' }}>Issues</span>
          </div>
          {data.issues.map((issue, i) => (<div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>))}
        </div>
      )}
    </div>
  );
}

function SSLPanel({ data }: { data: SEOAnalysis['security'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>SSL Certificate</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.ssl ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.ssl ? '#22c55e' : '#ef4444' }}>{data.ssl ? 'Active' : 'Missing'}</span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>HTTPS</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.https ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.https ? '#22c55e' : '#ef4444' }}>{data.https ? 'Enabled' : 'Disabled'}</span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>HSTS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.hsts ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
          <span style={{ fontSize: '14px', color: data.hsts ? '#22c55e' : '#ef4444' }}>{data.hsts ? 'HSTS enabled' : 'HSTS not enabled'}</span>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Mixed Content</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.mixedContent ? <AlertTriangle size={14} color="#f59e0b" /> : <CheckCircle size={14} color="#22c55e" />}
          <span style={{ fontSize: '14px', color: data.mixedContent ? '#f59e0b' : '#22c55e' }}>{data.mixedContent ? 'Mixed content detected' : 'No mixed content'}</span>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Security Headers</h4>
        {data.securityHeaders.map((header, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < data.securityHeaders.length - 1 ? `1px solid ${C.surface2}` : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {header.present ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
              <span style={{ fontSize: '13px', color: C.text }}>{header.header}</span>
            </div>
            <span style={{ fontSize: '11px', color: C.textMuted, fontFamily: 'monospace' }}>{header.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpeedPanel({ data }: { data: SEOAnalysis['performance'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Load Time</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: data.loadTime < 2 ? '#22c55e' : data.loadTime < 4 ? '#f59e0b' : '#ef4444' }}>{data.loadTime}s</div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Page Size</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: C.text }}>{(data.pageSize / 1024).toFixed(1)} MB</div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <h4 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Core Web Vitals</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { label: 'First Contentful Paint', value: data.firstContentfulPaint, threshold: [1.8, 3] },
            { label: 'Largest Contentful Paint', value: data.largestContentfulPaint, threshold: [2.5, 4] },
            { label: 'Time to Interactive', value: data.timeToInteractive, threshold: [3.8, 7.3] },
            { label: 'Cumulative Layout Shift', value: data.cumulativeLayoutShift, threshold: [0.1, 0.25] },
          ].map((item, i) => {
            const v = item.value;
            const t = item.threshold;
            const color = v < t[0] ? '#22c55e' : v < t[1] ? '#f59e0b' : '#ef4444';
            const max = t[1] * 1.2;
            return (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>{item.label}</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color }}>{v < 1 ? v.toFixed(2) : v + (typeof v === 'number' ? 's' : '')}</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${Math.min(100, (v / max) * 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '12px', textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: C.textMuted }}>HTTP Requests</div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: C.text }}>{data.requests}</div>
      </div>
    </div>
  );
}

function MobilePanel({ data }: { data: SEOAnalysis['mobile'] }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Responsive</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.responsive ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.responsive ? '#22c55e' : '#ef4444' }}>{data.responsive ? 'Yes' : 'No'}</span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Viewport</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.viewportSet ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.viewportSet ? '#22c55e' : '#ef4444' }}>{data.viewportSet ? 'Set' : 'Missing'}</span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Touch Targets</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: C.text }}>Size: {data.touchTargets.size}px</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: data.touchTargets.size >= 48 ? '#22c55e' : '#f59e0b' }}>{data.touchTargets.size >= 48 ? 'Good' : 'Small'}</span>
        </div>
        <div style={{ fontSize: '12px', color: C.textMuted, marginTop: 4 }}>Adequate: {data.touchTargets.adequate}</div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Font Size</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.fontSize.readable ? <CheckCircle size={14} color="#22c55e" /> : <AlertTriangle size={14} color="#f59e0b" />}
          <span style={{ fontSize: '14px', color: data.fontSize.readable ? '#22c55e' : '#f59e0b' }}>{data.fontSize.readable ? 'Readable' : 'Too small'}</span>
        </div>
      </div>
      {data.touchTargets.issues.length > 0 && (
        <div style={{ ...glassStyle, padding: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>Issues</span>
          </div>
          {data.touchTargets.issues.map((issue, i) => (<div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>))}
        </div>
      )}
    </div>
  );
}

export function SEODashboard() {
  const { setScreen } = useStore();
  const [url, setUrl] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SEOAnalysis | null>(null);
  const [activeTool, setActiveTool] = useState('seo-score');
  const [error, setError] = useState('');
  const [collapsed, setCollapsed] = useState(false);

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setError('');
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      const data = await analyzeSEO(targetUrl);
      setResult(data);
    } catch (e) {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  const renderTool = () => {
    if (!result) {
      return (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: 64, height: 64, borderRadius: 20, background: 'linear-gradient(135deg, #D4A853, #7A5520)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Search size={30} color="#0A0E1A" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: C.text, margin: '0 0 8px' }}>SEO Dashboard</h2>
          <p style={{ fontSize: '14px', color: C.textSoft, maxWidth: 360, margin: '0 auto 24px', lineHeight: 1.5 }}>
            Enter a website URL above to analyze its SEO performance, traffic, keywords, security, and more.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, maxWidth: 400, margin: '0 auto' }}>
            {TOOLS.map(tool => (
              <div key={tool.id} style={{ ...glassStyle, padding: '12px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <tool.icon size={16} color={C.gold} />
                <span style={{ fontSize: '12px', color: C.textSoft }}>{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    switch (activeTool) {
      case 'seo-score': return (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
            <CircularScore score={result.score} label="Overall" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(result.score) }}>{getStatusLabel(result.status)}</div>
              <div style={{ fontSize: '12px', color: C.textMuted, marginTop: 4 }}>{result.issues.length} issues found</div>
            </div>
            <StatusBadge score={result.score} />
          </div>
          <ScoreCards result={result} />
        </div>
      );
      case 'meta': return <MetaTagsPanel data={result.metaTags} />;
      case 'keywords': return <KeywordsPanel data={result.keywords} />;
      case 'traffic': return <TrafficPanel data={result.traffic} />;
      case 'backlinks': return <BacklinksPanel data={result.backlinks} />;
      case 'sitemap': return <SitemapPanel data={result.sitemap} />;
      case 'robots': return <RobotsPanel data={result.robots} />;
      case 'ssl': return <SSLPanel data={result.security} />;
      case 'speed': return <SpeedPanel data={result.performance} />;
      case 'mobile': return <MobilePanel data={result.mobile} />;
      case 'health': return (
        <div>
          <div style={{ ...glassStyle, padding: '24px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: '14px', color: C.textSoft, marginBottom: 8 }}>Overall Health Score</div>
            <div style={{ fontSize: '56px', fontWeight: 800, color: getScoreColor(result.score), lineHeight: 1 }}>{result.score}</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: getScoreColor(result.score), marginTop: 4 }}>{getStatusLabel(result.status)}</div>
          </div>
          <Collapsible title="Issues Found" defaultOpen={true}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.issues.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: '14px' }}>
                  <CheckCircle size={16} /> No issues found!
                </div>
              ) : (
                result.issues.map((issue, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(239,68,68,0.08)', borderRadius: 8 }}>
                    <AlertTriangle size={14} color="#ef4444" />
                    <span style={{ fontSize: '13px', color: C.text }}>{issue}</span>
                  </div>
                ))
              )}
            </div>
          </Collapsible>
          <Collapsible title="Recommendations" defaultOpen={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.recommendations.length === 0 ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#22c55e', fontSize: '14px' }}>
                  <CheckCircle size={16} /> No recommendations needed!
                </div>
              ) : (
                result.recommendations.map((rec, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px', background: 'rgba(59,130,246,0.08)', borderRadius: 8 }}>
                    <Info size={14} color="#3b82f6" />
                    <span style={{ fontSize: '13px', color: C.text }}>{rec}</span>
                  </div>
                ))
              )}
            </div>
          </Collapsible>
          <div style={{ marginTop: 16 }}>
            <ScoreCards result={result} />
          </div>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0E1A', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      {/* Sidebar */}
      <div style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: collapsed ? 60 : 220,
        background: '#0F1525', borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column', zIndex: 50,
        transition: 'width 0.25s ease',
      }}>
        <div style={{ padding: '16px 12px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: C.textSoft }}>
            <ArrowLeft size={20} style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.25s' }} />
          </button>
          {!collapsed && <span style={{ fontSize: '15px', fontWeight: 800, color: C.gold, whiteSpace: 'nowrap' }}>SEO Tools</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {TOOLS.map(tool => {
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '10px 8px', borderRadius: 10, border: 'none',
                  background: isActive ? 'rgba(212,168,83,0.15)' : 'transparent',
                  color: isActive ? C.gold : C.textSoft,
                  cursor: 'pointer', fontFamily: 'inherit',
                  fontSize: '13px', fontWeight: isActive ? 700 : 500,
                  transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
                title={tool.label}
              >
                <tool.icon size={18} />
                {!collapsed && <span>{tool.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* TopBar */}
      <div style={{
        position: 'fixed', top: 0, left: collapsed ? 60 : 220, right: 0,
        height: 56, background: 'rgba(10,14,26,0.92)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', zIndex: 40,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 16px',
        transition: 'left 0.25s ease',
      }}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, ...glassStyle, padding: '4px 4px 4px 12px' }}>
          <Search size={16} color={C.textMuted} />
          <input
            type="text"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Enter website URL (e.g. example.com)"
            onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
            style={{ flex: 1, background: 'transparent', border: 'none', color: C.text, fontSize: '14px', outline: 'none', padding: '8px 0' }}
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={analyzing || !url.trim()}
          style={{
            background: 'linear-gradient(135deg, #D4A853, #7A5520)', color: '#0A0E1A',
            border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: '13px',
            fontWeight: 700, cursor: analyzing || !url.trim() ? 'not-allowed' : 'pointer',
            opacity: analyzing || !url.trim() ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          {analyzing ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={14} />}
          {analyzing ? 'Analyzing' : 'Analyze'}
        </button>
      </div>

      {/* Main Content */}
      <div style={{
        marginLeft: collapsed ? 60 : 220,
        marginTop: 56,
        flex: 1,
        padding: '24px',
        maxWidth: 900,
        minWidth: 0,
        transition: 'margin-left 0.25s ease',
      }}>
        {error && (
          <div style={{ ...glassStyle, padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16, color: '#ef4444', fontSize: '14px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={16} /> {error}
          </div>
        )}
        <div style={{ marginBottom: 16 }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: '0 0 4px' }}>
            {TOOLS.find(t => t.id === activeTool)?.label || 'SEO Tool'}
          </h2>
          {url && result && (
            <p style={{ fontSize: '12px', color: C.textMuted, margin: 0 }}>Results for {url}</p>
          )}
        </div>
        {renderTool()}
      </div>
    </div>
  );
}
