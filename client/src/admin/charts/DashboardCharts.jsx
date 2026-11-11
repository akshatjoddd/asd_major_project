import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTranslation } from 'react-i18next';

const ACCENT = '#d4552a';
const INK = '#14524c';
const GRID = '#e4ddcd';
const MUTED = '#7a7466';

const axis = { stroke: MUTED, fontSize: 11, tickLine: false, axisLine: false };

export function DailyChart({ data }) {
  const { t } = useTranslation();
  if (!data?.length) return <p className="chart-empty">{t('admin.dashboard.empty')}</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="dailyFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ACCENT} stopOpacity={0.35} />
            <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="label" tick={axis} />
        <YAxis tick={axis} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }}
          formatter={(value, name) => [value, name === 'bookings' ? t('admin.dashboard.bookings') : name]}
        />
        <Area type="monotone" dataKey="bookings" stroke={ACCENT} strokeWidth={2} fill="url(#dailyFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function HoursChart({ data }) {
  const { t } = useTranslation();
  if (!data?.length) return <p className="chart-empty">{t('admin.dashboard.empty')}</p>;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
        <CartesianGrid stroke={GRID} vertical={false} />
        <XAxis dataKey="hour" tick={axis} />
        <YAxis tick={axis} allowDecimals={false} />
        <Tooltip
          contentStyle={{ borderRadius: 10, border: `1px solid ${GRID}`, fontSize: 12 }}
          formatter={(value) => [value, t('admin.dashboard.visitors')]}
        />
        <Bar dataKey="visitors" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={entry.hour} fill={index === data.length - 1 ? ACCENT : INK} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
