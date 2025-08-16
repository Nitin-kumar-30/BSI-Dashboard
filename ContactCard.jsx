import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Mail, Phone, Building, Edit, Trash2, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";

export default function ContactCard({ contact, onEdit, onDelete }) {
  const statusColorMap = {
    Prospect: "bg-blue-400/10 text-blue-300 border border-blue-400/30",
    Client: "bg-green-400/10 text-green-300 border border-green-400/30",
    Active: "bg-green-400/10 text-green-300 border border-green-400/30",
    Inactive: "bg-slate-400/10 text-slate-300 border border-slate-400/30",
  };

  return (
    <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="glass-card glow-effect h-full flex flex-col">
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center border border-cyan-400/30">
              <span className="text-xl font-bold text-white">
                {contact.first_name?.charAt(0)}{contact.last_name?.charAt(0)}
              </span>
            </div>
            <div>
              <CardTitle className="text-lg text-white">{contact.first_name} {contact.last_name}</CardTitle>
              <p className="text-sm text-slate-400">{contact.position}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:bg-white/10 hover:text-white">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(contact)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(contact.id)} className="text-red-500 hover:!text-red-500">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent className="space-y-3 text-sm flex-grow">
          <div className="flex items-center gap-2 text-slate-400">
            <Mail className="w-4 h-4 text-cyan-400" />
            <a href={`mailto:${contact.email}`} className="truncate hover:underline">{contact.email}</a>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Phone className="w-4 h-4 text-cyan-400" />
            <span>{contact.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <Building className="w-4 h-4 text-cyan-400" />
            <span>{contact.company}</span>
          </div>
          <div className="pt-2">
            <Badge className={statusColorMap[contact.status] || statusColorMap.Inactive}>{contact.status}</Badge>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}