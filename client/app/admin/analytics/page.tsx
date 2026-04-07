'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, BarChart, Bar, Cell, PieChart, Pie,
} from 'recharts';

/* ─── MOCK DATA ────────────────────────────────────────────────────────────── */

// 7-day sparkline data for stat cards
const sparkPageViews = [6200, 7100, 7800, 6900, 7500, 5200, 7591];
const sparkVisitors  = [4100, 4700, 5200, 4500, 4900, 3400, 5047];
const sparkDuration  = [245, 268, 278, 255, 272, 290, 272];
const sparkBounce    = [42, 39, 37, 40, 38, 41, 38.2];

// 30-day views data with Kenyan traffic pattern (weekday peaks, weekend dips)
function generateTrafficData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const day = date.getDay(); // 0=Sun, 6=Sat
    const isWeekend = day === 0 || day === 6;
    const base = isWeekend ? 1100 : 1800;
    const variance = Math.floor(Math.random() * 400) - 200;
    const pageViews = base + variance;
    const uniqueVisitors = Math.floor(pageViews * (0.58 + Math.random() * 0.12));
    data.push({
      date: date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      pageViews,
      uniqueVisitors,
    });
  }
  return data;
}

const topArticles = [
  { title: 'Building Scalable APIs with Node.js and PostgreSQL', views: 8421 },
  { title: 'M-Pesa Integration Guide for React Native Apps', views: 7893 },
  { title: 'Kenya\'s Silicon Savannah: A Developer\'s Guide', views: 6234 },
  { title: 'TypeScript Best Practices for Production Code', views: 5891 },
  { title: 'Introduction to Machine Learning with Python', views: 4567 },
  { title: 'Docker and Kubernetes for African Startups', views: 3982 },
  { title: 'CSS Grid vs Flexbox: When to Use Which', views: 3456 },
  { title: 'React Server Components Deep Dive', views: 2987 },
];

const funnelData = [
  { label: 'Visitors', value: 31847, pct: '100%', ratio: 1 },
  { label: 'Article Readers', value: 21656, pct: '68%', ratio: 0.68 },
  { label: 'Newsletter CTA Seen', value: 7643, pct: '24%', ratio: 0.24 },
  { label: 'Subscribers', value: 1019, pct: '3.2%', ratio: 0.032 },
];

const trafficSources = [
  { name: 'Direct', value: 35, color: 'var(--green)' },
  { name: 'Organic Search', value: 28, color: 'var(--gold)' },
  { name: 'Social Media', value: 22, color: 'var(--terra)' },
  { name: 'Referral', value: 15, color: 'var(--green2)' },
];

const geoData = [
  { country: '🇰🇪 Kenya', sessions: 19746, pct: '62%', avgTime: '5m 12s', highlight: true },
  { country: '🇳🇬 Nigeria', sessions: 3503, pct: '11%', avgTime: '3m 48s', highlight: false },
  { country: '🇺🇬 Uganda', sessions: 2548, pct: '8%', avgTime: '4m 02s', highlight: false },
  { country: '🇿🇦 South Africa', sessions: 2229, pct: '7%', avgTime: '3m 35s', highlight: false },
  { country: '🇹🇿 Tanzania', sessions: 1592, pct: '5%', avgTime: '3m 58s', highlight: false },
  { country: '🇬🇧 United Kingdom', sessions: 955, pct: '3%', avgTime: '2m 45s', highlight: false },
  { country: '🇺🇸 United States', sessions: 637, pct: '2%', avgTime: '2m 21s', highlight: false },
  { country: '🌍 Other', sessions: 637, pct: '2%', avgTime: '2m 10s', highlight: false },
];

const categoryPerf = [
  { category: 'Engineering', views: 12400, conversions: 384 },
  { category: 'Mobile Dev', views: 9800, conversions: 312 },
  { category: 'DevOps', views: 7200, conversions: 198 },
  { category: 'AI/ML', views: 6500, conversions: 245 },
  { category: 'Startups', views: 5100, conversions: 167 },
  { category: 'Web Dev', views: 4800, conversions: 134 },
  { category: 'Career', views: 2491, conversions: 89 },
];

