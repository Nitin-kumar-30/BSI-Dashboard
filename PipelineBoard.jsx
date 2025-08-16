import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LeadCard from './LeadCard';

const STAGES = ['Prospecting', 'Qualified', 'Proposal', 'Negotiation', 'Closed Won', 'Closed Lost'];

const stageColors = {
  Prospecting: 'border-blue-500',
  Qualified: 'border-purple-500',
  Proposal: 'border-yellow-500',
  Negotiation: 'border-orange-500',
  'Closed Won': 'border-green-500',
  'Closed Lost': 'border-red-500',
};

export default function PipelineBoard({ leads, contacts, onEdit, onDelete, onMoveLead }) {
  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId !== destination.droppableId) {
      onMoveLead(draggableId, destination.droppableId);
    }
  };
  
  const formatCurrency = (amount) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)} Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)} L`;
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 h-full">
        {STAGES.map(stage => {
          const stageLeads = leads.filter(l => l.stage === stage);
          const stageValue = stageLeads.reduce((sum, l) => sum + (l.value || 0), 0);
          
          return (
            <Droppable key={stage} droppableId={stage}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col h-full rounded-xl transition-colors ${snapshot.isDraggingOver ? 'bg-cyan-500/5' : 'bg-transparent'}`}
                >
                  <div className={`p-4 sticky top-0 bg-slate-900/50 backdrop-blur-sm rounded-t-xl z-10 border-b-2 ${stageColors[stage]}`}>
                    <h3 className="font-bold text-white">{stage} ({stageLeads.length})</h3>
                    <p className="text-sm text-cyan-400 font-semibold">{formatCurrency(stageValue)}</p>
                  </div>
                  <div className="p-2 space-y-4 overflow-y-auto flex-1">
                    {stageLeads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{...provided.draggableProps.style}}
                            className={`${snapshot.isDragging ? 'shadow-2xl shadow-cyan-500/20' : ''}`}
                          >
                            <LeadCard 
                              lead={lead} 
                              contacts={contacts} 
                              onEdit={onEdit} 
                              onDelete={onDelete} 
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}