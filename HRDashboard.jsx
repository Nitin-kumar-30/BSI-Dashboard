
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Employee } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  UserPlus, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Clock,
  Award,
  Building,
  Star,
  Target,
  Activity,
  BookOpen,
  HeartHandshake,
  Briefcase,
  GraduationCap
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { motion } from "framer-motion";
import { createPageUrl } from "@/utils";
import { Link } from "react-router-dom";

import LoadingScreen from "../components/ui/LoadingScreen";

export default function HRDashboard() {
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setCurrentUser(userData);
      
      // Remove access restrictions - load all employee data for everyone
      try {
        const employeesData = await Employee.list();
        setEmployees(employeesData);
      } catch {
        const usersData = await User.list();
        setEmployees(usersData);
      }
    } catch (error) {
      console.error('Error loading HR data:', error);
    } finally {
      setTimeout(() => setIsLoading(false), 2000);
    }
  };
  
  const departmentData = employees.reduce((acc, emp) => {
    if (emp.department) {
      acc[emp.department] = (acc[emp.department] || 0) + 1;
    }
    return acc;
  }, {});
  
  const chartData = Object.entries(departmentData).map(([name, value]) => ({ name, value })).filter(item => item.value > 0);

  const performanceTrends = [
    { month: 'Jan', performance: 4.1, satisfaction: 85, retention: 94, productivity: 78 },
    { month: 'Feb', performance: 4.2, satisfaction: 87, retention: 93, productivity: 82 },
    { month: 'Mar', performance: 4.0, satisfaction: 83, retention: 95, productivity: 79 },
    { month: 'Apr', performance: 4.3, satisfaction: 89, retention: 96, productivity: 85 },
    { month: 'May', performance: 4.2, satisfaction: 88, retention: 94, productivity: 87 },
    { month: 'Jun', performance: 4.4, satisfaction: 91, retention: 97, productivity: 89 }
  ];

  const skillsAnalysis = [
    { skill: 'Leadership', current: 78, target: 85 },
    { skill: 'Communication', current: 85, target: 90 },
    { skill: 'Technical', current: 72, target: 80 },
    { skill: 'Problem Solving', current: 81, target: 85 },
    { skill: 'Teamwork', current: 88, target: 90 },
    { skill: 'Innovation', current: 69, target: 75 }
  ];
  
  const COLORS = ['#00CFE8', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];
  
  const containerVariants = {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
      hidden: { y: 20, opacity: 0 },
      visible: { y: 0, opacity: 1 }
  };

  return (
    <>
      <LoadingScreen isLoading={isLoading} />
      <motion.div
        className="space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">HR Dashboard</h1>
            <p className="text-slate-400">Comprehensive human resources insights</p>
          </div>
          <Link to={createPageUrl("Employees")}>
            <Button className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold">
              <UserPlus className="w-4 h-4 mr-2" />
              Manage Employees
            </Button>
          </Link>
        </motion.div>
        
        {/* Key Metrics */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-card glow-effect"><CardHeader><CardTitle className="text-sm font-medium text-slate-400">Total Employees</CardTitle><Users className="w-4 h-4 text-slate-400"/></CardHeader><CardContent><p className="text-2xl font-bold text-white">{employees.length}</p><p className="text-xs text-green-400">+8% vs last month</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardHeader><CardTitle className="text-sm font-medium text-slate-400">Avg Performance</CardTitle><Star className="w-4 h-4 text-slate-400"/></CardHeader><CardContent><p className="text-2xl font-bold text-white">4.3/5</p><p className="text-xs text-green-400">+0.2 vs last quarter</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardHeader><CardTitle className="text-sm font-medium text-slate-400">Satisfaction</CardTitle><HeartHandshake className="w-4 h-4 text-slate-400"/></CardHeader><CardContent><p className="text-2xl font-bold text-white">91%</p><p className="text-xs text-green-400">+3% in annual survey</p></CardContent></Card>
          <Card className="glass-card glow-effect"><CardHeader><CardTitle className="text-sm font-medium text-slate-400">Retention Rate</CardTitle><Target className="w-4 h-4 text-slate-400"/></CardHeader><CardContent><p className="text-2xl font-bold text-white">97%</p><p className="text-xs text-slate-400">Industry leading</p></CardContent></Card>
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white">Department Distribution</CardTitle></CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={chartData} cx="50%" cy="50%" outerRadius={100} dataKey="value" labelLine={false} label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fill="#CDD6F4" stroke="none">
                      {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }}/>
                  </PieChart>
                </ResponsiveContainer>
                ) : <div className="text-center py-10 text-slate-400">No department data</div>}
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={itemVariants}>
            <Card className="glass-card glow-effect h-full">
              <CardHeader><CardTitle className="text-white">Skills Assessment</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={skillsAnalysis}>
                    <PolarGrid stroke="rgba(255, 255, 255, 0.2)" />
                    <PolarAngleAxis dataKey="skill" fontSize={12} stroke="#CDD6F4"/>
                    <PolarRadiusAxis angle={90} domain={[0, 100]} fontSize={10} stroke="rgba(255, 255, 255, 0.2)"/>
                    <Radar name="Current" dataKey="current" stroke="#00CFE8" fill="#00CFE8" fillOpacity={0.6} />
                    <Radar name="Target" dataKey="target" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(13, 17, 23, 0.8)', border: '1px solid rgba(255, 255, 255, 0.2)', color: '#CDD6F4' }}/>
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

      </motion.div>
    </>
  );
}
