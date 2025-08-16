
import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { LogOut, X, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UserProfile({ isOpen, onClose, onUpdate }) {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    bio: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadUser();
    }
  }, [isOpen]);

  const loadUser = async () => {
    try {
      const userData = await User.me();
      setUser(userData);
      setFormData({
        full_name: userData.full_name || '',
        phone: userData.phone || '',
        bio: userData.bio || '',
      });
    } catch (error) {
      console.log("Error loading user data");
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSave = async () => {
    try {
      await User.updateMyUserData(formData);
      onUpdate(); // To reload user in layout
      onClose();
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile.");
    }
  };

  const handleLogout = async () => {
    await User.logout();
    window.location.reload();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 z-50 flex justify-end"
          onClick={onClose}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-md h-full shadow-lg flex flex-col glass-card border-l border-cyan-400/20"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">My Profile</h2>
              <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              {user ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border-2 border-cyan-400/50">
                      <span className="text-white font-bold text-3xl">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">{user.full_name}</h3>
                      <p className="text-slate-400">{user.email}</p>
                      <p className="text-sm text-slate-500 capitalize">{user.role} - {user.department}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="full_name" className="text-slate-400">Full Name</Label>
                      <Input id="full_name" value={formData.full_name} onChange={handleChange} className="bg-slate-900/80 border-slate-700"/>
                    </div>
                    <div>
                      <Label htmlFor="phone" className="text-slate-400">Phone</Label>
                      <Input id="phone" type="tel" value={formData.phone} onChange={handleChange} className="bg-slate-900/80 border-slate-700"/>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-slate-400">Bio</Label>
                      <Textarea id="bio" value={formData.bio} onChange={handleChange} placeholder="Tell us a little about yourself..." className="bg-slate-900/80 border-slate-700"/>
                    </div>
                  </div>
                  
                  <Button onClick={handleSave} className="w-full bg-cyan-500 hover:bg-cyan-600 text-white">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <p className="text-slate-400">Loading profile...</p>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-700 mt-auto">
              <Button variant="outline" onClick={handleLogout} className="w-full">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
