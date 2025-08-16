import React, { useState, useEffect } from 'react';
import { DesignProject } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Palette, 
  Plus, 
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ProjectForm = ({ project, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    project_name: project?.project_name || '',
    client_name: project?.client_name || '',
    type: project?.type || 'Website Design',
    status: project?.status || 'Briefing',
    deadline: project?.deadline || '',
    progress: project?.progress || 0,
  });
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({...formData, progress: Number(formData.progress)});
  };
  
  return (
     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle>{project ? 'Edit Project' : 'New Design Project'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Project Name" value={formData.project_name} onChange={e => handleChange('project_name', e.target.value)} required />
            <Input placeholder="Client Name" value={formData.client_name} onChange={e => handleChange('client_name', e.target.value)} required />
             <Select value={formData.type} onValueChange={v => handleChange('type', v)}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Logo Design">Logo Design</SelectItem>
                <SelectItem value="Website Design">Website Design</SelectItem>
                <SelectItem value="Branding">Branding</SelectItem>
              </SelectContent>
            </Select>
             <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Briefing">Briefing</SelectItem>
                <SelectItem value="Concept">Concept</SelectItem>
                <SelectItem value="Design">Design</SelectItem>
                <SelectItem value="Review">Review</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" value={formData.deadline} onChange={e => handleChange('deadline', e.target.value)} />
            <div>
              <label>Progress: {formData.progress}%</label>
              <Input type="range" min="0" max="100" value={formData.progress} onChange={e => handleChange('progress', e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};


export default function DesignProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setIsLoading(true);
    const data = await DesignProject.list('-created_date');
    setProjects(data);
    setIsLoading(false);
  };
  
  const handleAdd = () => { setEditingProject(null); setShowForm(true); };
  const handleEdit = (p) => { setEditingProject(p); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this project?")) {
      await DesignProject.delete(id);
      loadData();
    }
  };
  const handleSubmit = async (data) => {
    if (editingProject) {
      await DesignProject.update(editingProject.id, data);
    } else {
      await DesignProject.create(data);
    }
    setShowForm(false);
    loadData();
  };
  
  const statusColors = {
    'Briefing': 'bg-gray-100 text-gray-800',
    'Concept': 'bg-yellow-100 text-yellow-800',
    'Design': 'bg-blue-100 text-blue-800',
    'Review': 'bg-purple-100 text-purple-800',
    'Completed': 'bg-green-100 text-green-800',
  };

  return (
    <>
    <AnimatePresence>{showForm && <ProjectForm project={editingProject} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}</AnimatePresence>
    <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Design Projects</h1>
          <p className="text-slate-600">Track and manage all creative projects</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2"/>New Project</Button>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(p => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card h-full">
              <CardContent className="p-6 flex flex-col h-full">
                 <div className="flex justify-between items-start mb-4">
                  <div className="flex-grow">
                     <Badge variant="secondary" className={statusColors[p.status]}>{p.status}</Badge>
                    <h3 className="font-bold text-lg mt-2">{p.project_name}</h3>
                    <p className="text-sm text-slate-500">{p.client_name}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(p)}><Edit size={14} className="mr-2"/>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(p.id)} className="text-red-500"><Trash2 size={14} className="mr-2"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div className="flex-grow space-y-3">
                    <p className="text-sm">Deadline: {new Date(p.deadline).toLocaleDateString()}</p>
                    <div>
                        <p className="text-xs">Progress: {p.progress}%</p>
                        <Progress value={p.progress} className="h-2 mt-1" />
                    </div>
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