import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

export default function MetricCard({ title, value, icon: Icon, gradient, trend, isLoading }) {
  if (isLoading) {
    return (
      <div className="glass-morphism rounded-3xl p-6 premium-shadow">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <Skeleton className="h-4 w-28 bg-white/50" />
            <Skeleton className="h-10 w-20 bg-white/50" />
            <Skeleton className="h-4 w-16 bg-white/50" />
          </div>
          <Skeleton className="h-16 w-16 rounded-2xl bg-white/50" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="glass-morphism rounded-3xl p-6 premium-shadow group cursor-pointer"
    >
      <style>{`
        .glass-morphism {
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
        }
        .premium-shadow {
          box-shadow: 
            0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06),
            0 0 0 1px rgba(255, 255, 255, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <div className="flex items-center justify-between">
        <div className="space-y-3">
          <p className="text-sm font-medium text-slate-600/80 group-hover:text-slate-700 transition-colors">
            {title}
          </p>
          <p className={`text-3xl font-bold bg-gradient-to-r ${gradient} bg-clip-text text-transparent`}>
            {value}
          </p>
          {trend && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-1 bg-green-100/80 rounded-full">
                <ArrowUpRight className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-700">{trend}</span>
              </div>
              <span className="text-xs text-slate-500/80">vs last month</span>
            </div>
          )}
        </div>
        <div className={`w-16 h-16 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
      </div>
    </motion.div>
  );
}