/* ─── MINI SPARKLINE (SVG) ─────────────────────────────────────────────────── */
function Sparkline({ data, color, width = 90, height = 28 }: {
  data: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={areaPoints}
        fill={color}
        fillOpacity={0.08}
        stroke="none"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ─── CUSTOM TOOLTIP ───────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--char)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: '.65rem .9rem',
      boxShadow: 'var(--sh-float)',
    }}>
      <div style={{
        fontFamily: "'IBM Plex Mono', monospace",
        fontSize: '.65rem',
        letterSpacing: '.08em',
        textTransform: 'uppercase' as const,
        color: 'rgba(246,244,240,.5)',
        marginBottom: '.35rem',
      }}>
        {label}
      </div>
      {payload.map((entry: any, i: number) => (
        <div key={i} style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.4rem',
          fontSize: '.78rem',
          color: '#F6F4F0',
          fontWeight: 500,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: entry.color,
            flexShrink: 0,
          }} />
          {entry.name}: {entry.value.toLocaleString()}
        </div>
      ))}
    </div>
  );
}

/* ─── DOUGHNUT CENTER LABEL ────────────────────────────────────────────────── */
function DoughnutCenter({ viewBox }: any) {
  const { cx, cy } = viewBox;
  return (
    <g>
      <text
        x={cx} y={cy - 6}
        textAnchor="middle"
        style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', fontWeight: 900, fill: 'var(--char)' }}
      >
        31.8K
      </text>
      <text
        x={cx} y={cy + 16}
        textAnchor="middle"
        style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '.55rem', letterSpacing: '.12em', textTransform: 'uppercase' as const, fill: 'var(--muted)' }}
      >
        VISITORS
      </text>
    </g>
  );
}

