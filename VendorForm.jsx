import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

export default function VendorForm({ vendor, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    vendor_name: '',
    contact_person: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    gstin: '',
    pan: '',
    bank_account_number: '',
    bank_ifsc_code: '',
    category: 'Services',
    rating: 3,
    status: 'Active',
    notes: '',
    payment_terms: 'Net 30'
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        vendor_name: vendor.vendor_name || '',
        contact_person: vendor.contact_person || '',
        email: vendor.email || '',
        phone: vendor.phone || '',
        address: vendor.address || '',
        website: vendor.website || '',
        gstin: vendor.gstin || '',
        pan: vendor.pan || '',
        bank_account_number: vendor.bank_account_number || '',
        bank_ifsc_code: vendor.bank_ifsc_code || '',
        category: vendor.category || 'Services',
        rating: vendor.rating || 3,
        status: vendor.status || 'Active',
        notes: vendor.notes || '',
        payment_terms: vendor.payment_terms || 'Net 30'
      });
    }
  }, [vendor]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, rating: Number(formData.rating) });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <Card
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{vendor ? 'Edit Vendor' : 'Create New Vendor'}</CardTitle>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
        </CardHeader>
        <CardContent className="max-h-[80vh] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section: Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 border-b pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Vendor Name*" value={formData.vendor_name} onChange={(e) => handleChange('vendor_name', e.target.value)} required />
                <Select value={formData.category} onValueChange={(v) => handleChange('category', v)}>
                  <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                    <SelectItem value="Equipment">Equipment</SelectItem>
                    <SelectItem value="Software">Software</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Consulting">Consulting</SelectItem>
                    <SelectItem value="Logistics">Logistics</SelectItem>
                    <SelectItem value="Raw Materials">Raw Materials</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <Input placeholder="Website" value={formData.website} onChange={(e) => handleChange('website', e.target.value)} />
                <Textarea placeholder="Address" value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="md:col-span-2" />
              </div>
            </div>

            {/* Section: Contact Details */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 border-b pb-2 mb-4">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="Contact Person*" value={formData.contact_person} onChange={(e) => handleChange('contact_person', e.target.value)} required />
                <Input type="email" placeholder="Email Address*" value={formData.email} onChange={(e) => handleChange('email', e.target.value)} required />
                <Input placeholder="Phone Number" value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} />
              </div>
            </div>

            {/* Section: Financial Information */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 border-b pb-2 mb-4">Financial & Legal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input placeholder="GSTIN" value={formData.gstin} onChange={(e) => handleChange('gstin', e.target.value)} />
                <Input placeholder="PAN" value={formData.pan} onChange={(e) => handleChange('pan', e.target.value)} />
                <Input placeholder="Bank Account Number" value={formData.bank_account_number} onChange={(e) => handleChange('bank_account_number', e.target.value)} />
                <Input placeholder="Bank IFSC Code" value={formData.bank_ifsc_code} onChange={(e) => handleChange('bank_ifsc_code', e.target.value)} />
                <Select value={formData.payment_terms} onValueChange={v => handleChange('payment_terms', v)}>
                  <SelectTrigger><SelectValue placeholder="Payment Terms" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Due on receipt">Due on receipt</SelectItem>
                    <SelectItem value="Net 15">Net 15</SelectItem>
                    <SelectItem value="Net 30">Net 30</SelectItem>
                    <SelectItem value="Net 60">Net 60</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Section: Internal Status */}
            <div>
              <h3 className="text-lg font-medium text-slate-700 border-b pb-2 mb-4">Internal Status</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={String(formData.rating)} onValueChange={(v) => handleChange('rating', v)}>
                  <SelectTrigger><SelectValue placeholder="Rating" /></SelectTrigger>
                  <SelectContent>{[1, 2, 3, 4, 5].map(r => <SelectItem key={r} value={String(r)}>{'★'.repeat(r)}{'☆'.repeat(5-r)}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
                  <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea placeholder="Internal Notes..." value={formData.notes} onChange={(e) => handleChange('notes', e.target.value)} className="md:col-span-2" />
               </div>
            </div>

            <div className="col-span-2 flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Vendor</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}