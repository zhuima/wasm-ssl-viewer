'use client';

import {
  LineChart as RechartsLineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

// Certificate expiry timeline data
const lineChartData = [
  { name: 'Jan', expiring: 3, renewed: 5 },
  { name: 'Feb', expiring: 5, renewed: 3 },
  { name: 'Mar', expiring: 2, renewed: 8 },
  { name: 'Apr', expiring: 8, renewed: 6 },
  { name: 'May', expiring: 15, renewed: 10 },
  { name: 'Jun', expiring: 5, renewed: 12 },
];

// SSL certificate types data
const barChartData = [
  { name: 'DV', value: 42 },
  { name: 'OV', value: 28 },
  { name: 'EV', value: 15 },
  { name: 'Wildcard', value: 35 },
  { name: 'Self-Signed', value: 8 },
];

// Certificate issuers data
const pieChartData = [
  { name: 'Let\'s Encrypt', value: 45 },
  { name: 'DigiCert', value: 25 },
  { name: 'Comodo', value: 15 },
  { name: 'GoDaddy', value: 10 },
  { name: 'GlobalSign', value: 5 },
];

// Certificate security score data
const areaChartData = [
  { name: 'Week 1', score: 75 },
  { name: 'Week 2', score: 82 },
  { name: 'Week 3', score: 88 },
  { name: 'Week 4', score: 85 },
  { name: 'Week 5', score: 90 },
  { name: 'Week 6', score: 95 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function LineChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={lineChartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#718096" />
        <YAxis stroke="#718096" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="expiring"
          stroke="#EF4444"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          name="Expiring Certificates"
        />
        <Line
          type="monotone"
          dataKey="renewed"
          stroke="#10B981"
          strokeWidth={2}
          name="Renewed Certificates"
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

export function BarChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={barChartData}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#718096" />
        <YAxis stroke="#718096" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
        <Bar dataKey="value" name="Certificate Count">
          {barChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </RechartsBarChart>
    </ResponsiveContainer>
  );
}

export function PieChartComponent() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieChartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
        >
          {pieChartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function AreaChartComponent() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={areaChartData}
        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" stroke="#718096" />
        <YAxis stroke="#718096" />
        <Tooltip 
          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
        />
        <Area 
          type="monotone" 
          dataKey="score" 
          stroke="#8884d8" 
          fill="url(#colorScore)" 
          name="Security Score"
        />
        <defs>
          <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.2}/>
          </linearGradient>
        </defs>
      </AreaChart>
    </ResponsiveContainer>
  );
} 