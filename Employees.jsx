
import React, { useState, useEffect } from 'react';
import { Employee } from "@/api/entities";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter,
  Star,
  Mail,
  Phone,
  Building,
  Calendar,
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

// A simplified form component for adding/editing employees
const EmployeeForm = ({ employee, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    employee_id: employee?.employee_id || `EMP-${Date.now().toString().slice(-4)}`,
    first_name: employee?.first_name || '',
    last_name: employee?.last_name || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    department: employee?.department || 'Business East',
    position: employee?.position || '',
    status: employee?.status || 'Active',
    hire_date: employee?.hire_date || new Date().toISOString().split('T')[0],
    performance_rating: employee?.performance_rating || 3,
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl glass-card border-cyan-400/20">
        <CardHeader>
          <CardTitle className="text-white">{employee ? 'Edit Employee' : 'Add New Employee'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="First Name" value={formData.first_name} onChange={(e) => handleChange('first_name', e.target.value)} required className="bg-slate-900/80 border-slate-700"/>
            <Input placeholder="Last Name" value={formData.last_name} onChange={(e) => handleChange('last_name', e.target.value)} required className="bg-slate-900/80 border-slate-700"/>
            <Input type="email" placeholder="Email" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required className="bg-slate-900/80 border-slate-700"/>
            <Input type="tel" placeholder="Phone" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="bg-slate-900/80 border-slate-700"/>
            <Input placeholder="Position" value={formData.position} onChange={(e) => handleChange('position', e.target.value)} required className="bg-slate-900/80 border-slate-700"/>
            <Input type="date" placeholder="Hire Date" value={formData.hire_date} onChange={(e) => handleChange('hire_date', e.target.value)} className="bg-slate-900/80 border-slate-700"/>
            <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
              <SelectTrigger className="bg-slate-900/80 border-slate-700"><SelectValue placeholder="Department" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HR">HR</SelectItem>
                <SelectItem value="Procurement">Procurement</SelectItem>
                <SelectItem value="Business East">Business East</SelectItem>
                <SelectItem value="Business West">Business West</SelectItem>
                <SelectItem value="Business North">Business North</SelectItem>
                <SelectItem value="Business South">Business South</SelectItem>
                <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                <SelectItem value="Designing">Designing</SelectItem>
                <SelectItem value="Finance">Finance</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={formData.status} onValueChange={(value) => handleChange('status', value)}>
              <SelectTrigger className="bg-slate-900/80 border-slate-700"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="On Leave">On Leave</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex justify-end col-span-2 gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit" className="bg-cyan-500 hover:bg-cyan-600">Save</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const userData = await User.me();
      setCurrentUser(userData);
      
      // Remove access restrictions - everyone can access employee data
      const employeesData = await Employee.list('-created_date');
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
      // Fallback for when Employee entity is not yet populated
      const usersAsEmployees = await User.list();
      setEmployees(usersAsEmployees.map(u => ({...u, first_name: u.full_name?.split(' ')[0] || '', last_name: u.full_name?.split(' ')[1] || ''})));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingEmployee(null);
    setShowForm(true);
  };

  const handleEdit = (employee) => {
    setEditingEmployee(employee);
    setShowForm(true);
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        await Employee.delete(employeeId);
        loadData();
      } catch (error) {
        console.error("Failed to delete employee:", error);
        alert("Could not delete employee. They may be linked to other records.");
      }
    }
  };

  const handleSubmit = async (employeeData) => {
    try {
      if (editingEmployee) {
        await Employee.update(editingEmployee.id, employeeData);
      } else {
        await Employee.create(employeeData);
      }
      setShowForm(false);
      setEditingEmployee(null);
      loadData();
    } catch (error) {
      console.error("Failed to save employee:", error);
      alert("Failed to save employee. Please check the console for details.");
    }
  };

  if (isLoading) {
    return <div className="text-center p-8 text-white">Loading...</div>;
  }

  const filteredEmployees = employees.filter(emp => {
    const fullName = emp.full_name || `${emp.first_name || ''} ${emp.last_name || ''}`;
    const matchesSearch = 
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || emp.department === departmentFilter;
    const matchesStatus = statusFilter === 'all' || (emp.status || 'Active') === statusFilter;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <>
      <AnimatePresence>
        {showForm && (
          <EmployeeForm 
            employee={editingEmployee}
            onSubmit={handleSubmit}
            onCancel={() => setShowForm(false)}
          />
        )}
      </AnimatePresence>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-white">Employee Management</h1>
            <p className="text-slate-400">Manage your team and workforce ({employees.length} employees)</p>
          </div>
          <Button onClick={handleAdd} className="bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transform hover:scale-105 transition-all shadow-lg shadow-cyan-500/20">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" />
                  <Input
                    placeholder="Search employees by name, email, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-900/80 border-slate-700"
                  />
                </div>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-900/80 border-slate-700">
                    <SelectValue placeholder="Filter by department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {[...new Set(employees.map(e => e.department))].map(dep => dep && <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-slate-900/80 border-slate-700">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Terminated">Terminated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Employees Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              opacity: 1,
              transition: {
                when: "beforeChildren",
                staggerChildren: 0.1,
              },
            },
            hidden: { opacity: 0 },
          }}
        >
          {filteredEmployees.map((employee) => {
            const itemVariants = {
              visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } },
              hidden: { opacity: 0, y: 20 },
            };
            return (
            <motion.div key={employee.id} variants={itemVariants}>
            <Card className="glass-card glow-effect h-full flex flex-col">
              <CardContent className="p-6 flex flex-col flex-grow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border border-cyan-400/30">
                      <span className="text-white font-semibold text-lg">
                        {(employee.first_name?.charAt(0) || '') + (employee.last_name?.charAt(0) || '')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">
                        {employee.first_name} {employee.last_name}
                      </h3>
                      <p className="text-sm text-slate-400">{employee.position}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-white/10">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(employee)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(employee.id)}
                        className="text-red-500 hover:!text-red-500"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-3 flex-grow text-sm">
                  <Badge variant="secondary" className={
                    employee.status === 'Active' ? 'bg-green-400/10 text-green-300 border border-green-400/30' :
                    'bg-slate-400/10 text-slate-300 border border-slate-400/30'
                  }>{employee.status || 'Active'}</Badge>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Building className="w-4 h-4" />
                    <span>{employee.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${employee.email}`} className="truncate hover:underline hover:text-cyan-400">{employee.email}</a>
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${employee.phone}`} className="hover:underline hover:text-cyan-400">{employee.phone}</a>
                    </div>
                  )}
                  {employee.hire_date && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      <span>Hired: {new Date(employee.hire_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  {employee.performance_rating && (
                     <div className="flex items-center gap-2 text-slate-400">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span>Performance: {employee.performance_rating} / 5</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            </motion.div>
          )})}
        </motion.div>
      </div>
    </>
  );
}
