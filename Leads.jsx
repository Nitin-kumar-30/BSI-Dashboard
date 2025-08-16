
import React, { useState, useEffect, useMemo } from 'react';
import { Lead } from '@/api/entities';
import { Contact } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, List, Kanban, Filter, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, AreaChart, XAxis, YAxis, CartesianGrid, Area } from 'recharts';

import LeadForm from '../components/leads/LeadForm';
import LeadCard from '../components/leads/LeadCard';
import PipelineBoard from '../components/leads/PipelineBoard';
import LoadingScreen from "../components/ui/LoadingScreen";

const STAGES = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('pipeline'); // 'pipeline' or 'list'
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ stage: 'all', priority: 'all' });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [leadsData, contactsData] = await Promise.all([
        Lead.list('-created_date'),
        Contact.list(),
      ]);
      setLeads(leadsData);
      setContacts(contactsData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLead = () => {
    setEditingLead(null);
    setShowForm(true);
  };

  const handleEditLead = (lead) => {
    setEditingLead(lead);
    setShowForm(true);
  };

  const handleDeleteLead = async (leadId) => {
    if (window.confirm("Are you sure you want to delete this lead?")) {
      await Lead.delete(leadId);
      loadData();
    }
  };

  const handleFormSubmit = async (leadData) => {
    if (editingLead) {
      await Lead.update(editingLead.id, leadData);
    } else {
      await Lead.create(leadData);
    }
    setShowForm(false);
    loadData();
  };

  const handleMoveLead = async (leadId, newStage) => {
    const lead = leads.find(l => l.id === leadId);
    if (lead) {
      await Lead.update(leadId, { ...lead, stage: newStage });
      loadData();
    }
  };

  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      const contact = contacts.find(c => c.id === lead.contact_id);
      const searchMatch = lead.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact && `${contact.first_name} ${contact.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const stageMatch = filters.stage === 'all' || lead.stage === filters.stage;
      const priorityMatch = filters.priority === 'all' || lead.priority === filters.priority;

      return searchMatch && stageMatch && priorityMatch;
    });
  }, [leads, contacts, searchTerm, filters]);
  
  const pipelineValue = useMemo(() => {
      return leads
        .filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage))
        .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [leads]);

  const leadsAnalytics = useMemo(() => {
    const wonLeads = leads.filter(l => l.stage === 'Closed Won');
    const totalRevenue = wonLeads.reduce((sum, l) => sum + (l.value || 0), 0);
    
    const leadsBySource = leads.reduce((acc, lead) => {
      const source = lead.source || ['Website', 'Referral', 'Social Media', 'Cold Call'][Math.floor(Math.random() * 4)];
      acc[source] = (acc[source] || 0) + 1;
      return acc;
    }, {});

    const conversionByStage = STAGES.map(stage => ({
      stage,
      count: leads.filter(l => l.stage === stage).length,
      value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (l.value || 0), 0)
    }));

    const monthlyTrend = Array.from({length: 6}, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5-i));
      const monthLeads = leads.filter(l => {
        // Ensure created_date exists and is a valid date string
        const leadDate = l.created_date ? new Date(l.created_date) : null;
        return leadDate && leadDate.getMonth() === date.getMonth() && leadDate.getFullYear() === date.getFullYear();
      });
      return {
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        leads: monthLeads.length,
        value: monthLeads.reduce((sum, l) => sum + (l.value || 0), 0)
      };
    });

    return {
      totalRevenue,
      conversionRate: leads.length > 0 ? (wonLeads.length / leads.length) * 100 : 0,
      avgDealSize: wonLeads.length > 0 ? totalRevenue / wonLeads.length : 0,
      leadsBySource: Object.entries(leadsBySource).map(([name, value]) => ({ name, value })),
      conversionByStage,
      monthlyTrend
    };
  }, [leads]);

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="h-full flex flex-col text-white">
      <LoadingScreen isLoading={isLoading} />
      <AnimatePresence>
        {showForm && (
          <LeadForm
            lead={editingLead}
            contacts={contacts}
            onSubmit={handleFormSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>

      {/* Header with Enhanced Analytics */}
      <div className="flex-shrink-0 mb-6">
        <div className="flex justify-between items-center mb-6">
            <div>
                <h1 className="text-3xl font-bold text-white">Leads Pipeline</h1>
                <p className="text-slate-400">Manage and track your sales opportunities.</p>
            </div>
            <div className="flex items-center gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-lg glass-card border border-cyan-400/20">
                      <span className="text-xs font-semibold text-slate-400 block">Pipeline Value</span>
                      <span className="text-lg font-bold text-cyan-400">{formatCurrency(pipelineValue)}</span>
                  </div>
                  <div className="p-3 rounded-lg glass-card border border-green-400/20">
                      <span className="text-xs font-semibold text-slate-400 block">Conversion Rate</span>
                      <span className="text-lg font-bold text-green-400">{leadsAnalytics.conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
                <Button onClick={handleAddLead} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/20">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Lead
                </Button>
            </div>
        </div>

        {/* Enhanced Analytics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <Card className="glass-card glow-effect">
            <CardHeader><CardTitle className="text-white text-sm">Lead Source Distribution</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={leadsAnalytics.leadsBySource} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {leadsAnalytics.leadsBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#00CFE8', '#8b5cf6', '#10b981', '#f59e0b'][index % 4]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="glass-card glow-effect">
            <CardHeader><CardTitle className="text-white text-sm">Monthly Lead Trend</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={leadsAnalytics.monthlyTrend}>
                  <defs>
                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00CFE8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#00CFE8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
                  <Area type="monotone" dataKey="leads" stroke="#00CFE8" fillOpacity={1} fill="url(#colorLeads)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="glass-card glow-effect">
            <CardHeader><CardTitle className="text-white text-sm">Pipeline Metrics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Avg Deal Size</span>
                  <span className="text-white font-semibold">{formatCurrency(leadsAnalytics.avgDealSize)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Total Revenue</span>
                  <span className="text-green-400 font-semibold">{formatCurrency(leadsAnalytics.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Active Leads</span>
                  <span className="text-cyan-400 font-semibold">{filteredLeads.filter(l => !['Closed Won', 'Closed Lost'].includes(l.stage)).length}</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Win Rate</span>
                  <span className="text-purple-400 font-semibold">{leadsAnalytics.conversionRate.toFixed(1)}%</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and View Toggles */}
        <Card className="glass-card">
            <CardContent className="p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-[200px]">
                    <div className="relative flex-grow">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <Input placeholder="Search leads or contacts..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10 bg-slate-900/80 border-slate-700" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <Select value={filters.stage} onValueChange={value => setFilters(f => ({...f, stage: value}))}>
                            <SelectTrigger className="w-[150px] bg-slate-900/80 border-slate-700"><SelectValue placeholder="All Stages" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Stages</SelectItem>
                                {STAGES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={filters.priority} onValueChange={value => setFilters(f => ({...f, priority: value}))}>
                            <SelectTrigger className="w-[150px] bg-slate-900/80 border-slate-700"><SelectValue placeholder="All Priorities" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                {['Low', 'Medium', 'High', 'Critical'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex items-center p-1 bg-slate-900/80 rounded-lg border border-slate-700">
                    <Button size="sm" variant={viewMode === 'pipeline' ? 'secondary' : 'ghost'} onClick={() => setViewMode('pipeline')} className={viewMode === 'pipeline' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}>
                        <Kanban className="w-4 h-4 mr-2" />Pipeline
                    </Button>
                    <Button size="sm" variant={viewMode === 'list' ? 'secondary' : 'ghost'} onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}>
                        <List className="w-4 h-4 mr-2" />List
                    </Button>
                </div>
            </CardContent>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto -mx-6 px-6">
        {viewMode === 'pipeline' ? (
          <PipelineBoard
            leads={filteredLeads}
            contacts={contacts}
            onEdit={handleEditLead}
            onDelete={handleDeleteLead}
            onMoveLead={handleMoveLead}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLeads.map(lead => (
              <LeadCard key={lead.id} lead={lead} contacts={contacts} onEdit={handleEditLead} onDelete={handleDeleteLead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
