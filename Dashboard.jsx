import React, { useState, useEffect, useMemo } from "react";
import { Contact } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Activity } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Users, Target, DollarSign, TrendingUp, Activity as ActivityIcon, RefreshCw, LineChart as LineChartIcon, PieChart as PieChartIcon, Clock, Award, Calendar
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, FunnelChart, Funnel, LabelList
} from 'recharts';
import { motion } from "framer-motion";
import { differenceInDays, parseISO, format } from 'date-fns';

import LoadingScreen from "../components/ui/LoadingScreen";

// Animated Counter Component
const AnimatedCounter = ({ value, prefix = "", suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const end = parseFloat(String(value).replace(/[^0-9.-]+/g, ""));
    if (isNaN(end)) return;

    let start = 0;
    const duration = 1500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    const increment = (end - start) / totalFrames;
    let currentFrame = 0;

    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame === totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(parseFloat(start.toFixed(2)));
      }
    }, frameDuration);

    return () => clearInterval(timer);
  }, [value]);

  const formatDisplay = (num) => {
    if (typeof num !== 'number') return '0';
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  }

  return <span>{prefix}{formatDisplay(count)}{suffix}</span>;
};


export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const [contactsData, leadsData, activitiesData, usersData] = await Promise.all([
        Contact.list('-created_date', 500),
        Lead.list('-created_date', 500),
        Activity.list('-created_date', 500),
        User.list()
      ]);

      setContacts(contactsData);
      setLeads(leadsData);
      setActivities(activitiesData);
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      if (!isRefresh) setTimeout(() => setIsLoading(false), 1500);
    }
  };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const analyticsData = useMemo(() => {
    const wonLeads = leads.filter(l => l.stage === 'Closed Won');
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    const salesCycleDuration = wonLeads.length > 0 ? wonLeads.reduce((sum, l) => {
      const created = parseISO(l.created_date);
      const closed = parseISO(l.updated_date);
      return sum + differenceInDays(closed, created);
    }, 0) / wonLeads.length : 0;

    const revenueByIndustry = wonLeads.reduce((acc, lead) => {
      const contact = contacts.find(c => c.id === lead.contact_id);
      const industry = contact?.industry || 'Uncategorized';
      acc[industry] = (acc[industry] || 0) + lead.value;
      return acc;
    }, {});

    return {
      totalRevenue,
      conversionRate: leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0,
      dealVelocity: salesCycleDuration.toFixed(1),
      pipelineValue: leads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage)).reduce((sum, l) => sum + (l.value || 0), 0),
      industryRevenueData: Object.entries(revenueByIndustry).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
      funnelData: [
        { name: 'Prospecting', value: leads.filter(l => l.stage === 'Prospecting').length, fill: '#3b82f6' },
        { name: 'Qualified', value: leads.filter(l => l.stage === 'Qualified').length, fill: '#6366f1' },
        { name: 'Proposal', value: leads.filter(l => l.stage === 'Proposal').length, fill: '#8b5cf6' },
        { name: 'Negotiation', value: leads.filter(l => l.stage === 'Negotiation').length, fill: '#a855f7' },
        { name: 'Closed Won', value: wonLeads.length, fill: '#10b981' },
      ],
    };
  }, [leads, contacts]);

  const revenueByMonth = useMemo(() => {
    const monthData = {};
    leads.filter(l => l.stage === 'Closed Won').forEach(l => {
      const month = format(parseISO(l.updated_date), 'MMM yyyy');
      monthData[month] = (monthData[month] || 0) + l.value;
    });
    return Object.entries(monthData).map(([name, revenue]) => ({ name, revenue }));
  }, [leads]);

  const COLORS = ['#00CFE8', '#00A9E8', '#0084E8', '#005FE8', '#3D4EE8'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <div className="space-y-8">
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 gradient-text">
              Business Intelligence Dashboard
            </h1>
            <p className="text-lg text-slate-400">Transform your data into actionable insights</p>
          </motion.div>

          {/* Key Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card glow-effect transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Revenue</CardTitle>
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center border border-green-500/30">
                  <DollarSign className="h-5 w-5 text-green-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={analyticsData.totalRevenue} prefix="₹" />
                </div>
                <p className="text-xs text-green-400 mt-1 font-medium">+20.1% from last month</p>
              </CardContent>
            </Card>

            <Card className="glass-card glow-effect transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Pipeline Value</CardTitle>
                <div className="w-10 h-10 bg-cyan-500/10 rounded-full flex items-center justify-center border border-cyan-500/30">
                  <Target className="h-5 w-5 text-cyan-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={analyticsData.pipelineValue} prefix="₹" />
                </div>
                <p className="text-xs text-cyan-400 mt-1 font-medium">{leads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage)).length} active leads</p>
              </CardContent>
            </Card>

            <Card className="glass-card glow-effect transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Conversion Rate</CardTitle>
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center border border-purple-500/30">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={analyticsData.conversionRate} suffix="%" />
                </div>
                <p className="text-xs text-purple-400 mt-1 font-medium">+5.2% this quarter</p>
              </CardContent>
            </Card>

            <Card className="glass-card glow-effect transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Avg. Sales Cycle</CardTitle>
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center border border-orange-500/30">
                  <Clock className="h-5 w-5 text-orange-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  <AnimatedCounter value={analyticsData.dealVelocity} suffix=" days" />
                </div>
                <p className="text-xs text-orange-400 mt-1 font-medium">2 days faster than average</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Revenue Trends */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <Card className="glass-card h-full glow-effect">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">
                    Revenue Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueByMonth} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00CFE8" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#00CFE8" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="rgba(255, 255, 255, 0.1)" strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} stroke="#7f8ea3" />
                      <YAxis fontSize={12} stroke="#7f8ea3" tickFormatter={formatCurrency} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(13, 17, 23, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#CDD6F4'
                        }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#00CFE8" strokeWidth={2} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sales Funnel */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card h-full glow-effect">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-white">
                    Sales Pipeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <FunnelChart>
                      <Tooltip contentStyle={{
                          backgroundColor: 'rgba(13, 17, 23, 0.8)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: '#CDD6F4'
                      }} />
                      <Funnel dataKey="value" data={analyticsData.funnelData.map((d, i) => ({...d, fill: COLORS[i]}))} isAnimationActive>
                        <LabelList position="right" fill="#CDD6F4" stroke="none" dataKey="name" fontSize={12} />
                      </Funnel>
                    </FunnelChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Industry Revenue */}
            <motion.div variants={itemVariants} className="lg:col-span-5">
              <Card className="glass-card h-full glow-effect">
                <CardHeader>
                  <CardTitle className="text-white">Revenue by Industry</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={analyticsData.industryRevenueData} layout="vertical">
                      <CartesianGrid stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
                      <XAxis type="number" stroke="#7f8ea3" tickFormatter={formatCurrency} fontSize={12} />
                      <YAxis dataKey="name" type="category" width={100} stroke="#7f8ea3" fontSize={12} />
                      <Tooltip
                        contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }}
                        formatter={(value) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                        {analyticsData.industryRevenueData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>

            {/* Leaderboard & Tasks */}
            <motion.div variants={itemVariants} className="lg:col-span-7 space-y-6">
              <Card className="glass-card glow-effect">
                <CardHeader>
                  <CardTitle className="text-white">Top Performers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[...users].sort((a, b) => {
                      const aRevenue = leads.filter(l => l.assigned_to === a.email && l.stage === 'Closed Won').reduce((sum, l) => sum + l.value, 0);
                      const bRevenue = leads.filter(l => l.assigned_to === b.email && l.stage === 'Closed Won').reduce((sum, l) => sum + l.value, 0);
                      return bRevenue - aRevenue;
                    }).slice(0, 3).map((performer, i) => {
                      const revenue = leads.filter(l => l.assigned_to === performer.email && l.stage === 'Closed Won').reduce((sum, l) => sum + l.value, 0);
                      return (
                        <div key={performer.id} className="flex items-center gap-4 p-2 rounded-lg hover:bg-white/5">
                          <span className={`text-xl font-bold ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-400' : 'text-orange-400'}`}>#{i + 1}</span>
                          <div className="w-10 h-10 bg-cyan-400/10 rounded-full flex items-center justify-center text-cyan-400 font-bold border border-cyan-400/20">{performer.full_name.charAt(0).toUpperCase()}</div>
                          <div className="flex-1">
                            <p className="font-semibold text-white">{performer.full_name}</p>
                            <p className="text-sm text-slate-400">{performer.position}</p>
                          </div>
                          <div className="text-lg font-bold text-green-400">{formatCurrency(revenue)}</div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card glow-effect">
                <CardHeader>
                  <CardTitle className="text-white">Upcoming Tasks</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {activities.filter(a => a.status === 'Scheduled').slice(0, 3).map((task) => (
                      <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5">
                        <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center border border-cyan-400/20"><Calendar className="w-5 h-5 text-cyan-400" /></div>
                        <div className="flex-1">
                          <p className="font-semibold text-white">{task.title}</p>
                          <p className="text-xs text-slate-400">{format(new Date(task.scheduled_date), 'MMM d, h:mm a')}</p>
                        </div>
                        <Badge variant="outline" className="border-cyan-400/50 text-cyan-400">{task.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
}