import React, { useState, useEffect, useMemo } from 'react';
import { Vendor } from "@/api/entities";
import { PurchaseOrder } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Building, 
  Plus, 
  Search, 
  Star,
  DollarSign,
  Users,
  MoreVertical,
  Mail,
  Phone,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import VendorForm from "../components/vendors/VendorForm";
import VendorDetail from "../components/vendors/VendorDetail";

const VendorCard = ({ vendor, onSelect, onEdit, onDelete }) => {
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    "Under Review": "bg-yellow-100 text-yellow-800",
    Blacklisted: "bg-red-100 text-red-800",
  };

  return (
    <Card className="hover:shadow-xl transition-shadow duration-300 group">
      <CardContent className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-100 rounded-lg"><Building className="w-6 h-6 text-blue-600" /></div>
            <div>
              <h3 className="font-bold text-lg text-slate-800">{vendor.vendor_name}</h3>
              <p className="text-sm text-slate-500">{vendor.category}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onSelect(vendor)}><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(vendor)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => onDelete(vendor.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="my-4 space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-slate-400" />
            <span className="text-slate-600">{vendor.contact_person}</span>
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < vendor.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />)}
          </div>
          <Badge className={statusColors[vendor.status]}>{vendor.status}</Badge>
        </div>

        <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg">
           <div>
             <p className="text-xs text-slate-500">Total Spend</p>
             <p className="font-bold text-slate-800">{formatCurrency(vendor.totalSpend)}</p>
           </div>
           <div>
             <p className="text-xs text-slate-500 text-right">Orders</p>
             <p className="font-bold text-slate-800 text-right">{vendor.orderCount}</p>
           </div>
        </div>

        <div className="mt-4 flex gap-2">
            <Button size="sm" variant="outline" className="w-full flex items-center gap-2" asChild>
              <a href={`mailto:${vendor.email}`}><Mail className="w-4 h-4" /> Email</a>
            </Button>
            <Button size="sm" variant="outline" className="w-full flex items-center gap-2" asChild>
              <a href={`tel:${vendor.phone}`}><Phone className="w-4 h-4" /> Call</a>
            </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [vendorData, poData] = await Promise.all([
        Vendor.list('-created_date'),
        PurchaseOrder.list()
      ]);
      setVendors(vendorData);
      setPurchaseOrders(poData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => { setEditingVendor(null); setShowForm(true); };
  const handleEdit = (vendor) => { setSelectedVendor(null); setEditingVendor(vendor); setShowForm(true); };
  const handleDelete = async (vendorId) => { if (window.confirm("Are you sure? This action cannot be undone.")) { await Vendor.delete(vendorId); loadData(); }};
  const handleSubmit = async (vendorData) => { if (editingVendor) { await Vendor.update(editingVendor.id, vendorData); } else { await Vendor.create(vendorData); } setShowForm(false); setEditingVendor(null); loadData(); };
  
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const vendorStats = useMemo(() => {
    return vendors.map(vendor => {
      const relatedPOs = purchaseOrders.filter(po => po.vendor_name === vendor.vendor_name);
      const totalSpend = relatedPOs.reduce((sum, po) => sum + po.amount, 0);
      const orderCount = relatedPOs.length;
      return { ...vendor, totalSpend, orderCount };
    });
  }, [vendors, purchaseOrders]);

  const filteredVendors = vendorStats.filter(v => 
    v.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (v.contact_person && v.contact_person.toLowerCase().includes(searchTerm.toLowerCase())) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const totalVendors = vendors.length;
  const totalSpendAllVendors = purchaseOrders.reduce((sum, po) => sum + po.amount, 0);
  const topVendor = [...vendorStats].sort((a,b) => b.totalSpend - a.totalSpend)[0];

  return (
    <div className="space-y-6">
      <AnimatePresence>
        {showForm && <VendorForm vendor={editingVendor} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}
        {selectedVendor && <VendorDetail vendor={selectedVendor} stats={{ totalSpend: selectedVendor.totalSpend, orderCount: selectedVendor.orderCount }} onEdit={handleEdit} onDelete={handleDelete} onClose={() => setSelectedVendor(null)} />}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div><h1 className="text-3xl font-bold text-slate-800">Vendor Management</h1><p className="text-slate-500">Manage and track all supplier information and performance.</p></div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 shadow-lg"><Plus className="w-4 h-4 mr-2" />Add Vendor</Button>
      </motion.div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Vendors</CardTitle><Building className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{totalVendors}</div></CardContent></Card>
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Spend</CardTitle><DollarSign className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalSpendAllVendors)}</div></CardContent></Card>
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Top Vendor</CardTitle><Star className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{topVendor?.vendor_name || 'N/A'}</div></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardContent className="p-4"><div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search vendors by name, contact, or category..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div></CardContent>
        </Card>
      </motion.div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor, index) => (
          <motion.div key={vendor.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <VendorCard vendor={vendor} onSelect={setSelectedVendor} onEdit={handleEdit} onDelete={handleDelete} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}