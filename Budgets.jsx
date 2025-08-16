
import React, { useState, useEffect } from 'react';
import { Budget } from "@/api/entities";
import { PurchaseOrder } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
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

const BudgetForm = ({ budget, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    department: budget?.department || 'Finance',
    period: budget?.period || `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`,
    allocated_amount: budget?.allocated_amount || '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({...formData, allocated_amount: Number(formData.allocated_amount)});
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader><CardTitle>{budget ? 'Edit Budget' : 'New Budget'}</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select value={formData.department} onValueChange={v => handleChange('department', v)}>
              <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Business East">Business East</SelectItem>
                <SelectItem value="Designing">Designing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Period (e.g., Q3 2024)" value={formData.period} onChange={e => handleChange('period', e.target.value)} required />
            <Input type="number" placeholder="Allocated Amount" value={formData.allocated_amount} onChange={e => handleChange('allocated_amount', e.target.value)} required />
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

export default function Budgets() {
  const [budgets, setBudgets] = useState([]);
  const [purchaseOrders, setPOs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => { loadData() }, []);
  
  const loadData = async () => {
    setIsLoading(true);
    const [budgetData, poData] = await Promise.all([
      Budget.list('-created_date'),
      PurchaseOrder.list()
    ]);
    const budgetsWithSpent = budgetData.map(b => {
      const spent = poData
        .filter(p => p.category === b.department) // This is a simplification
        .reduce((sum, p) => sum + p.amount, 0);
      return {...b, spent_amount: spent};
    })
    setBudgets(budgetsWithSpent);
    setIsLoading(false);
  };

  // Currency formatter for Indian Rupees
  const formatCurrency = (amount) => {
    if (amount >= 10000000) { // 1 Crore
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else if (amount >= 100000) { // 1 Lakh
      return `₹${(amount / 100000).toFixed(2)} L`;
    } else if (amount >= 1000) { // 1 Thousand
      return `₹${(amount / 1000).toFixed(2)}K`;
    } else {
      return `₹${amount.toLocaleString('en-IN')}`;
    }
  };

  const handleAdd = () => { setEditingBudget(null); setShowForm(true); };
  const handleEdit = (b) => { setEditingBudget(b); setShowForm(true); };
  const handleDelete = async (id) => {
    if (window.confirm("Delete this budget?")) {
      await Budget.delete(id);
      loadData();
    }
  };
  const handleSubmit = async (data) => {
    if (editingBudget) {
      await Budget.update(editingBudget.id, data);
    } else {
      await Budget.create(data);
    }
    setShowForm(false);
    loadData();
  };

  return (
    <>
    <AnimatePresence>{showForm && <BudgetForm budget={editingBudget} onSubmit={handleSubmit} onCancel={() => setShowForm(false)} />}</AnimatePresence>
     <div className="space-y-6">
       <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Department Budgets</h1>
          <p className="text-slate-600">Track spending against allocated budgets</p>
        </div>
        <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700"><Plus className="w-4 h-4 mr-2"/>New Budget</Button>
      </motion.div>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map(b => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-slate-500">{b.period}</p>
                    <h3 className="font-bold text-lg">{b.department}</h3>
                  </div>
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild><Button variant="ghost" size="sm"><MoreHorizontal size={16}/></Button></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleEdit(b)}><Edit size={14} className="mr-2"/>Edit</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(b.id)} className="text-red-500"><Trash2 size={14} className="mr-2"/>Delete</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{formatCurrency(b.spent_amount)}</span>
                    <span>{formatCurrency(b.allocated_amount)}</span>
                  </div>
                  <Progress value={(b.spent_amount / b.allocated_amount) * 100} />
                  <p className="text-xs text-right mt-1">
                    {formatCurrency(b.allocated_amount - b.spent_amount)} remaining
                  </p>
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
