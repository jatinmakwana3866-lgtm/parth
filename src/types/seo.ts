export interface SEOAnalysis {
  score: number;
  status: 'excellent' | 'good' | 'needs-work' | 'critical';
  issues: string[];
  recommendations: string[];
  metaTags: MetaTagAnalysis;
  headings: HeadingAnalysis;
  images: ImageAnalysis;
  links: LinkAnalysis;
  performance: PerformanceMetrics;
  mobile: MobileAnalysis;
  security: SecurityAnalysis;
  sitemap: SitemapAnalysis;
  robots: RobotsAnalysis;
  backlinks: BacklinkAnalysis;
  keywords: KeywordAnalysis;
  traffic: TrafficAnalysis;
}

export interface MetaTagAnalysis {
  title: { present: boolean; value: string; length: number; optimal: boolean };
  description: { present: boolean; value: string; length: number; optimal: boolean };
  viewport: { present: boolean; value: string };
  canonical: { present: boolean; value: string };
  ogTags: { present: boolean; count: number; tags: string[] };
  twitterTags: { present: boolean; count: number; tags: string[] };
  schema: { present: boolean; count: number; types: string[] };
}

export interface HeadingAnalysis {
  h1: { present: boolean; count: number; values: string[] };
  h2: { count: number; values: string[] };
  h3: { count: number; values: string[] };
  structure: 'good' | 'needs-improvement' | 'poor';
  issues: string[];
}

export interface ImageAnalysis {
  total: number;
  withAlt: number;
  withoutAlt: number;
  lazyLoaded: number;
  responsive: number;
  issues: string[];
}

export interface LinkAnalysis {
  internal: number;
  external: number;
  broken: number;
  nofollow: number;
  issues: string[];
}

export interface PerformanceMetrics {
  loadTime: number;
  pageSize: number;
  requests: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
  score: number;
}

export interface MobileAnalysis {
  responsive: boolean;
  viewportSet: boolean;
  touchTargets: { size: number; adequate: number; issues: string[] };
  fontSize: { readable: boolean; issues: string[] };
  score: number;
}

export interface SecurityAnalysis {
  ssl: boolean;
  https: boolean;
  hsts: boolean;
  mixedContent: boolean;
  securityHeaders: { header: string; present: boolean; value: string }[];
  score: number;
}

export interface SitemapAnalysis {
  present: boolean;
  url: string;
  valid: boolean;
  urls: number;
  lastModified: string;
  issues: string[];
}

export interface RobotsAnalysis {
  present: boolean;
  url: string;
  valid: boolean;
  sitemapRef: boolean;
  disallowedPaths: string[];
  issues: string[];
}

export interface BacklinkAnalysis {
  total: number;
  dofollow: number;
  nofollow: number;
  domains: number;
  authority: number;
  topDomains: { domain: string; count: number; authority: number }[];
  score: number;
}

export interface KeywordAnalysis {
  topKeywords: { keyword: string; count: number; density: number }[];
  titleKeywords: string[];
  headingKeywords: string[];
  contentKeywords: string[];
  keywordCannibalization: string[];
  score: number;
}

export interface TrafficAnalysis {
  estimatedMonthly: number;
  organic: number;
  paid: number;
  sources: { source: string; percentage: number }[];
  trend: 'up' | 'down' | 'stable';
  score: number;
}
