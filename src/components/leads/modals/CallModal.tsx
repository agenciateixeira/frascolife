'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PhoneCall, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface CallModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string;
  userId: string;
  onSuccess?: () => void;
}

export function CallModal({ open, onClose, leadId, userId, onSuccess }: CallModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    duration: '',
    outcome: 'NO_ANSWER',
    direction: 'OUTBOUND',
    notes: '',
    fromNumber: '',
    toNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId,
          userId,
          ...formData,
          duration: formData.duration ? parseInt(formData.duration) : 0
        })
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Ligação registrada com sucesso!');
        onSuccess?.();
        onClose();
        setFormData({
          duration: '',
          outcome: 'NO_ANSWER',
          direction: 'OUTBOUND',
          notes: '',
          fromNumber: '',
          toNumber: ''
        });
      } else {
        toast.error(data.error || 'Erro ao registrar ligação');
      }
    } catch (error) {
      console.error('Error creating call:', error);
      toast.error('Erro ao registrar ligação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PhoneCall className="h-5 w-5" />
            Registrar Ligação
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="direction">Direção</Label>
            <Select
              value={formData.direction}
              onValueChange={(value) => setFormData({ ...formData, direction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OUTBOUND">Saída</SelectItem>
                <SelectItem value="INBOUND">Entrada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outcome">Resultado</Label>
            <Select
              value={formData.outcome}
              onValueChange={(value) => setFormData({ ...formData, outcome: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERESTED">Interessado</SelectItem>
                <SelectItem value="NOT_INTERESTED">Não Interessado</SelectItem>
                <SelectItem value="CALLBACK">Retornar Ligação</SelectItem>
                <SelectItem value="WRONG_NUMBER">Número Errado</SelectItem>
                <SelectItem value="VOICEMAIL">Caixa Postal</SelectItem>
                <SelectItem value="MEETING_SCHEDULED">Reunião Agendada</SelectItem>
                <SelectItem value="NO_ANSWER">Não Atendeu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duração (minutos)</Label>
            <Input
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="Ex: 5"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas da Ligação</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Resumo da conversa, próximos passos..."
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Registrar Ligação
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
