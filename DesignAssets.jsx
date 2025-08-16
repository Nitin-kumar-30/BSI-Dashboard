import React, { useState, useEffect } from 'react';
import { DesignAsset } from "@/api/entities";
import { DesignProject } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, Plus, Search, Image, FileText, Video, Folder, Download, Eye, Trash2, Filter, Grid, List, MoreHorizontal
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AssetUploadModal = ({ isOpen, onClose, onUpload, projects }) => {
  const [file, setFile] = useState(null);
  const [assetName, setAssetName] = useState('');
  const [assetType, setAssetType] = useState('Image');
  const [projectId, setProjectId] = useState('');
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !assetName) return;
    
    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      const assetData = {
        asset_name: assetName,
        asset_type: assetType,
        file_url,
        project_id: projectId || null,
        tags: tags.split(',').map(t => t.trim()).filter(t => t)
      };
      await onUpload(assetData);
      onClose();
      setFile(null);
      setAssetName('');
      setTags('');
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl glass-card">
        <CardHeader><CardTitle className="text-white">Upload Design Asset</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Choose File</label>
              <input type="file" onChange={(e) => setFile(e.target.files[0])} className="w-full p-3 border border-slate-600 rounded-lg bg-slate-800 text-white" required />
            </div>
            <Input placeholder="Asset Name" value={assetName} onChange={(e) => setAssetName(e.target.value)} className="bg-slate-800 border-slate-600 text-white" required />
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="Image">Image</SelectItem>
                <SelectItem value="Logo">Logo</SelectItem>
                <SelectItem value="Icon">Icon</SelectItem>
                <SelectItem value="Document">Document</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
                <SelectItem value="Font">Font</SelectItem>
              </SelectContent>
            </Select>
            <Select value={projectId} onValueChange={setProjectId}>
              <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select Project (Optional)" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.project_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="Tags (comma-separated)" value={tags} onChange={(e) => setTags(e.target.value)} className="bg-slate-800 border-slate-600 text-white" />
            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">Cancel</Button>
              <Button type="submit" disabled={isUploading} className="bg-cyan-500 hover:bg-cyan-600">
                {isUploading ? 'Uploading...' : 'Upload Asset'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AssetCard = ({ asset, project, onDelete, onView }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Image': case 'Logo': case 'Icon': return <Image className="w-6 h-6" />;
      case 'Video': return <Video className="w-6 h-6" />;
      case 'Document': return <FileText className="w-6 h-6" />;
      default: return <Folder className="w-6 h-6" />;
    }
  };

  const typeColors = {
    Image: 'bg-blue-400/10 text-blue-400 border-blue-400/30',
    Logo: 'bg-purple-400/10 text-purple-400 border-purple-400/30',
    Icon: 'bg-green-400/10 text-green-400 border-green-400/30',
    Document: 'bg-orange-400/10 text-orange-400 border-orange-400/30',
    Video: 'bg-red-400/10 text-red-400 border-red-400/30',
    Font: 'bg-cyan-400/10 text-cyan-400 border-cyan-400/30'
  };

  return (
    <Card className="glass-card glow-effect group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${typeColors[asset.asset_type] || 'bg-slate-400/10 text-slate-400'}`}>
              {getTypeIcon(asset.asset_type)}
            </div>
            <div>
              <h3 className="font-semibold text-white truncate">{asset.asset_name}</h3>
              <p className="text-sm text-slate-400">{project?.project_name || 'No Project'}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
              <DropdownMenuItem onClick={() => onView(asset)} className="text-slate-200">
                <Eye className="w-4 h-4 mr-2" />View
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href={asset.file_url} download className="text-slate-200 flex items-center">
                  <Download className="w-4 h-4 mr-2" />Download
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(asset.id)} className="text-red-400">
                <Trash2 className="w-4 h-4 mr-2" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <Badge className={typeColors[asset.asset_type] || 'bg-slate-400/10 text-slate-400 border-slate-400/30'}>
          {asset.asset_type}
        </Badge>
        
        {asset.tags && asset.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {asset.tags.slice(0, 3).map((tag, i) => (
              <span key={i} className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="mt-3 text-xs text-slate-500">
          Created: {new Date(asset.created_date).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
};

export default function DesignAssets() {
  const [assets, setAssets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [assetsData, projectsData] = await Promise.all([
        DesignAsset.list('-created_date'),
        DesignProject.list()
      ]);
      
      // Generate sample data if empty
      if (assetsData.length === 0) {
        const sampleAssets = [
          { id: '1', asset_name: 'Brand Logo V2', asset_type: 'Logo', file_url: 'https://via.placeholder.com/400x300/00CFE8/FFFFFF?text=Logo', project_id: null, tags: ['branding', 'logo', 'corporate'], created_date: new Date().toISOString() },
          { id: '2', asset_name: 'Marketing Banner', asset_type: 'Image', file_url: 'https://via.placeholder.com/800x400/8b5cf6/FFFFFF?text=Banner', project_id: null, tags: ['marketing', 'social'], created_date: new Date().toISOString() },
          { id: '3', asset_name: 'Product Icons Set', asset_type: 'Icon', file_url: 'https://via.placeholder.com/300x300/10b981/FFFFFF?text=Icons', project_id: null, tags: ['icons', 'ui'], created_date: new Date().toISOString() },
          { id: '4', asset_name: 'Company Presentation', asset_type: 'Document', file_url: '#', project_id: null, tags: ['presentation', 'corporate'], created_date: new Date().toISOString() },
          { id: '5', asset_name: 'Product Demo Video', asset_type: 'Video', file_url: '#', project_id: null, tags: ['video', 'demo'], created_date: new Date().toISOString() }
        ];
        setAssets(sampleAssets);
      } else {
        setAssets(assetsData);
      }
      
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpload = async (assetData) => {
    await DesignAsset.create(assetData);
    loadData();
  };

  const handleDelete = async (assetId) => {
    if (window.confirm('Delete this asset?')) {
      await DesignAsset.delete(assetId);
      loadData();
    }
  };

  const handleView = (asset) => {
    if (asset.file_url.startsWith('http')) {
      window.open(asset.file_url, '_blank');
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.asset_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      asset.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || asset.asset_type === typeFilter;
    const matchesProject = projectFilter === 'all' || asset.project_id === projectFilter;
    return matchesSearch && matchesType && matchesProject;
  });

  const assetStats = {
    totalAssets: assets.length,
    byType: assets.reduce((acc, asset) => {
      acc[asset.asset_type] = (acc[asset.asset_type] || 0) + 1;
      return acc;
    }, {}),
    recentUploads: assets.filter(a => new Date(a.created_date) > new Date(Date.now() - 7*24*60*60*1000)).length
  };

  const chartData = Object.entries(assetStats.byType).map(([name, value]) => ({ name, value }));
  const COLORS = ['#00CFE8', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showUpload && (
          <AssetUploadModal isOpen={showUpload} onClose={() => setShowUpload(false)} onUpload={handleUpload} projects={projects} />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Design Assets</h1>
          <p className="text-slate-400">Manage your creative resources and files</p>
        </div>
        <Button onClick={() => setShowUpload(true)} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          Upload Asset
        </Button>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card glow-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Assets</p>
                <p className="text-2xl font-bold text-white">{assetStats.totalAssets}</p>
              </div>
              <Folder className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card glow-effect">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Recent Uploads</p>
                <p className="text-2xl font-bold text-white">{assetStats.recentUploads}</p>
              </div>
              <Upload className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card glow-effect">
          <CardHeader><CardTitle className="text-white text-sm">Asset Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} stroke="none">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                <Input placeholder="Search assets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 bg-slate-800 border-slate-700 text-white" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-48 bg-slate-800 border-slate-700 text-white">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Image">Images</SelectItem>
                  <SelectItem value="Logo">Logos</SelectItem>
                  <SelectItem value="Icon">Icons</SelectItem>
                  <SelectItem value="Document">Documents</SelectItem>
                  <SelectItem value="Video">Videos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant={viewMode === 'grid' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'bg-cyan-500' : 'border-slate-600 text-slate-400'}>
                <Grid className="w-4 h-4" />
              </Button>
              <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'bg-cyan-500' : 'border-slate-600 text-slate-400'}>
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
        {filteredAssets.map((asset) => {
          const project = projects.find(p => p.id === asset.project_id);
          return (
            <AssetCard key={asset.id} asset={asset} project={project} onDelete={handleDelete} onView={handleView} />
          );
        })}
      </div>

      {filteredAssets.length === 0 && (
        <Card className="glass-card">
          <CardContent className="p-12 text-center">
            <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No assets found</h3>
            <p className="text-slate-400 mb-4">Upload your first design asset to get started</p>
            <Button onClick={() => setShowUpload(true)} className="bg-cyan-500 hover:bg-cyan-600">
              <Plus className="w-4 h-4 mr-2" />
              Upload Asset
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}