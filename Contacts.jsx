
import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Plus, Search, Mail, Phone, Building, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

import ContactForm from "../components/contacts/ContactForm";
import ContactCard from "../components/contacts/ContactCard";

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => { loadContacts() }, []);

  const loadContacts = async () => {
    try {
      const data = await Contact.list('-created_date');
      setContacts(data);
    } catch (error) { console.error('Error loading contacts:', error) } 
    finally { setIsLoading(false) }
  };

  const handleSubmit = async (contactData) => {
    try {
      if (editingContact) {
        await Contact.update(editingContact.id, contactData);
      } else {
        await Contact.create(contactData);
      }
      setShowForm(false);
      setEditingContact(null);
      loadContacts();
    } catch (error) { console.error('Error saving contact:', error) }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setShowForm(true);
  };

  const handleDelete = async (contactId) => {
    if (window.confirm('Are you sure?')) {
      try {
        await Contact.delete(contactId);
        loadContacts();
      } catch (error) { console.error('Error deleting contact:', error) }
    }
  };

  const filteredContacts = contacts.filter(contact => 
    (contact.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     contact.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     contact.company?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || contact.status === statusFilter) &&
    (industryFilter === 'all' || contact.industry === industryFilter)
  );

  const industryData = contacts.reduce((acc, contact) => {
    const industry = contact.industry || 'Other';
    const existing = acc.find(item => item.name === industry);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: industry, count: 1 });
    }
    return acc;
  }, []);

  if (showForm) {
    return (
      <div className="p-6">
        <ContactForm
          contact={editingContact}
          onSubmit={handleSubmit}
          onCancel={() => { setShowForm(false); setEditingContact(null); }}
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Contact Hub</h1>
          <p className="text-slate-400 text-lg">Your central repository for all client and prospect information.</p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg" className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold shadow-lg shadow-cyan-500/20">
          <Plus className="w-5 h-5 mr-2" /> Add Contact
        </Button>
      </div>

      {/* Analytics */}
      <Card className="glass-card glow-effect">
        <CardHeader>
            <CardTitle className="text-white">Contacts by Industry</CardTitle>
        </CardHeader>
        <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={industryData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }}
              cursor={{fill: 'rgba(0, 207, 232, 0.1)'}}
            />
            <Bar dataKey="count" fill="#00CFE8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="glass-card">
          <CardContent className="p-4 flex gap-4">
            <Input placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-900/80 border-slate-700"/>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48 bg-slate-900/80 border-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Statuses</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem><SelectItem value="Prospect">Prospect</SelectItem><SelectItem value="Client">Client</SelectItem></SelectContent>
            </Select>
            <Select value={industryFilter} onValueChange={setIndustryFilter}>
              <SelectTrigger className="w-48 bg-slate-900/80 border-slate-700"><SelectValue placeholder="Industry" /></SelectTrigger>
              <SelectContent><SelectItem value="all">All Industries</SelectItem><SelectItem value="Technology">Technology</SelectItem><SelectItem value="Finance">Finance</SelectItem><SelectItem value="Healthcare">Healthcare</SelectItem></SelectContent>
            </Select>
          </CardContent>
      </Card>
      
      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContacts.map(contact => (
          <ContactCard key={contact.id} contact={contact} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}
