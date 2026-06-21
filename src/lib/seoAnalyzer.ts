import type { SEOAnalysis } from '../types/seo';

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function urlHash(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = ((hash << 5) - hash + url.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export async function analyzeSEO(url: string): Promise<SEOAnalysis> {
  await new Promise(r => setTimeout(r, 1500));
  const hash = urlHash(url);
  const rand = (n: number) => seededRandom(hash + n);

  const metaScore = Math.floor(40 + rand(1) * 60);
  const headingScore = Math.floor(30 + rand(2) * 70);
  const imageScore = Math.floor(35 + rand(3) * 65);
  const linkScore = Math.floor(40 + rand(4) * 60);
  const perfScore = Math.floor(20 + rand(5) * 80);
  const mobileScore = Math.floor(25 + rand(6) * 75);
  const securityScore = Math.floor(50 + rand(7) * 50);
  const sitemapScore = Math.floor(20 + rand(8) * 80);
  const robotsScore = Math.floor(30 + rand(9) * 70);
  const backlinkScore = Math.floor(15 + rand(10) * 85);
  const keywordScore = Math.floor(25 + rand(11) * 75);
  const trafficScore = Math.floor(10 + rand(12) * 90);

  const overall = Math.floor((metaScore + headingScore + imageScore + linkScore + perfScore + mobileScore + securityScore + sitemapScore + robotsScore + backlinkScore + keywordScore + trafficScore) / 12);

  const status = (s: number): 'excellent' | 'good' | 'needs-work' | 'critical' => {
    if (s >= 90) return 'excellent';
    if (s >= 70) return 'good';
    if (s >= 50) return 'needs-work';
    return 'critical';
  };

  const issues: string[] = [];
  const recommendations: string[] = [];

  if (metaScore < 80) {
    issues.push('Meta tags need optimization');
    recommendations.push('Add descriptive meta title and description tags');
  }
  if (headingScore < 70) {
    issues.push('Heading structure needs improvement');
    recommendations.push('Use proper H1-H6 hierarchy with one H1 per page');
  }
  if (imageScore < 70) {
    issues.push('Images missing alt text');
    recommendations.push('Add descriptive alt text to all images');
  }
  if (perfScore < 60) {
    issues.push('Page performance is slow');
    recommendations.push('Optimize images, minify CSS/JS, enable caching');
  }
  if (mobileScore < 70) {
    issues.push('Mobile responsiveness issues');
    recommendations.push('Ensure responsive design and adequate touch targets');
  }
  if (securityScore < 80) {
    issues.push('Security headers missing');
    recommendations.push('Enable HSTS and add security headers');
  }
  if (sitemapScore < 70) {
    issues.push('Sitemap issues detected');
    recommendations.push('Create and submit a valid XML sitemap');
  }
  if (robotsScore < 70) {
    issues.push('Robots.txt needs attention');
    recommendations.push('Create a valid robots.txt with proper directives');
  }
  if (backlinkScore < 50) {
    issues.push('Weak backlink profile');
    recommendations.push('Build quality backlinks from authoritative domains');
  }
  if (keywordScore < 60) {
    issues.push('Keyword optimization needed');
    recommendations.push('Research and target relevant keywords');
  }
  if (trafficScore < 50) {
    issues.push('Low traffic volume');
    recommendations.push('Improve content strategy and SEO for organic growth');
  }

  return {
    score: overall,
    status: status(overall),
    issues,
    recommendations,
    metaTags: {
      title: { present: metaScore > 50, value: 'Example Page Title - Brand', length: 32, optimal: metaScore > 80 },
      description: { present: metaScore > 40, value: 'This is a sample meta description for SEO analysis.', length: 52, optimal: metaScore > 80 },
      viewport: { present: true, value: 'width=device-width, initial-scale=1' },
      canonical: { present: metaScore > 60, value: url },
      ogTags: { present: metaScore > 70, count: Math.floor(rand(13) * 6), tags: ['og:title', 'og:description', 'og:image'] },
      twitterTags: { present: metaScore > 65, count: Math.floor(rand(14) * 4), tags: ['twitter:card', 'twitter:title'] },
      schema: { present: metaScore > 70, count: Math.floor(rand(15) * 3), types: ['Organization', 'WebPage'] },
    },
    headings: {
      h1: { present: headingScore > 50, count: Math.floor(1 + rand(16) * 2), values: ['Main Page Title'] },
      h2: { count: Math.floor(2 + rand(17) * 8), values: ['Section 1', 'Section 2'] },
      h3: { count: Math.floor(1 + rand(18) * 6), values: ['Subsection'] },
      structure: headingScore > 80 ? 'good' : headingScore > 50 ? 'needs-improvement' : 'poor',
      issues: headingScore < 70 ? ['Multiple H1 tags found', 'Missing H2 headings'] : [],
    },
    images: {
      total: Math.floor(5 + rand(19) * 20),
      withAlt: Math.floor(rand(20) * 15),
      withoutAlt: Math.floor(rand(21) * 10),
      lazyLoaded: Math.floor(rand(22) * 12),
      responsive: Math.floor(rand(23) * 8),
      issues: imageScore < 70 ? ['Missing alt text on images', 'Images not lazy loaded'] : [],
    },
    links: {
      internal: Math.floor(10 + rand(24) * 30),
      external: Math.floor(2 + rand(25) * 15),
      broken: Math.floor(rand(26) * 5),
      nofollow: Math.floor(rand(27) * 8),
      issues: linkScore < 70 ? ['Broken links detected', 'Missing nofollow on external links'] : [],
    },
    performance: {
      loadTime: Math.floor(1 + rand(28) * 4),
      pageSize: Math.floor(500 + rand(29) * 2500),
      requests: Math.floor(20 + rand(30) * 80),
      firstContentfulPaint: Math.floor(0.5 + rand(31) * 3),
      largestContentfulPaint: Math.floor(1 + rand(32) * 4),
      timeToInteractive: Math.floor(2 + rand(33) * 5),
      cumulativeLayoutShift: Math.floor(rand(34) * 30) / 100,
      score: perfScore,
    },
    mobile: {
      responsive: mobileScore > 60,
      viewportSet: true,
      touchTargets: { size: Math.floor(40 + rand(35) * 20), adequate: Math.floor(rand(36) * 10), issues: mobileScore < 70 ? ['Small touch targets'] : [] },
      fontSize: { readable: mobileScore > 70, issues: mobileScore < 70 ? ['Small font sizes on mobile'] : [] },
      score: mobileScore,
    },
    security: {
      ssl: securityScore > 70,
      https: securityScore > 70,
      hsts: securityScore > 80,
      mixedContent: securityScore < 70,
      securityHeaders: [
        { header: 'X-Frame-Options', present: securityScore > 60, value: 'DENY' },
        { header: 'X-Content-Type-Options', present: securityScore > 65, value: 'nosniff' },
        { header: 'Content-Security-Policy', present: securityScore > 80, value: 'default-src self' },
        { header: 'Referrer-Policy', present: securityScore > 70, value: 'strict-origin' },
      ],
      score: securityScore,
    },
    sitemap: {
      present: sitemapScore > 50,
      url: `${url}/sitemap.xml`,
      valid: sitemapScore > 70,
      urls: Math.floor(50 + rand(37) * 450),
      lastModified: '2024-01-15',
      issues: sitemapScore < 70 ? ['Sitemap not found', 'Invalid sitemap format'] : [],
    },
    robots: {
      present: robotsScore > 50,
      url: `${url}/robots.txt`,
      valid: robotsScore > 70,
      sitemapRef: robotsScore > 70,
      disallowedPaths: ['/admin', '/wp-admin'],
      issues: robotsScore < 70 ? ['Missing robots.txt', 'No sitemap reference'] : [],
    },
    backlinks: {
      total: Math.floor(50 + rand(38) * 950),
      dofollow: Math.floor(rand(39) * 500),
      nofollow: Math.floor(rand(40) * 300),
      domains: Math.floor(10 + rand(41) * 90),
      authority: Math.floor(10 + rand(42) * 90),
      topDomains: [
        { domain: 'example.com', count: Math.floor(1 + rand(43) * 10), authority: Math.floor(20 + rand(44) * 80) },
        { domain: 'sample.org', count: Math.floor(1 + rand(45) * 8), authority: Math.floor(20 + rand(46) * 80) },
      ],
      score: backlinkScore,
    },
    keywords: {
      topKeywords: [
        { keyword: 'seo', count: Math.floor(5 + rand(47) * 15), density: Math.floor(rand(48) * 5) / 100 },
        { keyword: 'marketing', count: Math.floor(3 + rand(49) * 10), density: Math.floor(rand(50) * 4) / 100 },
        { keyword: 'digital', count: Math.floor(2 + rand(51) * 8), density: Math.floor(rand(52) * 3) / 100 },
      ],
      titleKeywords: ['seo', 'marketing'],
      headingKeywords: ['digital', 'seo'],
      contentKeywords: ['marketing', 'digital', 'seo'],
      keywordCannibalization: keywordScore < 60 ? ['Multiple pages targeting "seo"'] : [],
      score: keywordScore,
    },
    traffic: {
      estimatedMonthly: Math.floor(1000 + rand(53) * 99000),
      organic: Math.floor(60 + rand(54) * 40),
      paid: Math.floor(rand(55) * 40),
      sources: [
        { source: 'Organic Search', percentage: Math.floor(40 + rand(56) * 40) },
        { source: 'Direct', percentage: Math.floor(10 + rand(57) * 20) },
        { source: 'Referral', percentage: Math.floor(5 + rand(58) * 15) },
        { source: 'Social', percentage: Math.floor(5 + rand(59) * 15) },
      ],
      trend: rand(60) > 0.5 ? 'up' : rand(60) > 0.3 ? 'stable' : 'down',
      score: trafficScore,
    },
  };
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'excellent': return '#22c55e';
    case 'good': return '#3b82f6';
    case 'needs-work': return '#f59e0b';
    case 'critical': return '#ef4444';
    default: return '#6b7280';
  }
}

export function getStatusBg(status: string): string {
  switch (status) {
    case 'excellent': return 'rgba(34, 197, 94, 0.1)';
    case 'good': return 'rgba(59, 130, 246, 0.1)';
    case 'needs-work': return 'rgba(245, 158, 11, 0.1)';
    case 'critical': return 'rgba(239, 68, 68, 0.1)';
    default: return 'rgba(107, 114, 128, 0.1)';
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'excellent': return 'Excellent';
    case 'good': return 'Good';
    case 'needs-work': return 'Needs Work';
    case 'critical': return 'Critical';
    default: return 'Unknown';
  }
}
