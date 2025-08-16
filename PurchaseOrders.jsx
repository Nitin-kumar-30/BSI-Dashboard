import React, { useState, useEffect, useMemo } from 'react';
import { PurchaseOrder } from "@/api/entities";
import { Vendor } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, Plus, Search, DollarSign, Edit, Trash2, MoreHorizontal, CheckCircle, Clock, Truck, BarChart2, PieChart
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

const POForm = ({ po, vendors, onSubmit, onCancel }) => {
  // ... (existing form component code, no changes needed)
};

export default function PurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingPO, setEditingPO] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [poData, vendorData] = await Promise.all([
        PurchaseOrder.list('-created_date'),
        Vendor.list()
      ]);
      setPurchaseOrders(poData);
      setVendors(vendorData);
    } catch (error) {
      console.error("Error loading procurement data:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAdd = () => { setEditingPO(null); setShowForm(true); };
  const handleEdit = (po) => { setEditingPO(po); setShowForm(true); };
  const handleDelete = async (poId) => { if (window.confirm("Are you sure?")) { await PurchaseOrder.delete(poId); loadData(); }};
  const handleSubmit = async (poData) => { if (editingPO) { await PurchaseOrder.update(editingPO.id, poData); } else { await PurchaseOrder.create(poData); } setShowForm(false); loadData(); };

  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const filteredPOs = useMemo(() => purchaseOrders.filter(po => {
    const matchesSearch = po.po_number.toLowerCase().includes(searchTerm.toLowerCase()) || po.vendor_name.toLowerCase().includes(searchTerm.toLowerCase()) || po.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter;
    return matchesSearch && matchesStatus;
  }), [purchaseOrders, searchTerm, statusFilter]);

  const { totalSpent, pendingApproval, approvedPOs, avgPOAmount } = useMemo(() => {
    const approved = purchaseOrders.filter(p => ['Approved', 'Ordered', 'Received'].includes(p.status));
    return {
      totalSpent: purchaseOrders.filter(p => p.status === 'Received').reduce((sum, p) => sum + p.amount, 0),
      pendingApproval: purchaseOrders.filter(p => p.status === 'Pending Approval').length,
      approvedPOs: approved.length,
      avgPOAmount: approved.length > 0 ? approved.reduce((sum, p) => sum + p.amount, 0) / approved.length : 0,
    };
  }, [purchaseOrders]);

  const spendingByCategory = useMemo(() => {
    const byCategory = purchaseOrders.reduce((acc, po) => {
      acc[po.category] = (acc[po.category] || 0) + po.amount;
      return acc;
    }, {});
    return Object.entries(byCategory).map(([name, amount]) => ({ name, amount }));
  }, [purchaseOrders]);

  const posByStatus = useMemo(() => {
    const byStatus = purchaseOrders.reduce((acc, po) => {
      acc[po.status] = (acc[po.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(byStatus).map(([name, value]) => ({ name, value }));
  }, [purchaseOrders]);

  const statusColors = { 'Draft': '#A0AEC0', 'Pending Approval': '#F6E05E', 'Approved': '#63B3ED', 'Ordered': '#B794F4', 'Received': '#68D391', 'Cancelled': '#F56565' };

  return (
    <>
    <AnimatePresence>
      {showForm && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl bg-white rounded-xl shadow-2xl">
            <CardHeader><CardTitle>{editingPO ? 'Edit' : 'Create'} Purchase Order</CardTitle></CardHeader>
            <CardContent>
              <POForm po={editingPO} vendors={vendors} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Procurement Hub</h1>
          <p className="text-slate-500">Manage all company purchase orders and analyze spending.</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700 shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> New PO
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Total Received Spend</CardTitle><DollarSign className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div></CardContent></Card>
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Approved POs</CardTitle><CheckCircle className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{approvedPOs}</div></CardContent></Card>
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Average PO Value</CardTitle><DollarSign className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(avgPOAmount)}</div></CardContent></Card>
        <Card className="hover:shadow-lg transition-shadow"><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">Pending Approval</CardTitle><Clock className="w-4 h-4 text-slate-500" /></CardHeader><CardContent><div className="text-2xl font-bold">{pendingApproval}</div></CardContent></Card>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart2 className="w-5 h-5 text-blue-500" />Spending by Category</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={spendingByCategory} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(val) => formatCurrency(val)} />
                  <Tooltip formatter={(val) => formatCurrency(val)} />
                  <Bar dataKey="amount" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
           <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="w-5 h-5 text-blue-500" />POs by Status</CardTitle></CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie data={posByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                     {posByStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={statusColors[entry.name]} />)}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
        <Card>
          <CardContent className="p-4 flex gap-4">
            <div className="relative flex-1"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><Input placeholder="Search PO number, vendor, or description..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" /></div>
            <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All Statuses</SelectItem>{Object.keys(statusColors).map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select>
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-4">
        {filteredPOs.map((po, index) => (
          <motion.div key={po.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.05 }}>
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4 grid grid-cols-12 items-center gap-4">
                <div className="col-span-5 flex items-center gap-4">
                  <div className="p-3 rounded-full" style={{ backgroundColor: `${statusColors[po.status]}33`}}><ShoppingCart className="w-5 h-5" style={{ color: statusColors[po.status]}} /></div>
                  <div><p className="font-semibold">{po.po_number} - <span className="font-normal">{po.vendor_name}</span></p><p className="text-sm text-slate-500">{po.description}</p></div>
                </div>
                <div className="col-span-2"><Badge variant="secondary" className="font-mono">{po.category}</Badge></div>
                <div className="col-span-2 text-right"><p className="font-semibold text-lg">{formatCurrency(po.amount)}</p>{po.delivery_date && <p className="text-sm text-slate-500">Due: {new Date(po.delivery_date).toLocaleDateString()}</p>}</div>
                <div className="col-span-2 text-center"><Badge variant="outline" style={{ borderColor: statusColors[po.status], color: statusColors[po.status] }}>{po.status}</Badge></div>
                <div className="col-span-1 text-right">
                   <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleEdit(po)}><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem><DropdownMenuItem onClick={() => handleDelete(po.id)} className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
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