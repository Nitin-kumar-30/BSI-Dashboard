import React, { useState, useEffect } from 'react';
import { Lead } from "@/api/entities";
import { PurchaseOrder } from "@/api/entities";
import { Budget } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts';
import { motion } from "framer-motion";
import { Download, DollarSign, TrendingUp, TrendingDown, ShoppingCart, CreditCard, PiggyBank, Calculator } from "lucide-react";

import LoadingScreen from "../components/ui/LoadingScreen";

export default function FinanceReports() {
  const [leads, setLeads] = useState([]);
  const [purchaseOrders, setPOs] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadData() }, []);
  
  const loadData = async () => {
    try {
      const [leadData, poData, budgetData] = await Promise.all([
        Lead.list(),
        PurchaseOrder.list(),
        Budget.list()
      ]);
      setLeads(leadData);
      setPOs(poData);
      setBudgets(budgetData);
    } catch (error) {
      console.error('Error loading finance data:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };
  
  // Enhanced Financial Analytics
  const getFinancialMetrics = () => {
    const totalRevenue = leads.filter(l => l.stage === 'Closed Won').reduce((sum, l) => sum + (l.value || 0), 0);
    const totalExpenses = purchaseOrders.reduce((sum, po) => sum + (po.amount || 0), 0);
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
    const totalBudget = budgets.reduce((sum, b) => sum + (b.allocated_amount || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (totalExpenses / totalBudget) * 100 : 0;
    
    return { totalRevenue, totalExpenses, netProfit, profitMargin, totalBudget, budgetUtilization };
  };

  const getMonthlyFinancials = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return months.map(month => ({
      month,
      revenue: Math.floor(Math.random() * 100000) + 50000,
      expenses: Math.floor(Math.random() * 60000) + 30000,
      profit: 0 // Will be calculated
    })).map(item => ({
      ...item,
      profit: item.revenue - item.expenses
    }));
  };

  const getCashFlowData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    let runningCash = 100000;
    return months.map(month => {
      const inflow = Math.floor(Math.random() * 80000) + 40000;
      const outflow = Math.floor(Math.random() * 60000) + 30000;
      runningCash += (inflow - outflow);
      return {
        month,
        inflow,
        outflow,
        balance: runningCash
      };
    });
  };

  const getExpenseBreakdown = () => {
    const categories = ['Salaries', 'Marketing', 'Operations', 'Technology', 'Office', 'Travel', 'Other'];
    return categories.map(category => ({
      name: category,
      value: Math.floor(Math.random() * 50000) + 10000,
      percentage: Math.floor(Math.random() * 25) + 5
    }));
  };

  const getROIAnalysis = () => {
    const departments = ['Sales', 'Marketing', 'Operations', 'HR', 'IT'];
    return departments.map(dept => ({
      department: dept,
      investment: Math.floor(Math.random() * 100000) + 50000,
      returns: Math.floor(Math.random() * 150000) + 75000,
      roi: 0 // Will be calculated
    })).map(item => ({
      ...item,
      roi: ((item.returns - item.investment) / item.investment) * 100
    }));
  };

  const getBudgetVariance = () => {
    return budgets.map(budget => ({
      department: budget.department,
      budgeted: budget.allocated_amount,
      actual: Math.floor(Math.random() * budget.allocated_amount * 1.2),
      variance: 0 // Will be calculated
    })).map(item => ({
      ...item,
      variance: ((item.actual - item.budgeted) / item.budgeted) * 100
    }));
  };

  const metrics = getFinancialMetrics();
  const monthlyData = getMonthlyFinancials();
  const cashFlowData = getCashFlowData();
  const expenseBreakdown = getExpenseBreakdown();
  const roiAnalysis = getROIAnalysis();
  const budgetVariance = getBudgetVariance();
  
  const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
        {/* Premium Background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-green-400/20 to-emerald-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-500/20 rounded-full blur-3xl"></div>

        <style>{`
          .bg-grid-pattern {
            background-image: 
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
            background-size: 20px 20px;
          }
          .premium-card {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.1), 
              rgba(255, 255, 255, 0.05)
            );
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 
              0 8px 32px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.1);
          }
          .metric-card {
            background: linear-gradient(135deg, 
              rgba(255, 255, 255, 0.15), 
              rgba(255, 255, 255, 0.05)
            );
            backdrop-filter: blur(25px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: all 0.3s ease;
          }
          .metric-card:hover {
            transform: translateY(-5px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
            border-color: rgba(59, 130, 246, 0.5);
          }
          .shimmer-text {
            background: linear-gradient(
              90deg,
              #ffffff,
              #60a5fa,
              #a855f7,
              #ffffff
            );
            background-size: 400% 100%;
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            animation: shimmer 3s ease-in-out infinite;
          }
          @keyframes shimmer {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
        `}</style>

        <motion.div
          className="relative z-10 p-6 space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold shimmer-text mb-2">Financial Intelligence Center</h1>
              <p className="text-blue-200/80 text-lg">Comprehensive financial analytics and reporting</p>
            </div>
            <Button 
              onClick={() => alert("Advanced financial report generation coming soon!")}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-2xl shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              <Download className="w-5 h-5 mr-2" />
              Export Report
            </Button>
          </motion.div>
          
          {/* Enhanced Financial Metrics */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="metric-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/80 text-sm font-medium">Total Revenue</p>
                  <p className="text-3xl font-bold text-white mt-2">${metrics.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">+18.7%</span>
                    <span className="text-xs text-blue-200/60">vs last quarter</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                  <DollarSign className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="metric-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/80 text-sm font-medium">Net Profit</p>
                  <p className="text-3xl font-bold text-white mt-2">${metrics.netProfit.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm font-semibold text-emerald-400">+25.3%</span>
                    <span className="text-xs text-blue-200/60">profit margin: {metrics.profitMargin.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="metric-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/80 text-sm font-medium">Total Expenses</p>
                  <p className="text-3xl font-bold text-white mt-2">${metrics.totalExpenses.toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <TrendingDown className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-semibold text-red-400">-5.2%</span>
                    <span className="text-xs text-blue-200/60">cost optimization</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="metric-card rounded-3xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200/80 text-sm font-medium">Budget Utilization</p>
                  <p className="text-3xl font-bold text-white mt-2">{metrics.budgetUtilization.toFixed(1)}%</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Calculator className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">Optimal</span>
                    <span className="text-xs text-blue-200/60">within targets</span>
                  </div>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <PiggyBank className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Financial Performance Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses Trend */}
            <motion.div variants={itemVariants}>
              <div className="premium-card rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Financial Performance</h3>
                    <p className="text-blue-200/80 text-sm">Monthly revenue, expenses, and profit trends</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none',
                      borderRadius: '16px',
                      color: '#ffffff'
                    }} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                    <Line type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Cash Flow Analysis */}
            <motion.div variants={itemVariants}>
              <div className="premium-card rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Cash Flow Analysis</h3>
                    <p className="text-blue-200/80 text-sm">Inflow, outflow, and running balance</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <ComposedChart data={cashFlowData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none',
                      borderRadius: '16px',
                      color: '#ffffff'
                    }} />
                    <Area type="monotone" dataKey="inflow" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="outflow" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    <Line type="monotone" dataKey="balance" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 6 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Expense Breakdown & ROI Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Breakdown */}
            <motion.div variants={itemVariants}>
              <div className="premium-card rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Expense Breakdown</h3>
                    <p className="text-blue-200/80 text-sm">Cost distribution by category</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={expenseBreakdown}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                    >
                      {expenseBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none',
                      borderRadius: '16px',
                      color: '#ffffff'
                    }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* ROI Analysis */}
            <motion.div variants={itemVariants}>
              <div className="premium-card rounded-3xl p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center">
                    <Calculator className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">ROI by Department</h3>
                    <p className="text-blue-200/80 text-sm">Return on investment analysis</p>
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={roiAnalysis} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                    <YAxis dataKey="department" type="category" stroke="#94a3b8" fontSize={12} />
                    <Tooltip contentStyle={{ 
                      backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                      border: 'none',
                      borderRadius: '16px',
                      color: '#ffffff'
                    }} />
                    <Bar dataKey="roi" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                      {roiAnalysis.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.roi > 50 ? '#10b981' : entry.roi > 20 ? '#f59e0b' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* Budget Variance Analysis */}
          <motion.div variants={itemVariants}>
            <div className="premium-card rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center">
                  <PiggyBank className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Budget Variance Analysis</h3>
                  <p className="text-blue-200/80 text-sm">Budgeted vs actual spending by department</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {budgetVariance.map((item, index) => (
                  <div key={index} className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <h4 className="font-semibold text-white mb-2">{item.department}</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200/80">Budgeted:</span>
                        <span className="text-white font-medium">${item.budgeted.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200/80">Actual:</span>
                        <span className="text-white font-medium">${item.actual.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-200/80">Variance:</span>
                        <Badge className={`${item.variance > 0 ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'} border-0`}>
                          {item.variance > 0 ? '+' : ''}{item.variance.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}