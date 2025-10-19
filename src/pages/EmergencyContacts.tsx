import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Phone, Mail, MapPin, Star, Edit, Trash2, AlertTriangle, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmergencyService, EmergencyContact, EMERGENCY_CONTACT_TYPES } from "@/utils/emergencyUtils";

const EmergencyContacts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    relationship: '',
    isPrimary: false
  });

  const emergencyService = new EmergencyService();

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = () => {
    const allContacts = emergencyService.getContacts();
    setContacts(allContacts);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: "Missing Information",
        description: "Name and phone number are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingContact) {
        // Update existing contact
        const success = emergencyService.updateContact(editingContact.id, formData);
        if (success) {
          toast({
            title: "Contact Updated",
            description: "Emergency contact has been updated successfully.",
          });
        } else {
          throw new Error('Failed to update contact');
        }
      } else {
        // Add new contact
        const id = emergencyService.addContact({
          ...formData,
          isActive: true
        });
        toast({
          title: "Contact Added",
          description: "Emergency contact has been added successfully.",
        });
      }

      loadContacts();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingContact(contact);
    setFormData({
      name: contact.name,
      phone: contact.phone,
      email: contact.email || '',
      relationship: contact.relationship,
      isPrimary: contact.isPrimary
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    const success = emergencyService.removeContact(id);
    if (success) {
      toast({
        title: "Contact Removed",
        description: "Emergency contact has been removed.",
      });
      loadContacts();
    } else {
      toast({
        title: "Error",
        description: "Failed to remove contact. Please try again.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      relationship: '',
      isPrimary: false
    });
    setShowAddForm(false);
    setEditingContact(null);
  };

  const testEmergencyCall = async () => {
    try {
      const success = await emergencyService.callEmergencyServices();
      if (success) {
        toast({
          title: "Emergency Call Initiated",
          description: "Dialing emergency services (911)...",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate emergency call.",
        variant: "destructive",
      });
    }
  };

  const testEmergencyMessage = async () => {
    try {
      const success = await emergencyService.sendEmergencyMessage("TEST: This is a test emergency message.");
      if (success) {
        toast({
          title: "Test Message Sent",
          description: "Emergency message has been sent to all active contacts.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send emergency message.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Emergency Contacts</h1>
              <p className="text-xs text-muted-foreground">Manage your emergency contacts</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Emergency Actions */}
        <div className="mb-8">
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Emergency Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={testEmergencyCall}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Emergency Services (911)
                </Button>
                <Button 
                  onClick={testEmergencyMessage}
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Test Emergency Message
                </Button>
              </div>
              <p className="text-sm text-red-600">
                <strong>Note:</strong> These are test functions. In a real emergency, use the shake gesture or emergency button.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Name *</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Phone *</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="Phone number"
                      type="tel"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="Email address"
                      type="email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Relationship</label>
                    <select
                      value={formData.relationship}
                      onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select relationship</option>
                      {Object.entries(EMERGENCY_CONTACT_TYPES).map(([key, value]) => (
                        <option key={key} value={value}>{value}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => setFormData({...formData, isPrimary: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isPrimary" className="text-sm">
                    Set as primary emergency contact
                  </label>
                </div>

                <div className="flex gap-2">
                  <Button type="submit">
                    {editingContact ? 'Update Contact' : 'Add Contact'}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Contacts List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Emergency Contacts</h2>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Contact
            </Button>
          </div>

          {contacts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Emergency Contacts</h3>
                <p className="text-muted-foreground mb-4">
                  Add emergency contacts to ensure help is available when you need it.
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact) => (
                <Card key={contact.id} className={contact.isPrimary ? "border-yellow-200 bg-yellow-50" : ""}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{contact.name}</h3>
                        {contact.isPrimary && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(contact)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{contact.phone}</span>
                      </div>
                      
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                      
                      {contact.relationship && (
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{contact.relationship}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmergencyContacts;

