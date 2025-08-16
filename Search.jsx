import React, { useState, useEffect } from "react";
import { Contact } from "@/api/entities";
import { Lead } from "@/api/entities";
import { Activity } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, Target, Activity as ActivityIcon, Building, Mail, Phone } from "lucide-react";
import { motion } from "framer-motion";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [contacts, setContacts] = useState([]);
  const [leads, setLeads] = useState([]);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('q');
    if (searchParam) {
      setQuery(searchParam);
      performSearch(searchParam);
    }
  }, []);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) return;
    
    setIsLoading(true);
    try {
      const [contactsData, leadsData, activitiesData] = await Promise.all([
        Contact.list(),
        Lead.list(),
        Activity.list()
      ]);

      // Filter results based on search query
      const filteredContacts = contactsData.filter(contact =>
        contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredLeads = leadsData.filter(lead =>
        lead.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const filteredActivities = activitiesData.filter(activity =>
        activity.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        activity.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );

      setContacts(filteredContacts);
      setLeads(filteredLeads);
      setActivities(filteredActivities);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
  };

  const totalResults = contacts.length + leads.length + activities.length;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Search Results</h1>
        
        <form onSubmit={handleSearch} className="mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search contacts, leads, activities..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-12 text-lg py-3"
            />
          </div>
        </form>

        {query && (
          <p className="text-slate-600 mb-6">
            {isLoading ? 'Searching...' : `Found ${totalResults} results for "${query}"`}
          </p>
        )}
      </motion.div>

      {!isLoading && query && (
        <div className="space-y-8">
          {/* Contacts Results */}
          {contacts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Contacts ({contacts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-slate-900">
                              {contact.first_name} {contact.last_name}
                            </h3>
                            <p className="text-sm text-slate-500 flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {contact.company}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{contact.status}</Badge>
                          <Mail className="w-4 h-4 text-slate-400" />
                          <Phone className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Leads Results */}
          {leads.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Leads ({leads.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {leads.map((lead) => (
                      <div key={lead.id} className="p-4 bg-white/50 rounded-lg border border-slate-200">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900">{lead.title}</h3>
                            <p className="text-sm text-slate-600 mt-1">{lead.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{lead.stage}</Badge>
                            <p className="text-sm font-semibold text-slate-900 mt-1">
                              ${lead.value?.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Activities Results */}
          {activities.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ActivityIcon className="w-5 h-5 text-green-500" />
                    Activities ({activities.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-slate-200">
                        <div>
                          <h3 className="font-semibold text-slate-900">{activity.title}</h3>
                          <p className="text-sm text-slate-600">{activity.description}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{activity.type}</Badge>
                          <p className="text-xs text-slate-500 mt-1">{activity.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {totalResults === 0 && query && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="glass-card">
                <CardContent className="p-12 text-center">
                  <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No results found</h3>
                  <p className="text-slate-500">Try adjusting your search terms or search for something else.</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}