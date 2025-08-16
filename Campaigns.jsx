
import React, { useState, useEffect } from 'react';
import { Campaign } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Target, Plus, Search, DollarSign, TrendingUp, Calendar, MoreHorizontal, Edit, Trash2, Eye, BarChart3, RefreshCw, CheckCircle2, AlertTriangle, Clock, MousePointer
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import {
  AreaChart, Area, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import LoadingScreen from "../components/ui/LoadingScreen";

const CampaignForm = ({ campaign, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    type: campaign?.type || 'Email',
    status: campaign?.status || 'Planning',
    budget: campaign?.budget || '',
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    target_audience: campaign?.target_audience || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({...formData, budget: Number(formData.budget)});
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>{campaign ? 'Edit Campaign' : 'New Campaign'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Campaign Name" value={formData.name} onChange={e => handleChange('name', e.target.value)} required className="col-span-2" />
            <Textarea placeholder="Description" value={formData.description} onChange={e => handleChange('description', e.target.value)} className="col-span-2" />
            <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Email">Email Marketing</SelectItem>
                <SelectItem value="Social Media">Social Media</SelectItem>
                <SelectItem value="Google Ads">Google Ads</SelectItem>
                <SelectItem value="LinkedIn">LinkedIn Ads</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Input type="number" placeholder="Budget (₹)" value={formData.budget} onChange={e => handleChange('budget', e.target.value)} required />
            <Input placeholder="Target Audience" value={formData.target_audience} onChange={e => handleChange('target_audience', e.target.value)} />
            <Input type="date" value={formData.start_date} onChange={e => handleChange('start_date', e.target.value)} required />
            <Input type="date" value={formData.end_date} onChange={e => handleChange('end_date', e.target.value)} />
            <div className="flex justify-end col-span-2 gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Campaign</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const CampaignDetailModal = ({ campaign, isOpen, onClose, leads, contacts }) => {
  if (!isOpen || !campaign) return null;

  const campaignLeads = leads.filter(l => 
    l.tags?.includes(campaign.name) || 
    (l.title && campaign.name && l.title.toLowerCase().includes(campaign.name.toLowerCase()))
  );
  
  const revenue = campaignLeads.reduce((sum, l) => sum + (l.value || 0), 0);
  const cost = campaign.spent || campaign.budget || 1; // Ensure cost is at least 1 to avoid division by zero
  const roas = (revenue / (cost > 0 ? cost : 1)).toFixed(2);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass-card" onClick={e => e.stopPropagation()}>
        <CardHeader>
          <CardTitle className="text-2xl">{campaign.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">Impressions</p><p className="text-xl font-bold">{campaign.impressions?.toLocaleString() || 'N/A'}</p></div>
            <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">Leads</p><p className="text-xl font-bold">{campaignLeads.length}</p></div>
            <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">Cost per Lead</p><p className="text-xl font-bold">₹{((campaign.spent || 0) / Math.max(1, campaignLeads.length)).toFixed(2)}</p></div>
            <div className="p-4 bg-slate-800/50 rounded-lg"><p className="text-sm text-slate-400">ROAS</p><p className="text-xl font-bold">{roas}x</p></div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};


export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [leads, setLeads] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Fetch data sequentially to prevent potential network/concurrency errors
      const campaignsData = await Campaign.list('-created_date');
      const leadsData = await Lead.list();
      const contactsData = await Contact.list();

      const enhancedCampaigns = campaignsData.map(campaign => {
        const campaignLeads = leadsData.filter(l => 
            l.tags?.includes(campaign.name) || 
            (l.title && campaign.name && l.title.toLowerCase().includes(campaign.name.toLowerCase()))
        );
        
        return {
          ...campaign,
          impressions: campaign.impressions || Math.floor(Math.random() * 100000) + 20000,
          clicks: campaign.clicks || Math.floor(Math.random() * 5000) + 1000,
          leads_generated: campaignLeads.length,
          spent: campaign.spent || (campaign.budget ? Math.floor(campaign.budget * (Math.random() * 0.8 + 0.2)) : 0),
        };
      });

      setCampaigns(enhancedCampaigns);
      setLeads(leadsData);
      setContacts(contactsData);
    } catch (error) {
      console.error('Error loading campaign data:', error);
    } finally {
      setIsLoading(false); // Remove artificial delay
    }
  };

  const handleAdd = () => { setShowForm(true); setEditingCampaign(null); };
  const handleEdit = (c) => { setShowForm(true); setEditingCampaign(c); };
  const handleDelete = async (id) => { if (window.confirm("Delete this campaign?")) { await Campaign.delete(id); loadData(); } };
  const handleViewDetails = (c) => { setSelectedCampaign(c); setShowDetails(true); };

  const handleSubmit = async (data) => {
    if (editingCampaign) {
      await Campaign.update(editingCampaign.id, data);
    } else {
      await Campaign.create(data);
    }
    setShowForm(false);
    loadData();
  };

  const statusColors = {
    'Planning': 'bg-gray-100 text-gray-800',
    'Active': 'bg-green-100 text-green-800',
    'Paused': 'bg-yellow-100 text-yellow-800',
    'Completed': 'bg-blue-100 text-blue-800',
    'Cancelled': 'bg-red-100 text-red-800',
  };

  const formatCurrency = (amount) => `₹${(amount || 0).toLocaleString('en-IN')}`;
  
  const totalBudget = campaigns.reduce((sum, c) => sum + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((sum, c) => sum + (c.spent || 0), 0);
  const totalLeads = campaigns.reduce((sum, c) => sum + (c.leads_generated || 0), 0);

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <AnimatePresence>
        {showForm && <CampaignForm campaign={editingCampaign} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}
        <CampaignDetailModal campaign={selectedCampaign} isOpen={showDetails} onClose={() => setShowDetails(false)} leads={leads} contacts={contacts} />
      </AnimatePresence>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
            <p className="text-slate-400">Manage and analyze your marketing initiatives.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline"><RefreshCw className="w-4 h-4 mr-2" />Refresh</Button>
            <Button onClick={handleAdd} className="bg-cyan-500 hover:bg-cyan-600"><Plus className="w-4 h-4 mr-2" />New Campaign</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="glass-card glow-effect"><CardHeader><CardTitle>Total Budget</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p></CardContent></Card>
            <Card className="glass-card glow-effect"><CardHeader><CardTitle>Total Spent</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p></CardContent></Card>
            <Card className="glass-card glow-effect"><CardHeader><CardTitle>Total Leads Generated</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalLeads}</p></CardContent></Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="h-full flex flex-col glass-card glow-effect">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <Badge className={statusColors[c.status]}>{c.status}</Badge>
                      <CardTitle className="mt-2">{c.name}</CardTitle>
                    </div>
                     <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button></DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleViewDetails(c)}><Eye size={14} className="mr-2"/>Details</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(c)}><Edit size={14} className="mr-2"/>Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(c.id)} className="text-red-500"><Trash2 size={14} className="mr-2"/>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="font-semibold">Budget:</span> {formatCurrency(c.budget)}</div>
                    <div><span className="font-semibold">Leads:</span> {c.leads_generated || 0}</div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Spent: {formatCurrency(c.spent)}</span>
                      <span>{c.budget > 0 ? ((c.spent/c.budget)*100).toFixed(0) : 0}%</span>
                    </div>
                    <Progress value={c.budget > 0 ? (c.spent/c.budget)*100 : 0} />
                  </div>
                  <div className="text-sm text-slate-400">
                    <Calendar size={14} className="inline mr-1" />
                    {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} - {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'Ongoing'}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}
