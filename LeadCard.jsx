import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { DollarSign, User, MoreVertical, Edit, Trash2, Calendar, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeadCard({ lead, contacts, onEdit, onDelete }) {
  const contact = contacts.find(c => c.id === lead.contact_id);
  
  const priorityColors = {
    Low: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
    Medium: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
    High: 'bg-orange-400/10 text-orange-300 border-orange-400/30',
    Critical: 'bg-red-400/10 text-red-300 border-red-400/30',
  };

  const formatCurrency = (amount) => {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount/1000).toFixed(0)}k`;
    return `₹${amount}`;
  };

  return (
    <motion.div whileHover={{ y: -4 }} className="h-full">
      <Card className="glass-card glow-effect h-full flex flex-col">
        <CardHeader className="flex-row items-center justify-between pb-2">
          <CardTitle className="text-base font-semibold text-white leading-tight">{lead.title}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:bg-white/10 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(lead)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(lead.id)} className="text-red-500 hover:!text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-3 text-sm flex-grow">
          {contact && (
            <div className="flex items-center gap-2 text-slate-400">
              <User className="w-4 h-4" />
              <span>{contact.first_name} {contact.last_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 font-semibold text-cyan-400">
            <DollarSign className="w-4 h-4" />
            <span>{formatCurrency(lead.value)}</span>
          </div>
          {lead.expected_close_date && (
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{new Date(lead.expected_close_date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-slate-400">
            <TrendingUp className="w-4 h-4" />
            <span>{lead.probability || 0}% Probability</span>
          </div>
          <div className="pt-1">
             <Badge className={priorityColors[lead.priority] || priorityColors.Medium}>{lead.priority}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}