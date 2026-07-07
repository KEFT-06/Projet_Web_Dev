import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { getComplaints, saveComplaints } from '../../lib/storage';
import type { Complaint, User } from '../../lib/mockData';
import { toast } from 'sonner';
import { Download, FileText, FileSpreadsheet, MessageSquare } from 'lucide-react';
import { exportComplaintToPDF, exportComplaintsToPDF, exportComplaintsToExcel } from '../../lib/exportService';
import { useApp } from '../../lib/AppContext';
import { notifyComplaintResponse } from '../../lib/notificationService';

interface ComplaintsManagementProps {
  user: User;
  role: 'employee' | 'manager' | 'admin';
}

export function ComplaintsManagement({ user, role }: ComplaintsManagementProps) {
  const { language } = useApp();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [response, setResponse] = useState('');
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = () => {
    setComplaints(getComplaints());
  };

  const handleRespond = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setResponse(complaint.employeeResponse || complaint.managerResponse || complaint.adminResponse || '');
    setShowDialog(true);
  };

  const submitResponse = () => {
    if (!selectedComplaint || !response.trim()) {
      toast.error('Please enter a response');
      return;
    }

    const allComplaints = getComplaints();
    const complaintIndex = allComplaints.findIndex(c => c.id === selectedComplaint.id);

    if (complaintIndex !== -1) {
      // Set response based on role
      if (role === 'employee') {
        allComplaints[complaintIndex].employeeResponse = response.trim();
        allComplaints[complaintIndex].responseValidated = false; // Needs validation from manager
      } else if (role === 'manager') {
        allComplaints[complaintIndex].managerResponse = response.trim();
        allComplaints[complaintIndex].responseValidated = true;
        allComplaints[complaintIndex].status = 'responded';
      } else if (role === 'admin') {
        allComplaints[complaintIndex].adminResponse = response.trim();
        allComplaints[complaintIndex].responseValidated = true;
        allComplaints[complaintIndex].status = 'responded';
      }

      saveComplaints(allComplaints);
      loadComplaints();
      setShowDialog(false);
      setResponse('');
      toast.success('Response saved successfully');
    }
  };

  const validateResponse = (complaintId: string) => {
    const allComplaints = getComplaints();
    const complaintIndex = allComplaints.findIndex(c => c.id === complaintId);

    if (complaintIndex !== -1) {
      allComplaints[complaintIndex].responseValidated = true;
      allComplaints[complaintIndex].status = 'responded';
      saveComplaints(allComplaints);
      
      // Envoyer notification au client
      notifyComplaintResponse(allComplaints[complaintIndex], user);
      
      loadComplaints();
      toast.success('Réponse validée et envoyée au client');
    }
  };

  const rejectResponse = (complaintId: string) => {
    const allComplaints = getComplaints();
    const complaintIndex = allComplaints.findIndex(c => c.id === complaintId);

    if (complaintIndex !== -1) {
      // Clear employee response and mark as pending again
      allComplaints[complaintIndex].employeeResponse = undefined;
      allComplaints[complaintIndex].responseValidated = false;
      allComplaints[complaintIndex].status = 'pending';
      saveComplaints(allComplaints);
      loadComplaints();
      toast.success('Réponse rejetée. L\'employé doit fournir une nouvelle réponse.');
    }
  };

  const getStatusBadge = (status: Complaint['status']) => {
    const variants: Record<Complaint['status'], any> = {
      'pending': 'destructive',
      'responded': 'secondary',
      'resolved': 'default',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  // Fonctions d'export
  const handleExportPDF = (complaint?: Complaint) => {
    if (complaint) {
      exportComplaintToPDF(complaint, { 
        language: language as 'fr' | 'en' | 'es', 
        includeHistory: true 
      });
      toast.success(language === 'fr' ? 'PDF téléchargé' : 'PDF downloaded');
    } else {
      exportComplaintsToPDF(complaints, { 
        language: language as 'fr' | 'en' | 'es' 
      });
      toast.success(language === 'fr' ? 'Rapport PDF téléchargé' : 'PDF report downloaded');
    }
  };

  const handleExportExcel = () => {
    exportComplaintsToExcel(complaints, { 
      language: language as 'fr' | 'en' | 'es' 
    });
    toast.success(language === 'fr' ? 'Fichier Excel téléchargé' : 'Excel file downloaded');
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 md:mb-8">Complaint Management</h1>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              All Complaints
            </CardTitle>
            <div className="flex gap-2">
              {complaints.length > 0 && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExportPDF()}
                    className="flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    {language === 'fr' ? 'Export PDF' : 'Export PDF'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleExportExcel}
                    className="flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    {language === 'fr' ? 'Export Excel' : 'Export Excel'}
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {complaints.length === 0 ? (
              <p className="text-gray-600 text-center py-8">No complaints</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead className="hidden md:table-cell">Subject</TableHead>
                      <TableHead className="hidden lg:table-cell">Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden xl:table-cell">Response</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="whitespace-nowrap">{complaint.timestamp.toLocaleDateString()}</TableCell>
                        <TableCell className="whitespace-nowrap">{complaint.customerName}</TableCell>
                        <TableCell className="hidden md:table-cell max-w-[150px] truncate">{complaint.subject}</TableCell>
                        <TableCell className="hidden lg:table-cell max-w-xs truncate">{complaint.message}</TableCell>
                        <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                        <TableCell className="hidden xl:table-cell max-w-xs truncate">
                          {role === 'employee' && complaint.employeeResponse}
                          {role === 'manager' && (complaint.managerResponse || complaint.employeeResponse)}
                          {role === 'admin' && (complaint.adminResponse || complaint.managerResponse || complaint.employeeResponse)}
                          {!complaint.employeeResponse && !complaint.managerResponse && !complaint.adminResponse && '-'}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRespond(complaint)}
                            >
                              {complaint.employeeResponse || complaint.managerResponse || complaint.adminResponse ? 'Edit' : 'Respond'}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleExportPDF(complaint)}
                              title="Télécharger PDF"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            {(role === 'manager' || role === 'admin') && 
                             complaint.employeeResponse && 
                             !complaint.responseValidated && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => validateResponse(complaint.id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Valider
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => rejectResponse(complaint.id)}
                                >
                                  Rejeter
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Response Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Respond to Complaint</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Customer</p>
                <p className="mb-3">{selectedComplaint.customerName}</p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject</p>
                <p className="mb-3">{selectedComplaint.subject}</p>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Message</p>
                <p>{selectedComplaint.message}</p>
              </div>

              {role !== 'employee' && selectedComplaint.employeeResponse && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Employee Response</p>
                  <p>{selectedComplaint.employeeResponse}</p>
                </div>
              )}

              {role === 'admin' && selectedComplaint.managerResponse && (
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Manager Response</p>
                  <p>{selectedComplaint.managerResponse}</p>
                </div>
              )}

              <div>
                <label className="text-sm mb-2 block">Your Response</label>
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  rows={6}
                  placeholder="Enter your response..."
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowDialog(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={submitResponse} className="w-full sm:w-auto">
              Save Response
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}