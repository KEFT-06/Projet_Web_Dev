import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getComplaints, saveComplaints } from '../../lib/storage';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import type { Complaint, User } from '../../lib/mockData';

export function ComplaintsManagement() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setComplaints(getComplaints());
  }, []);

  const handleRespond = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.employeeResponse || '');
    setShowDialog(true);
  };

  const handleSaveResponse = () => {
    if (!selectedComplaint || !response.trim()) {
      toast.error('Veuillez entrer une réponse');
      return;
    }

    const updatedComplaints = complaints.map(c => {
      if (c.id === selectedComplaint.id) {
        return {
          ...c,
          status: 'responded' as const,
          employeeResponse: response.trim()
        };
      }
      return c;
    });

    saveComplaints(updatedComplaints);
    setComplaints(updatedComplaints);
    setShowDialog(false);
    setResponse('');
    toast.success('Réponse enregistrée');
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const variants: Record<string, 'default' | 'destructive' | 'secondary'> = {
      'pending': 'destructive',
      'responded': 'default',
      'resolved': 'secondary'
    };
    return (
      <Badge variant={variants[status]}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Suivi des Réclamations</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Toutes les réclamations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead className="hidden md:table-cell">Message</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.customerName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{c.subject}</TableCell>
                    <TableCell className="hidden md:table-cell max-w-[300px] truncate">{c.message}</TableCell>
                    <TableCell className="whitespace-nowrap">{new Date(c.timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{getStatusBadge(c.status)}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant={c.status === 'pending' ? 'default' : 'outline'}
                        onClick={() => handleRespond(c)}
                      >
                        {c.status === 'pending' ? 'Répondre' : 'Voir/Modifier'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Répondre à la réclamation</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div>
                  <p className="text-sm font-medium">Client</p>
                  <p>{selectedComplaint.customerName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Sujet</p>
                  <p>{selectedComplaint.subject}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Message</p>
                  <p>{selectedComplaint.message}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Votre réponse</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Entrez votre réponse..."
                  rows={4}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveResponse}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
