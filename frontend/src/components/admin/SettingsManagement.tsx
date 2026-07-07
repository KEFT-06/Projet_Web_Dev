import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function SettingsManagement() {
  const [settings, setSettings] = useState({
    openingHours: '08:00 - 22:00',
    policy: 'Aucune politique définie.'
  });
  const [edit, setEdit] = useState(false);

  const handleSave = () => {
    setEdit(false);
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Paramètres de l’Application</CardTitle>
      </CardHeader>
      <CardContent>
        {edit ? (
          <div className="flex flex-col gap-2">
            <Input value={settings.openingHours} onChange={e => setSettings(s => ({ ...s, openingHours: e.target.value }))} />
            <Input value={settings.policy} onChange={e => setSettings(s => ({ ...s, policy: e.target.value }))} />
            <Button onClick={handleSave}>Enregistrer</Button>
          </div>
        ) : (
          <div>
            <div><b>Heures d’ouverture :</b> {settings.openingHours}</div>
            <div><b>Politique :</b> {settings.policy}</div>
            <Button className="mt-2" onClick={() => setEdit(true)}>Modifier</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
