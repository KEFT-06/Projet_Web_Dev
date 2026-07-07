import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { addComplaint } from '../../lib/storage';
import type { User, Complaint } from '../../lib/mockData';
import { toast } from 'sonner';

interface CustomerComplaintProps {
  user: User;
}

export function CustomerComplaint({ user }: CustomerComplaintProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setIsSubmitting(true);

    const newComplaint: Complaint = {
      id: `c${Date.now()}`,
      customerId: user.id,
      customerName: `${user.firstName} ${user.lastName}`,
      subject: subject.trim(),
      message: message.trim(),
      timestamp: new Date(),
      status: 'pending',
      responseValidated: false,
    };

    try {
      addComplaint(newComplaint);
      toast.success('Votre réclamation a été soumise avec succès');
      setSubject('');
      setMessage('');
    } catch (error) {
      toast.error('Échec de la soumission de la réclamation. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-foreground">Soumettre une réclamation</h1>

      <div className="max-w-2xl mx-auto">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Formulaire de réclamation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-muted border border-border rounded-lg p-4 mb-6">
                <h3 className="mb-2 text-foreground">Instructions</h3>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Veuillez fournir un sujet clair et concis pour votre réclamation</li>
                  <li>• Décrivez votre problème en détail dans le champ message</li>
                  <li>• Notre équipe examinera et répondra à votre réclamation dans les 24 à 48 heures</li>
                  <li>• Vous pouvez suivre le statut de votre réclamation dans votre profil</li>
                </ul>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-foreground">Sujet *</Label>
                <Input
                  id="subject"
                  type="text"
                  placeholder="Brève description de votre réclamation"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="bg-input-background text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-foreground">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Veuillez décrire votre réclamation en détail..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={8}
                  className="bg-input-background text-primary-foreground placeholder:text-primary-foreground/50"
                />
              </div>

              <div className="bg-muted border border-border rounded-lg p-4">
                <h3 className="mb-2 text-foreground">Vos informations</h3>
                <div className="space-y-1 text-sm text-foreground">
                  <p><strong>Nom :</strong> {user.firstName} {user.lastName}</p>
                  <p><strong>Email :</strong> {user.email}</p>
                </div>
              </div>

              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Soumettre la réclamation'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="mt-6 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Sujets courants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setSubject('Retard de livraison')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Retard de livraison
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubject('Problème de qualité alimentaire')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Problème de qualité
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubject('Articles manquants')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Articles manquants
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubject('Réclamation de service')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Service
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubject('Problème de paiement')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Paiement
              </Button>
              <Button
                variant="outline"
                onClick={() => setSubject('Commentaires généraux')}
                className="justify-start border-primary text-foreground hover:bg-muted"
              >
                Commentaires
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}