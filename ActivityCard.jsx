import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { format } from 'date-fns';
import { 
  Activity, 
  Calendar, 
  Phone, 
  Mail, 
  FileText, 
  CheckCircle,
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Target,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';

const typeIcons = {
  Call: <Phone className="w-5 h-5 text-blue-400" />,
  Email: <Mail className="w-5 h-5 text-green-400" />,
  Meeting: <Users className="w-5 h-5 text-purple-400" />,
  Note: <FileText className="w-5 h-5 text-yellow-400" />,
  Task: <CheckCircle className="w-5 h-5 text-indigo-400" />,
  "Follow-up": <Activity className="w-5 h-5 text-pink-400" />,
};

const statusColors = {
  Completed: 'bg-green-400/10 text-green-300 border-green-400/30',
  Pending: 'bg-yellow-400/10 text-yellow-300 border-yellow-400/30',
  Scheduled: 'bg-blue-400/10 text-blue-300 border-blue-400/30',
  Cancelled: 'bg-red-400/10 text-red-300 border-red-400/30',
};

export default function ActivityCard({ activity, contacts, leads, onEdit, onDelete }) {
  const contact = contacts.find(c => c.id === activity.contact_id);
  const lead = leads.find(l => l.id === activity.lead_id);
  
  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
      <Card className="glass-card glow-effect h-full flex flex-col">
        <CardHeader className="flex-row items-start justify-between pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-cyan-400/20">
              {typeIcons[activity.type] || <Activity className="w-5 h-5 text-slate-400" />}
            </div>
            <CardTitle className="text-base font-semibold text-white">{activity.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-slate-400 hover:bg-white/10 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(activity)}><Edit className="mr-2 h-4 w-4" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(activity.id)} className="text-red-500 hover:!text-red-500"><Trash2 className="mr-2 h-4 w-4" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-3 text-sm flex-grow">
          {activity.description && <p className="text-slate-400">{activity.description}</p>}
          
          <div className="space-y-2 pt-2">
            {contact && (
              <div className="flex items-center gap-2 text-slate-400">
                <Users className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-slate-300">Contact:</span>
                <span>{contact.first_name} {contact.last_name}</span>
              </div>
            )}
            {lead && (
              <div className="flex items-center gap-2 text-slate-400">
                <Target className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-slate-300">Lead:</span>
                <span>{lead.title}</span>
              </div>
            )}
            {activity.scheduled_date && (
              <div className="flex items-center gap-2 text-slate-400">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-slate-300">Date:</span>
                <span>{format(new Date(activity.scheduled_date), 'MMM d, yyyy h:mm a')}</span>
              </div>
            )}
          </div>
        </CardContent>
        <div className="p-4 pt-0">
          <Badge className={statusColors[activity.status] || statusColors.Pending}>{activity.status}</Badge>
        </div>
      </Card>
    </motion.div>
  );
}