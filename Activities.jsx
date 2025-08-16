
import React, { useState, useEffect } from "react";
import { Activity } from "@/api/entities";
import { Contact } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Activity as ActivityIcon, 
  Plus, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';

import ActivityForm from "../components/activities/ActivityForm";
import ActivityCard from "../components/activities/ActivityCard";

export default function Activities() {
  const [activities, setActivities] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesData, contactsData, leadsData] = await Promise.all([
        Activity.list('-created_date'),
        Contact.list(),
        Lead.list()
      ]);
      setActivities(activitiesData);
      setContacts(contactsData);
      setLeads(leadsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (activityData) => {
    try {
      if (editingActivity) {
        await Activity.update(editingActivity.id, activityData);
      } else {
        await Activity.create(activityData);
      }
      setShowForm(false);
      setEditingActivity(null);
      loadData();
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleDelete = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        await Activity.delete(activityId);
        loadData();
      } catch (error) {
        console.error('Error deleting activity:', error);
      }
    }
  };

  const filteredActivities = activities.filter(activity => {
    const matchesSearch = 
      activity.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || activity.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusCount = (status) => {
    return activities.filter(activity => activity.status === status).length;
  };

  const getTypeCount = (type) => {
    return activities.filter(activity => activity.type === type).length;
  };

  if (showForm) {
    return (
      <ActivityForm
        activity={editingActivity}
        contacts={contacts}
        leads={leads}
        onSubmit={handleSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingActivity(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Activities</h1>
          <p className="text-slate-400">Track all your business activities</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/20"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Total Activities</p><p className="text-2xl font-bold text-white">{activities.length}</p></div><ActivityIcon className="w-8 h-8 text-cyan-400" /></div></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Completed</p><p className="text-2xl font-bold text-white">{getStatusCount('Completed')}</p></div><CheckCircle className="w-8 h-8 text-green-400" /></div></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Pending</p><p className="text-2xl font-bold text-white">{getStatusCount('Pending')}</p></div><Clock className="w-8 h-8 text-yellow-400" /></div></CardContent></Card>
        <Card className="glass-card"><CardContent className="p-4"><div className="flex items-center justify-between"><div><p className="text-sm text-slate-400">Scheduled</p><p className="text-2xl font-bold text-white">{getStatusCount('Scheduled')}</p></div><Calendar className="w-8 h-8 text-purple-400" /></div></CardContent></Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-900/80 border-slate-700 text-white placeholder-slate-500"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-900/80 border-slate-700 text-white">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Note">Note</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-slate-900/80 border-slate-700 text-white">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 text-white border-slate-700">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Scheduled">Scheduled</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="w-8 h-8 bg-slate-700 rounded-full mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-full mb-2"></div>
                  <div className="h-3 bg-slate-700 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredActivities.length > 0 ? (
          filteredActivities.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              contacts={contacts}
              leads={leads}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="glass-card">
              <CardContent className="p-12 text-center">
                <ActivityIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No activities found</h3>
                <p className="text-slate-400 mb-4">
                  {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first activity'
                  }
                </p>
                <Button onClick={() => setShowForm(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Activity
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
