import { useState, useEffect, useRef } from 'react';
import { useStore } from '../lib/store';
import { C, glassStyle, inputStyle } from '../lib/tokens';
import { analyzeSEO, getStatusColor, getStatusBg, getStatusLabel } from '../lib/seoAnalyzer';
import type { SEOAnalysis } from '../types/seo';
import {
  Search, ArrowLeft, Zap, Globe, KeyRound, Tags, Link2,
  Map, Shield, FileText, Smartphone, Gauge, Activity,
  CheckCircle, XCircle, AlertTriangle, Info, Clock, ArrowUpRight,
  TrendingUp, TrendingDown, Minus, ChevronDown, ChevronUp,
  ExternalLink, BarChart3, PieChart, Hash, Eye, Lock
} from 'lucide-react';

const TOOLS = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'meta', label: 'Meta Tags', icon: Tags },
  { id: 'keywords', label: 'Keywords', icon: KeyRound },
  { id: 'traffic', label: 'Traffic', icon: Globe },
  { id: 'backlinks', label: 'Backlinks', icon: Link2 },
  { id: 'sitemap', label: 'Sitemap', icon: Map },
  { id: 'robots', label: 'Robots.txt', icon: FileText },
  { id: 'ssl', label: 'SSL/Security', icon: Shield },
  { id: 'speed', label: 'Page Speed', icon: Gauge },
  { id: 'mobile', label: 'Mobile', icon: Smartphone },
];

