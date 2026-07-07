import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

export function ContactsPage() {
  const contacts = [
    {
      category: 'Management',
      people: [
        {
          name: 'Dominique Ockiere',
          role: 'Administrator',
          phone: '+237 6 77 88 99 00',
          email: 'dominique.ockiere@zeduc.admin.com',
        },
        {
          name: 'Dominique Ockiere',
          role: 'Manager',
          phone: '+237 6 77 88 99 01',
          email: 'dominiqueockiere@zeduc.manager.com',
        },
      ],
    },
    {
      category: 'Kitchen Staff',
      people: [
        {
          name: 'Dominique Ockiere',
          role: 'Head Cook',
          phone: '+237 6 77 88 99 02',
          email: 'okddominique@zeduc.employe.com',
        },
      ],
    },
    {
      category: 'Service Staff',
      people: [
        {
          name: 'Employé Service',
          role: 'Server',
          phone: '+237 6 77 88 99 03',
          email: 'service@zeduc.employe.com',
        },
      ],
    },
    {
      category: 'Delivery',
      people: [
        {
          name: 'Employé Livraison',
          role: 'Delivery Driver',
          phone: '+237 6 77 88 99 04',
          email: 'livraison@zeduc.employe.com',
        },
      ],
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8">Contact Information</h1>

      {/* Restaurant Main Contact */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>ZEDUC-SP@CE Restaurant</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Téléphone Principal</p>
              <p>+237 6 77 88 99 10</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p>contact@zeduc-space.cm</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-600">Adresse</p>
              <p>Yassa, près de Yachtika, sur la terrasse, Yaoundé, Cameroun</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Staff Contacts */}
      <div className="grid md:grid-cols-2 gap-6">
        {contacts.map((category) => (
          <Card key={category.category}>
            <CardHeader>
              <CardTitle>{category.category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.people.map((person, index) => (
                  <div key={index} className="pb-4 border-b last:border-b-0 last:pb-0">
                    <p>{person.name}</p>
                    <p className="text-sm text-gray-600 mb-2">{person.role}</p>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{person.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{person.email}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Emergency Contacts */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Contacts d'Urgence</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Services d'Urgence</p>
              <p>117</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Police</p>
              <p>117</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Pompiers</p>
              <p>118</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
