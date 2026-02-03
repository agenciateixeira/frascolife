'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { X } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  email: string;
  avatar: string | null;
  role: string;
}

interface WorkloadStats {
  totalLeads: number;
  activeLeads: number;
  leadsThisMonth: number;
  wonThisMonth: number;
  lostThisMonth: number;
  overdueTasks: number;
  totalOpportunityValue: number;
  conversionRate: string;
}

interface Workload {
  user: User;
  stats: WorkloadStats;
}

interface AssignLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadIds: string[];
  onAssigned?: () => void;
}

export function AssignLeadModal({
  isOpen,
  onClose,
  leadIds,
  onAssigned
}: AssignLeadModalProps) {
  const [loading, setLoading] = useState(false);
  const [workloads, setWorkloads] = useState<Workload[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchWorkloads();
    }
  }, [isOpen]);

  async function fetchWorkloads() {
    try {
      const response = await fetch('/api/users/workload');
      const data = await response.json();

      if (response.ok) {
        setWorkloads(data.workloads);
      } else {
        toast.error('Erro ao carregar vendedores');
      }
    } catch (error) {
      console.error('Error fetching workloads:', error);
      toast.error('Erro ao carregar vendedores');
    }
  }

  async function handleAssign() {
    if (!selectedUserId) {
      toast.error('Selecione um vendedor');
      return;
    }

    setLoading(true);

    try {
      let response;

      // Se for apenas um lead, usar API individual
      if (leadIds.length === 1) {
        response = await fetch(`/api/leads/${leadIds[0]}/assign`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            assignedToId: selectedUserId,
            reason: reason || undefined
          })
        });
      } else {
        // Múltiplos leads, usar API de bulk
        response = await fetch('/api/leads/bulk-assign', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadIds,
            method: 'manual',
            assignToIds: [selectedUserId],
            reason: reason || undefined
          })
        });
      }

      const data = await response.json();

      if (response.ok) {
        toast.success(
          leadIds.length === 1
            ? 'Lead atribuído com sucesso!'
            : `${data.successCount} leads atribuídos com sucesso!`
        );

        onClose();
        if (onAssigned) {
          onAssigned();
        }
      } else {
        toast.error(data.error || 'Erro ao atribuir lead(s)');
      }
    } catch (error) {
      console.error('Error assigning lead:', error);
      toast.error('Erro ao atribuir lead(s)');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Atribuir {leadIds.length === 1 ? 'Lead' : `${leadIds.length} Leads`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Seletor de Vendedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendedor
            </label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um vendedor..." />
              </SelectTrigger>
              <SelectContent>
                {workloads.map(({ user, stats }) => (
                  <SelectItem key={user.id} value={user.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{user.fullName}</span>
                      <span className="text-xs text-gray-500 ml-4">
                        ({stats.activeLeads} leads ativos)
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Estatísticas do Vendedor Selecionado */}
          {selectedUserId && (
            <div className="bg-gray-50 rounded-lg p-4">
              {(() => {
                const workload = workloads.find(w => w.user.id === selectedUserId);
                if (!workload) return null;

                return (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">
                      Carga de Trabalho - {workload.user.fullName}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Leads Ativos</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {workload.stats.activeLeads}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Novos Este Mês</p>
                        <p className="text-lg font-semibold text-gray-900">
                          {workload.stats.leadsThisMonth}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Ganhos Este Mês</p>
                        <p className="text-lg font-semibold text-green-600">
                          {workload.stats.wonThisMonth}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Taxa de Conversão</p>
                        <p className="text-lg font-semibold text-blue-600">
                          {workload.stats.conversionRate}%
                        </p>
                      </div>
                    </div>

                    {workload.stats.overdueTasks > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          ⚠️ {workload.stats.overdueTasks} tarefa(s) atrasada(s)
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Motivo (opcional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Motivo da Atribuição (opcional)
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Especialista em região Sudeste, melhor perfil para este cliente..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleAssign} disabled={loading || !selectedUserId}>
            {loading ? 'Atribuindo...' : 'Atribuir'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