/* ─── MAIN COMPONENT ──────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [trafficData, setTrafficData] = useState<any[]>([]);
  const [resolvedColors, setResolvedColors] = useState({
    green: '#1A4331',
    gold: '#E8A317',
    terra: '#C84C31',
    green2: '#2a6649',
    char: '#1C1C1E',
    border: '#ddd8d0',
    muted: '#7a7268',
    surface: '#ffffff',
  });

  useEffect(() => {
    setTrafficData(generateTrafficData());
    // Resolve CSS variables for recharts (which needs raw hex)
    const root = getComputedStyle(document.documentElement);
    setResolvedColors({
      green: root.getPropertyValue('--green').trim() || '#1A4331',
      gold: root.getPropertyValue('--gold').trim() || '#E8A317',
      terra: root.getPropertyValue('--terra').trim() || '#C84C31',
      green2: root.getPropertyValue('--green2').trim() || '#2a6649',
      char: root.getPropertyValue('--char').trim() || '#1C1C1E',
      border: root.getPropertyValue('--border').trim() || '#ddd8d0',
      muted: root.getPropertyValue('--muted').trim() || '#7a7268',
      surface: root.getPropertyValue('--surface').trim() || '#ffffff',
    });
  }, []);

  const maxArticleViews = topArticles[0]?.views || 1;

  return (
    <div>
      {/* inject keyframes */}
      <style>{`
        @keyframes analyticsSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .analytics-card {
          animation: analyticsSlideUp .4s var(--ease-enter) both;
        }
        .analytics-card:nth-child(2) { animation-delay: .06s; }
        .analytics-card:nth-child(3) { animation-delay: .12s; }
        .analytics-card:nth-child(4) { animation-delay: .18s; }
        .recharts-cartesian-grid-horizontal line,
        .recharts-cartesian-grid-vertical line {
          stroke: var(--border) !important;
          stroke-opacity: 0.5;
        }
      `}</style>

      {/* ── SECTION 1: OVERVIEW STAT CARDS ────────────────── */}
      <div style={cs.statsGrid}>
        <StatCard
          label="Total Page Views"
          value="48,291"
          trend="+12.4%"
          trendUp
          sparkData={sparkPageViews}
          sparkColor={resolvedColors.green}
        />
        <StatCard
          label="Unique Visitors"
          value="31,847"
          trend="+8.7%"
          trendUp
          sparkData={sparkVisitors}
          sparkColor={resolvedColors.gold}
        />
        <StatCard
          label="Avg Session Duration"
          value="4m 32s"
          trend="+0.8%"
          trendUp
          sparkData={sparkDuration}
          sparkColor={resolvedColors.green2}
        />
        <StatCard
          label="Bounce Rate"
          value="38.2%"
          trend="-2.1%"
          trendUp
          sparkData={sparkBounce}
          sparkColor={resolvedColors.terra}
        />
      </div>

      {/* ── SECTION 2: VIEWS OVER TIME ────────────────────── */}
      <div className="analytics-card" style={{ ...cs.card, marginBottom: '1.75rem', padding: '1.5rem' }}>
        <SectionHeader title="Views Over Time" sub="Last 30 days" />
        <div style={{ width: '100%', height: 320 }}>
          {trafficData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trafficData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: resolvedColors.muted }}
                  tickLine={false}
                  axisLine={{ stroke: resolvedColors.border }}
                  interval={4}
                />
                <YAxis
                  tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: resolvedColors.muted }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.68rem',
                    letterSpacing: '.04em',
                    paddingBottom: 8,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke={resolvedColors.green}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="uniqueVisitors"
                  name="Unique Visitors"
                  stroke={resolvedColors.gold}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── SECTION 3: TWO-COLUMN: TOP ARTICLES + FUNNEL ─── */}
      <div style={cs.twoCol}>
        {/* LEFT: Top Articles by Views */}
        <div className="analytics-card" style={cs.card}>
          <SectionHeader title="Top Articles by Views" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {topArticles.map((article, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '.75rem',
              }}>
                <span style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '.65rem',
                  color: 'var(--muted)',
                  minWidth: 18,
                  textAlign: 'right' as const,
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '.78rem',
                    fontWeight: 500,
                    color: 'var(--char)',
                    marginBottom: '.3rem',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  } as React.CSSProperties}>
                    {article.title.length > 35 ? article.title.slice(0, 35) + '…' : article.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <div style={{
                      flex: 1,
                      height: 6,
                      borderRadius: 3,
                      background: 'var(--border)',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${(article.views / maxArticleViews) * 100}%`,
                        height: '100%',
                        borderRadius: 3,
                        background: 'var(--green)',
                        transition: 'width .6s var(--ease-spring)',
                      }} />
                    </div>
                    <span style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '.65rem',
                      color: 'var(--muted)',
                      minWidth: 36,
                      textAlign: 'right' as const,
                    }}>
                      {article.views.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Subscriber Conversion Funnel */}
        <div className="analytics-card" style={cs.card}>
          <SectionHeader title="Subscriber Conversion Funnel" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.5rem' }}>
            {funnelData.map((step, i) => {
              // green gradient from dark to light
              const opacity = 1 - (i * 0.22);
              return (
                <div key={i}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'baseline',
                    marginBottom: '.3rem',
                  }}>
                    <span style={{
                      fontSize: '.78rem',
                      fontWeight: 500,
                      color: 'var(--char)',
                    }}>
                      {step.label}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '.4rem' }}>
                      <span style={{
                        fontFamily: "'Fraunces', serif",
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        color: 'var(--char)',
                      }}>
                        {step.value.toLocaleString()}
                      </span>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '.65rem',
                        color: 'var(--muted)',
                      }}>
                        {step.pct}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    height: 32,
                    borderRadius: 6,
                    background: 'var(--border)',
                    overflow: 'hidden',
                    position: 'relative',
                  }}>
                    <div style={{
                      width: `${step.ratio * 100}%`,
                      height: '100%',
                      borderRadius: 6,
                      background: `var(--green)`,
                      opacity,
                      transition: 'width .8s var(--ease-spring)',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '.75rem',
                    }}>
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '.6rem',
                        letterSpacing: '.06em',
                        color: '#F6F4F0',
                        fontWeight: 500,
                        opacity: step.ratio >= 0.15 ? 1 : 0,
                      }}>
                        {step.pct}
                      </span>
                    </div>
                  </div>
                  {i < funnelData.length - 1 && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '.15rem 0',
                      color: 'var(--muted)',
                      fontSize: '.6rem',
                    }}>
                      ▼
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SECTION 4: TRAFFIC SOURCES (DOUGHNUT) ─────────── */}
      <div className="analytics-card" style={{ ...cs.card, marginBottom: '1.75rem', padding: '1.5rem' }}>
        <SectionHeader title="Traffic Sources" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap' }}>
          <div style={{ width: 240, height: 240 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={105}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {trafficSources.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0 ? resolvedColors.green :
                        i === 1 ? resolvedColors.gold :
                        i === 2 ? resolvedColors.terra :
                        resolvedColors.green2
                      }
                    />
                  ))}
                  <Label content={<DoughnutCenter />} position="center" />
                </Pie>
                <Tooltip
                  formatter={(value: any) => `${value}%`}
                  contentStyle={{
                    background: 'var(--char)',
                    border: '1px solid var(--border)',
                    borderRadius: 8,
                    color: '#F6F4F0',
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.75rem',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
            {trafficSources.map((source, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '.65rem' }}>
                <span style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: source.color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontSize: '.85rem',
                  fontWeight: 500,
                  color: 'var(--char)',
                  minWidth: 120,
                }}>
                  {source.name}
                </span>
                <span style={{
                  fontFamily: "'Fraunces', serif",
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: 'var(--char)',
                }}>
                  {source.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── SECTION 5: GEOGRAPHIC BREAKDOWN ───────────────── */}
      <div className="analytics-card" style={{ ...cs.card, marginBottom: '1.75rem', padding: '1.5rem' }}>
        <SectionHeader title="Geographic Breakdown" />
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Country', 'Sessions', '% of Total', 'Avg Time on Page'].map(h => (
                  <th key={h} style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.6rem',
                    letterSpacing: '.12em',
                    textTransform: 'uppercase' as const,
                    color: 'var(--muted)',
                    fontWeight: 500,
                    padding: '.6rem .75rem',
                    textAlign: h === 'Country' ? 'left' : 'right' as const,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {geoData.map((row, i) => (
                <tr
                  key={i}
                  style={{
                    background: row.highlight ? 'rgba(26,67,49,0.06)' : 'transparent',
                    transition: 'background .15s',
                  }}
                  onMouseEnter={e => {
                    if (!row.highlight) e.currentTarget.style.background = 'rgba(26,67,49,0.03)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = row.highlight ? 'rgba(26,67,49,0.06)' : 'transparent';
                  }}
                >
                  <td style={{
                    padding: '.7rem .75rem',
                    fontSize: '.85rem',
                    fontWeight: row.highlight ? 600 : 400,
                    color: 'var(--char)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {row.country}
                    {row.highlight && (
                      <span style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '.55rem',
                        letterSpacing: '.08em',
                        background: 'rgba(26,67,49,.12)',
                        color: 'var(--green)',
                        padding: '.1rem .4rem',
                        borderRadius: 10,
                        marginLeft: '.5rem',
                        textTransform: 'uppercase' as const,
                        fontWeight: 600,
                      }}>
                        TOP
                      </span>
                    )}
                  </td>
                  <td style={{
                    padding: '.7rem .75rem',
                    textAlign: 'right' as const,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.78rem',
                    color: 'var(--char)',
                    fontWeight: 500,
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {row.sessions.toLocaleString()}
                  </td>
                  <td style={{
                    padding: '.7rem .75rem',
                    textAlign: 'right' as const,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.78rem',
                    color: 'var(--muted)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {row.pct}
                  </td>
                  <td style={{
                    padding: '.7rem .75rem',
                    textAlign: 'right' as const,
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: '.78rem',
                    color: 'var(--muted)',
                    borderBottom: '1px solid var(--border)',
                  }}>
                    {row.avgTime}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── SECTION 6: CATEGORY PERFORMANCE ───────────────── */}
      <div className="analytics-card" style={{ ...cs.card, padding: '1.5rem' }}>
        <SectionHeader title="Category Performance" sub="Views vs Subscriber conversions" />
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryPerf} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="category"
                tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: resolvedColors.muted }}
                tickLine={false}
                axisLine={{ stroke: resolvedColors.border }}
              />
              <YAxis
                tick={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, fill: resolvedColors.muted }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toString()}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: '.68rem',
                  letterSpacing: '.04em',
                  paddingBottom: 8,
                }}
              />
              <Bar dataKey="views" name="Views" fill={resolvedColors.green} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="conversions" name="Conversions" fill={resolvedColors.gold} radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

/* ─── STAT CARD ────────────────────────────────────────────────────────────── */
function StatCard({ label, value, trend, trendUp, sparkData, sparkColor }: {
  label: string;
  value: string;
  trend: string;
  trendUp: boolean;
  sparkData: number[];
  sparkColor: string;
}) {
  return (
    <div className="analytics-card" style={cs.statCard}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '.5rem',
      }}>
        <div style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '.6rem',
          letterSpacing: '.14em',
          textTransform: 'uppercase' as const,
          color: 'var(--muted)',
          fontWeight: 500,
        }}>
          {label}
        </div>
        <Sparkline data={sparkData} color={sparkColor} />
      </div>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '2rem',
        fontWeight: 900,
        color: 'var(--char)',
        letterSpacing: '-.03em',
        lineHeight: 1.1,
        marginBottom: '.35rem',
      }}>
        {value}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '.35rem',
        fontSize: '.72rem',
      }}>
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '.68rem',
          fontWeight: 500,
          color: trendUp ? 'var(--green2)' : 'var(--terra)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}>
          {trendUp ? '↑' : '↓'} {trend}
        </span>
        <span style={{ color: 'var(--muted)' }}>vs last week</span>
      </div>
    </div>
  );
}

/* ─── SECTION HEADER ───────────────────────────────────────────────────────── */
function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'baseline',
      justifyContent: 'space-between',
      marginBottom: '1.25rem',
    }}>
      <div style={{
        fontFamily: "'Fraunces', serif",
        fontSize: '1.1rem',
        fontWeight: 700,
        color: 'var(--char)',
        display: 'flex',
        alignItems: 'center',
        gap: '.5rem',
      }}>
        <span style={{
          width: 3,
          height: 18,
          borderRadius: 2,
          background: 'var(--green)',
          flexShrink: 0,
        }} />
        {title}
      </div>
      {sub && (
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '.65rem',
          letterSpacing: '.06em',
          color: 'var(--muted)',
          textTransform: 'uppercase' as const,
        }}>
          {sub}
        </span>
      )}
    </div>
  );
}

/* ─── IMPORT LABEL ─────────────────────────────────────────────────────────── */
import { Label } from 'recharts';

/* ─── STYLES ───────────────────────────────────────────────────────────────── */
const cs = {
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  } as React.CSSProperties,

  statCard: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: 'var(--sh-card)',
    transition: 'transform .2s var(--ease-spring), box-shadow .2s',
  } as React.CSSProperties,

  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 12,
    padding: '1.25rem',
    boxShadow: 'var(--sh-card)',
    marginBottom: '1.75rem',
  } as React.CSSProperties,

  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '1.25rem',
    marginBottom: '1.75rem',
  } as React.CSSProperties,
};
