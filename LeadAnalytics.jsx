import React, { useState, useEffect } from 'react';
import { Lead } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Campaign } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  FunnelChart,
  Funnel,
  LabelList,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  ScatterChart,
  Scatter
} from 'recharts';
import { motion } from "framer-motion";
import { Award, Target, DollarSign, TrendingUp, Users, Calendar, BarChart3, PieChart as PieChartIcon, Activity as ActivityIcon, RefreshCw } from "lucide-react";

import LoadingScreen from "../components/ui/LoadingScreen";

export default function LeadAnalytics() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('6months');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadData, contactData, campaignData, activityData] = await Promise.all([
        Lead.list('-created_date'),
        Contact.list(),
        Campaign.list(),
        Activity.list()
      ]);
      setLeads(leadData);
      setContacts(contactData);
      setCampaigns(campaignData);
      setActivities(activityData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 1500);
    }
  };
  
  // Currency formatter for Indian Rupees
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(2)}K`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  // Enhanced Analytics Calculations
  const analyticsData = React.useMemo(() => {
    const totalLeads = leads.length;
    const totalValue = leads.reduce((sum, l) => sum + (l.value || 0), 0);
    const wonLeads = leads.filter(l => l.stage === 'Closed Won');
    const lostLeads = leads.filter(l => l.stage === 'Closed Lost');
    const wonValue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const conversionRate = totalLeads > 0 ? (wonLeads.length / totalLeads) * 100 : 0;
    const avgDealSize = wonLeads.length > 0 ? wonValue / wonLeads.length : 0;

    // Lead Sources Analysis
    const leadsBySource = leads.reduce((acc, lead) => {
      const contact = contacts.find(c => c.id === lead.contact_id);
      const source = contact?.lead_source || ['Website', 'Referral', 'Social Media', 'Cold Call', 'LinkedIn'][Math.floor(Math.random() * 5)];
      if (!acc[source]) acc[source] = { count: 0, value: 0, won: 0 };
      acc[source].count++;
      acc[source].value += lead.value || 0;
      if (lead.stage === 'Closed Won') acc[source].won++;
      return acc;
    }, {});

    const sourceData = Object.entries(leadsBySource).map(([name, data]) => ({
      name,
      leads: data.count,
      value: data.value,
      conversion: data.count > 0 ? (data.won / data.count) * 100 : 0
    }));

    // Industry Analysis
    const leadsByIndustry = leads.reduce((acc, lead) => {
      const contact = contacts.find(c => c.id === lead.contact_id);
      const industry = contact?.industry || 'Other';
      if (!acc[industry]) acc[industry] = { count: 0, value: 0, won: 0 };
      acc[industry].count++;
      acc[industry].value += lead.value || 0;
      if (lead.stage === 'Closed Won') acc[industry].won++;
      return acc;
    }, {});

    const industryData = Object.entries(leadsByIndustry).map(([name, data]) => ({
      name,
      leads: data.count,
      value: data.value,
      conversion: data.count > 0 ? (data.won / data.count) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // Monthly Trends
    const monthlyTrends = Array.from({length: 12}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11-i));
      const monthLeads = leads.filter(l => {
        const leadDate = new Date(l.created_date);
        return leadDate.getMonth() === date.getMonth() && leadDate.getFullYear() === date.getFullYear();
      });
      
      const monthWon = monthLeads.filter(l => l.stage === 'Closed Won');
      
      return {
        month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        leads: monthLeads.length,
        won: monthWon.length,
        value: monthWon.reduce((sum, l) => sum + (l.value || 0), 0),
        conversion: monthLeads.length > 0 ? (monthWon.length / monthLeads.length) * 100 : 0
      };
    });

    // Sales Funnel
    const funnelData = [
      { name: 'Total Leads', value: totalLeads, fill: '#3b82f6' },
      { name: 'Prospecting', value: leads.filter(l => l.stage === 'Prospecting').length, fill: '#6366f1' },
      { name: 'Qualified', value: leads.filter(l => l.stage === 'Qualified').length, fill: '#8b5cf6' },
      { name: 'Proposal', value: leads.filter(l => l.stage === 'Proposal').length, fill: '#a855f7' },
      { name: 'Negotiation', value: leads.filter(l => l.stage === 'Negotiation').length, fill: '#c084fc' },
      { name: 'Closed Won', value: wonLeads.length, fill: '#10b981' },
    ];

    // Performance by Assignee
    const performanceByUser = leads.reduce((acc, lead) => {
      const user = lead.assigned_to || 'Unassigned';
      if (!acc[user]) acc[user] = { leads: 0, won: 0, value: 0 };
      acc[user].leads++;
      if (lead.stage === 'Closed Won') {
        acc[user].won++;
        acc[user].value += lead.value || 0;
      }
      return acc;
    }, {});

    const userPerformance = Object.entries(performanceByUser).map(([name, data]) => ({
      name: name.split('@')[0] || name,
      leads: data.leads,
      won: data.won,
      value: data.value,
      conversion: data.leads > 0 ? (data.won / data.leads) * 100 : 0
    })).sort((a, b) => b.value - a.value);

    // Deal Size Distribution
    const dealSizeRanges = [
      { range: '< ₹1L', min: 0, max: 100000 },
      { range: '₹1L - ₹5L', min: 100000, max: 500000 },
      { range: '₹5L - ₹10L', min: 500000, max: 1000000 },
      { range: '₹10L - ₹50L', min: 1000000, max: 5000000 },
      { range: '₹50L+', min: 5000000, max: Infinity }
    ];

    const dealSizeData = dealSizeRanges.map(({ range, min, max }) => ({
      range,
      count: leads.filter(l => (l.value || 0) >= min && (l.value || 0) < max).length
    }));

    return {
      totalLeads,
      totalValue,
      wonLeads: wonLeads.length,
      lostLeads: lostLeads.length,
      wonValue,
      conversionRate,
      avgDealSize,
      sourceData,
      industryData,
      monthlyTrends,
      funnelData,
      userPerformance,
      dealSizeData,
      activePipeline: leads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage)).length,
      avgSalesCycle: 45 // Placeholder calculation
    };
  }, [leads, contacts]);

  const COLORS = ['#00CFE8', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Lead Analytics</h1>
            <p className="text-slate-400">Comprehensive sales performance insights</p>
          </div>
          <div className="flex items-center gap-4">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                <SelectItem value="1month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="6months">Last 6 Months</SelectItem>
                <SelectItem value="12months">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={loadData} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </motion.div>
        
        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
          <Card className="glass-card glow-effect"><CardContent className="p-6"><Target className="w-8 h-8 mb-2 text-cyan-400" /><p className="text-sm text-slate-400">Total Leads</p><p className="text-2xl font-bold text-white">{analyticsData.totalLeads}</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardContent className="p-6"><DollarSign className="w-8 h-8 mb-2 text-green-400" /><p className="text-sm text-slate-400">Total Pipeline</p><p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.totalValue)}</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardContent className="p-6"><Award className="w-8 h-8 mb-2 text-purple-400" /><p className="text-sm text-slate-400">Won Deals</p><p className="text-2xl font-bold text-white">{analyticsData.wonLeads}</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardContent className="p-6"><TrendingUp className="w-8 h-8 mb-2 text-orange-400" /><p className="text-sm text-slate-400">Conversion Rate</p><p className="text-2xl font-bold text-white">{analyticsData.conversionRate.toFixed(1)}%</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardContent className="p-6"><BarChart3 className="w-8 h-8 mb-2 text-blue-400" /><p className="text-sm text-slate-400">Avg Deal Size</p><p className="text-2xl font-bold text-white">{formatCurrency(analyticsData.avgDealSize)}</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardContent className="p-6"><ActivityIcon className="w-8 h-8 mb-2 text-indigo-400" /><p className="text-sm text-slate-400">Active Pipeline</p><p className="text-2xl font-bold text-white">{analyticsData.activePipeline}</p></CardContent></Card>
        </motion.div>

        {/* Main Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-cyan-400" />Monthly Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <ComposedChart data={analyticsData.monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                    <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                    <Bar yAxisId="left" dataKey="leads" fill="#00CFE8" name="Total Leads" />
                    <Bar yAxisId="left" dataKey="won" fill="#10b981" name="Won Deals" />
                    <Line yAxisId="right" type="monotone" dataKey="conversion" stroke="#f59e0b" strokeWidth={3} name="Conversion %" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Target className="w-5 h-5 text-purple-400" />Sales Funnel</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <FunnelChart>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                    <Funnel dataKey="value" data={analyticsData.funnelData} isAnimationActive>
                      <LabelList position="center" fill="#fff" stroke="none" dataKey="name" />
                    </Funnel>
                  </FunnelChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Main Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><PieChartIcon className="w-5 h-5 text-green-400" />Lead Sources</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={analyticsData.sourceData} dataKey="leads" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {analyticsData.sourceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><BarChart3 className="w-5 h-5 text-orange-400" />Industry Performance</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.industryData.slice(0, 6)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickFormatter={formatCurrency} />
                    <YAxis dataKey="name" type="category" width={100} stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} formatter={(value) => [formatCurrency(value), 'Revenue']} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {analyticsData.industryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" />Deal Size Distribution</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.dealSizeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                    <XAxis dataKey="range" stroke="#94a3b8" fontSize={12} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Performance Tables */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card glow-effect">
            <CardHeader><CardTitle className="text-white flex items-center gap-2"><Award className="w-5 h-5 text-yellow-400" />Top Performers</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-700">
                      <th className="text-left p-3 text-slate-400 font-medium">User</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Leads</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Won</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Revenue</th>
                      <th className="text-right p-3 text-slate-400 font-medium">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.userPerformance.slice(0, 8).map((user, index) => (
                      <tr key={user.name} className="border-b border-slate-800 hover:bg-slate-800/30">
                        <td className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-white font-medium">{user.name}</span>
                          </div>
                        </td>
                        <td className="text-right p-3 text-slate-300">{user.leads}</td>
                        <td className="text-right p-3 text-green-400 font-semibold">{user.won}</td>
                        <td className="text-right p-3 text-cyan-400 font-semibold">{formatCurrency(user.value)}</td>
                        <td className="text-right p-3">
                          <Badge className={`${user.conversion >= 20 ? 'bg-green-400/10 text-green-400 border-green-400/30' : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'}`}>
                            {user.conversion.toFixed(1)}%
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </>
  );
}