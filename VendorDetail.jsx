
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  X, Mail, Phone, Globe, Star, Trash2, Edit, Building, User, Hash, Banknote, Landmark, FileText, ShoppingCart, IndianRupee, DollarSign
} from "lucide-react";

export default function VendorDetail({ vendor, stats, onClose, onEdit, onDelete }) {
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

  const DetailItem = ({ icon: Icon, label, value, href, children }) => (
    <div className="flex items-start gap-4">
      <Icon className="w-5 h-5 text-slate-400 mt-1 flex-shrink-0" />
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        {children ? (
            <div className="text-slate-800 font-medium">{children}</div>
        ) : href ? (
          <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium break-all">{value}</a>
        ) : (
          <p className="text-slate-800 font-medium break-words">{value || 'N/A'}</p>
        )}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-start justify-between border-b pb-4">
          <div>
            <CardTitle className="text-2xl text-slate-800">{vendor.vendor_name}</CardTitle>
            <p className="text-slate-500">{vendor.category}</p>
            <div className="flex items-center gap-4 mt-2">
              <Badge className={statusColors[vendor.status]}>{vendor.status}</Badge>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < vendor.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`} />)}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="p-6 max-h-[70vh] overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Column 1 */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-600 border-b pb-2">Contact Information</h4>
              <DetailItem icon={User} label="Contact Person" value={vendor.contact_person} />
              <DetailItem icon={Mail} label="Email" value={vendor.email} href={`mailto:${vendor.email}`} />
              <DetailItem icon={Phone} label="Phone" value={vendor.phone} href={`tel:${vendor.phone}`} />
              <DetailItem icon={Globe} label="Website" value={vendor.website} href={vendor.website} />
              <DetailItem icon={Building} label="Address" value={vendor.address} />
            </div>
            
            {/* Column 2 */}
            <div className="space-y-6">
              <h4 className="font-semibold text-slate-600 border-b pb-2">Financial & Legal</h4>
              <DetailItem icon={FileText} label="GSTIN" value={vendor.gstin} />
              <DetailItem icon={Hash} label="PAN" value={vendor.pan} />
              <DetailItem icon={Banknote} label="Bank Account No." value={vendor.bank_account_number} />
              <DetailItem icon={Landmark} label="IFSC Code" value={vendor.bank_ifsc_code} />
              <DetailItem icon={IndianRupee} label="Payment Terms" value={vendor.payment_terms} />
            </div>

            {/* Full-width section */}
            <div className="md:col-span-2 space-y-6">
               <h4 className="font-semibold text-slate-600 border-b pb-2">Performance & Notes</h4>
                <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <DetailItem icon={ShoppingCart} label="Order Count">
                        <p className="text-slate-800 font-bold text-lg">{stats.orderCount}</p>
                    </DetailItem>
                    <DetailItem icon={DollarSign} label="Total Spend">
                        <p className="text-slate-800 font-bold text-lg">{formatCurrency(stats.totalSpend)}</p>
                    </DetailItem>
                </div>
               <DetailItem icon={FileText} label="Internal Notes">
                  <p className="text-slate-700 whitespace-pre-wrap">{vendor.notes || 'No notes added.'}</p>
               </DetailItem>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end gap-3 border-t pt-4">
          <Button variant="destructive" onClick={() => onDelete(vendor.id)}>
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
          <Button onClick={() => onEdit(vendor)}>
            <Edit className="w-4 h-4 mr-2" /> Edit Vendor
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