function CircularScore({ score, size = 80, strokeWidth = 6, label }: { score: number; size?: number; strokeWidth?: number; label?: string }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 90 ? '#22c55e' : score >= 70 ? '#3b82f6' : score >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={C.surface2} strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{ position: 'absolute', textAlign: 'center' }}>
        <div style={{ fontSize: size > 100 ? '28px' : '18px', fontWeight: 800, color }}>{score}</div>
        {label && <div style={{ fontSize: '10px', color: C.textMuted, marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

function ScoreCard({ title, score, icon: Icon, onClick }: { title: string; score: number; icon: any; onClick?: () => void }) {
  const color = getStatusColor(score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'needs-work' : 'critical');
  const bg = getStatusBg(score >= 90 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'needs-work' : 'critical');

  return (
    <div onClick={onClick} style={{ ...glassStyle, padding: '16px', cursor: onClick ? 'pointer' : 'default', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.3)'; }}}
      onMouseLeave={e => { if (onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={16} color={color} />
          </div>
          <span style={{ fontSize: '13px', fontWeight: 600, color: C.textSoft }}>{title}</span>
        </div>
        <span style={{ fontSize: '18px', fontWeight: 800, color }}>{score}</span>
      </div>
      <div style={{ width: '100%', height: 4, background: C.surface2, borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 1s ease' }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = getStatusColor(status);
  const bg = getStatusBg(status);
  const label = getStatusLabel(status);

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: bg, color, fontSize: '12px', fontWeight: 700 }}>
      {status === 'excellent' ? <CheckCircle size={12} /> : status === 'critical' ? <XCircle size={12} /> : <AlertTriangle size={12} />}
      {label}
    </span>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ ...glassStyle, marginBottom: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'none', border: 'none', color: C.text, cursor: 'pointer', fontSize: '14px', fontWeight: 700 }}>
        {title}
        {open ? <ChevronUp size={16} color={C.textMuted} /> : <ChevronDown size={16} color={C.textMuted} />}
      </button>
      {open && <div style={{ padding: '0 16px 16px' }}>{children}</div>}
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
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: C.goldGlassBg, color: C.gold, fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
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
              <span key={i} style={{ padding: '4px 8px', borderRadius: 6, background: C.goldGlassBg, color: C.gold, fontSize: '11px', fontWeight: 600 }}>{k}</span>
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
              <div style={{ width: '100%', height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
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
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.present ? '#22c55e' : '#ef4444' }}>
              {data.present ? 'Found' : 'Missing'}
            </span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Valid</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.valid ? <CheckCircle size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#f59e0b" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.valid ? '#22c55e' : '#f59e0b' }}>
              {data.valid ? 'Valid' : 'Invalid'}
            </span>
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
          {data.issues.map((issue, i) => (
            <div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>
          ))}
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
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.present ? '#22c55e' : '#ef4444' }}>
              {data.present ? 'Found' : 'Missing'}
            </span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Valid</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.valid ? <CheckCircle size={18} color="#22c55e" /> : <AlertTriangle size={18} color="#f59e0b" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.valid ? '#22c55e' : '#f59e0b' }}>
              {data.valid ? 'Valid' : 'Invalid'}
            </span>
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
          <span style={{ fontSize: '14px', color: data.sitemapRef ? '#22c55e' : '#ef4444' }}>
            {data.sitemapRef ? 'Sitemap referenced' : 'No sitemap reference'}
          </span>
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
          {data.issues.map((issue, i) => (
            <div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>
          ))}
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
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.ssl ? '#22c55e' : '#ef4444' }}>
              {data.ssl ? 'Active' : 'Missing'}
            </span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>HTTPS</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.https ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.https ? '#22c55e' : '#ef4444' }}>
              {data.https ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>HSTS</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.hsts ? <CheckCircle size={14} color="#22c55e" /> : <XCircle size={14} color="#ef4444" />}
          <span style={{ fontSize: '14px', color: data.hsts ? '#22c55e' : '#ef4444' }}>
            {data.hsts ? 'HSTS enabled' : 'HSTS not enabled'}
          </span>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Mixed Content</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.mixedContent ? <AlertTriangle size={14} color="#f59e0b" /> : <CheckCircle size={14} color="#22c55e" />}
          <span style={{ fontSize: '14px', color: data.mixedContent ? '#f59e0b' : '#22c55e' }}>
            {data.mixedContent ? 'Mixed content detected' : 'No mixed content'}
          </span>
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
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '13px', color: C.textSoft }}>First Contentful Paint</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: data.firstContentfulPaint < 1.8 ? '#22c55e' : data.firstContentfulPaint < 3 ? '#f59e0b' : '#ef4444' }}>{data.firstContentfulPaint}s</span>
            </div>
            <div style={{ width: '100%', height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (data.firstContentfulPaint / 3) * 100)}%`, height: '100%', background: data.firstContentfulPaint < 1.8 ? '#22c55e' : data.firstContentfulPaint < 3 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '13px', color: C.textSoft }}>Largest Contentful Paint</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: data.largestContentfulPaint < 2.5 ? '#22c55e' : data.largestContentfulPaint < 4 ? '#f59e0b' : '#ef4444' }}>{data.largestContentfulPaint}s</span>
            </div>
            <div style={{ width: '100%', height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (data.largestContentfulPaint / 4) * 100)}%`, height: '100%', background: data.largestContentfulPaint < 2.5 ? '#22c55e' : data.largestContentfulPaint < 4 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '13px', color: C.textSoft }}>Time to Interactive</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: data.timeToInteractive < 3.8 ? '#22c55e' : data.timeToInteractive < 7.3 ? '#f59e0b' : '#ef4444' }}>{data.timeToInteractive}s</span>
            </div>
            <div style={{ width: '100%', height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (data.timeToInteractive / 5) * 100)}%`, height: '100%', background: data.timeToInteractive < 3.8 ? '#22c55e' : data.timeToInteractive < 7.3 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
            </div>
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '13px', color: C.textSoft }}>Cumulative Layout Shift</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: data.cumulativeLayoutShift < 0.1 ? '#22c55e' : data.cumulativeLayoutShift < 0.25 ? '#f59e0b' : '#ef4444' }}>{data.cumulativeLayoutShift.toFixed(2)}</span>
            </div>
            <div style={{ width: '100%', height: 6, background: C.surface2, borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, (data.cumulativeLayoutShift / 0.3) * 100)}%`, height: '100%', background: data.cumulativeLayoutShift < 0.1 ? '#22c55e' : data.cumulativeLayoutShift < 0.25 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
            </div>
          </div>
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
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.responsive ? '#22c55e' : '#ef4444' }}>
              {data.responsive ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        <div style={{ ...glassStyle, padding: '16px', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Viewport</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
            {data.viewportSet ? <CheckCircle size={18} color="#22c55e" /> : <XCircle size={18} color="#ef4444" />}
            <span style={{ fontSize: '16px', fontWeight: 700, color: data.viewportSet ? '#22c55e' : '#ef4444' }}>
              {data.viewportSet ? 'Set' : 'Missing'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Touch Targets</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '14px', color: C.text }}>Size: {data.touchTargets.size}px</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: data.touchTargets.size >= 48 ? '#22c55e' : '#f59e0b' }}>
            {data.touchTargets.size >= 48 ? 'Good' : 'Small'}
          </span>
        </div>
        <div style={{ fontSize: '12px', color: C.textMuted, marginTop: 4 }}>Adequate: {data.touchTargets.adequate}</div>
      </div>
      <div style={{ ...glassStyle, padding: '16px' }}>
        <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 8 }}>Font Size</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {data.fontSize.readable ? <CheckCircle size={14} color="#22c55e" /> : <AlertTriangle size={14} color="#f59e0b" />}
          <span style={{ fontSize: '14px', color: data.fontSize.readable ? '#22c55e' : '#f59e0b' }}>
            {data.fontSize.readable ? 'Readable' : 'Too small'}
          </span>
        </div>
      </div>
      {data.touchTargets.issues.length > 0 && (
        <div style={{ ...glassStyle, padding: '12px', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <AlertTriangle size={14} color="#f59e0b" />
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#f59e0b' }}>Issues</span>
          </div>
          {data.touchTargets.issues.map((issue, i) => (
            <div key={i} style={{ fontSize: '12px', color: C.textSoft, padding: '4px 0' }}>{issue}</div>
          ))}
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
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    setError('');
    try {
      let targetUrl = url.trim();
      if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;
      const data = await analyzeSEO(targetUrl);
      setResult(data);
      setActiveTab('overview');
    } catch (e) {
      setError('Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  if (!result) {
    return (
      <div style={{ ...pageStyle, padding: '0 24px 100px', minHeight: '100vh' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 0' }}>
          <button onClick={() => setScreen('home')} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <ArrowLeft size={24} color={C.text} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: C.text, margin: 0 }}>SEO Dashboard</h1>
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: 'linear-gradient(135deg, #D4A853, #7A5520)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <Search size={36} color="#0A0E1A" />
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: C.text, margin: '0 0 8px' }}>SEO Analysis</h2>
          <p style={{ fontSize: '14px', color: C.textSoft, maxWidth: '300px', margin: '0 auto', lineHeight: 1.5 }}>
            Enter any website URL to analyze its SEO performance, traffic, keywords, and more.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, ...glassStyle, padding: '4px 4px 4px 16px' }}>
            <Globe size={18} color={C.textMuted} />
            <input
              type="text"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder="example.com"
              onKeyDown={e => e.key === 'Enter' && handleAnalyze()}
              style={{ ...inputStyle, border: 'none', background: 'transparent', padding: '12px 0', flex: 1 }}
            />
          </div>
          <button
            onClick={handleAnalyze}
            disabled={analyzing || !url.trim()}
            style={{ ...goldBtnStyle, opacity: analyzing || !url.trim() ? 0.6 : 1 }}
          >
            {analyzing ? 'Analyzing...' : 'Analyze Website'}
          </button>
        </div>

        {error && (
          <div style={{ ...glassStyle, padding: '12px 16px', border: '1px solid rgba(239,68,68,0.3)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#ef4444', fontSize: '14px' }}>
              <AlertTriangle size={16} /> {error}
            </div>
          </div>
        )}

        <div style={{ ...glassStyle, padding: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 700, color: C.text, margin: '0 0 12px' }}>Available Tools</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {TOOLS.filter(t => t.id !== 'overview').map(tool => (
              <div key={tool.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <tool.icon size={16} color={C.gold} />
                <span style={{ fontSize: '12px', color: C.textSoft }}>{tool.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const scoreCards = [
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

  const renderPanel = () => {
    switch (activeTab) {
      case 'meta': return <MetaTagsPanel data={result.metaTags} />;
      case 'keywords': return <KeywordsPanel data={result.keywords} />;
      case 'traffic': return <TrafficPanel data={result.traffic} />;
      case 'backlinks': return <BacklinksPanel data={result.backlinks} />;
      case 'sitemap': return <SitemapPanel data={result.sitemap} />;
      case 'robots': return <RobotsPanel data={result.robots} />;
      case 'ssl': return <SSLPanel data={result.security} />;
      case 'speed': return <SpeedPanel data={result.performance} />;
      case 'mobile': return <MobilePanel data={result.mobile} />;
      default: return null;
    }
  };

  return (
    <div style={{ ...pageStyle, padding: '0 0 100px', minHeight: '100vh' }}>
      <div style={{ padding: '16px 24px', position: 'sticky', top: 0, background: 'rgba(10,14,26,0.9)', backdropFilter: 'blur(20px)', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <button onClick={() => { setResult(null); setUrl(''); }} style={{ background: 'none', border: 'none', padding: 8, cursor: 'pointer' }}>
            <ArrowLeft size={24} color={C.text} />
          </button>
          <h1 style={{ fontSize: '18px', fontWeight: 800, color: C.text, margin: 0, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</h1>
          <StatusBadge status={result.status} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CircularScore score={result.score} size={70} label="Overall" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: 4 }}>Overall Health Score</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: getStatusColor(result.status) }}>
              {getStatusLabel(result.status)}
            </div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginTop: 4 }}>
              {result.issues.length} issues found
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 24px' }}>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '12px 0', marginBottom: 8 }}>
          {TOOLS.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTab(tool.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 20,
                background: activeTab === tool.id ? C.gold : 'rgba(255,255,255,0.06)',
                color: activeTab === tool.id ? '#0A0E1A' : C.textSoft,
                border: 'none', fontSize: '13px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              <tool.icon size={14} />
              {tool.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
              {scoreCards.map((card, i) => (
                <ScoreCard key={i} {...card} onClick={() => {
                  const toolId = TOOLS.find(t => t.label === card.title || (t.label === 'Meta Tags' && card.title === 'Meta Tags') || (t.label === 'Page Speed' && card.title === 'Performance') || (t.label === 'SSL/Security' && card.title === 'Security'))?.id;
                  if (toolId) setActiveTab(toolId);
                }} />
              ))}
            </div>

            <CollapsibleSection title="Issues Found" defaultOpen={true}>
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
            </CollapsibleSection>

            <CollapsibleSection title="Recommendations" defaultOpen={false}>
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
            </CollapsibleSection>

            <CollapsibleSection title="Quick Summary" defaultOpen={false}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>Total Pages</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{result.sitemap.urls}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>Backlinks</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{result.backlinks.total.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>Monthly Traffic</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{result.traffic.estimatedMonthly.toLocaleString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>Load Time</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{result.performance.loadTime}s</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '13px', color: C.textSoft }}>SSL</span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: result.security.ssl ? '#22c55e' : '#ef4444' }}>{result.security.ssl ? 'Active' : 'Missing'}</span>
                </div>
              </div>
            </CollapsibleSection>
          </>
        )}

        {activeTab !== 'overview' && renderPanel()}
      </div>
    </div>
  );
}

const pageStyle = {
  background: `radial-gradient(ellipse at 15% 0%, rgba(212,168,83,0.13) 0%, transparent 55%), radial-gradient(ellipse at 85% 0%, rgba(46,204,138,0.08) 0%, transparent 50%), #0A0E1A`,
  minHeight: '100vh',
  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
  color: C.text,
  maxWidth: '430px',
  margin: '0 auto',
  position: 'relative' as const,
  overflowY: 'auto' as const,
};
