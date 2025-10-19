import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle, Send, Phone, MapPin, Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  EmergencyAlertSystem, 
  EmergencyAlert, 
  EmergencyAlertType, 
  EMERGENCY_ALERT_TEMPLATES 
} from "@/utils/emergencyUtils";

const EmergencyAlert = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [alertSystem] = useState<EmergencyAlertSystem>(new EmergencyAlertSystem());
  const [alertHistory, setAlertHistory] = useState<EmergencyAlert[]>([]);
  const [selectedAlertType, setSelectedAlertType] = useState<EmergencyAlertType>('general');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadAlertHistory();
  }, []);

  const loadAlertHistory = () => {
    const history = alertSystem.getAlertHistory();
    setAlertHistory(history);
  };

  const handleSendAlert = async () => {
    if (isSending) return;

    setIsSending(true);
    
    try {
      const success = await alertSystem.sendDirectEmergencyAlert(
        selectedAlertType,
        additionalInfo.trim() || undefined
      );

      if (success) {
        toast({
          title: "Emergency Alert Sent",
          description: "Direct alert has been sent to emergency personnel and contacts.",
        });
        
        // Reload history
        loadAlertHistory();
        
        // Reset form
        setAdditionalInfo('');
        setSelectedAlertType('general');
      } else {
        throw new Error('Failed to send alert');
      }
    } catch (error) {
      toast({
        title: "Alert Failed",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const getAlertTypeIcon = (type: EmergencyAlertType) => {
    switch (type) {
      case 'medical': return '🏥';
      case 'safety': return '🛡️';
      case 'fire': return '🔥';
      case 'police': return '👮';
      case 'fall': return '⬇️';
      case 'panic': return '😰';
      default: return '🚨';
    }
  };

  const getAlertTypeColor = (type: EmergencyAlertType) => {
    switch (type) {
      case 'medical': return 'text-red-600';
      case 'safety': return 'text-orange-600';
      case 'fire': return 'text-red-700';
      case 'police': return 'text-blue-600';
      case 'fall': return 'text-yellow-600';
      case 'panic': return 'text-purple-600';
      default: return 'text-red-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'delivered': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
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
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Emergency Alert</h1>
              <p className="text-xs text-muted-foreground">Direct alert to emergency personnel</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Send Alert Section */}
        <Card className="mb-8 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <Send className="w-5 h-5" />
              Send Emergency Alert
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Alert Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Emergency Type</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.entries(EMERGENCY_ALERT_TEMPLATES).map(([key, template]) => (
                  <Button
                    key={key}
                    variant={selectedAlertType === template.type ? "default" : "outline"}
                    onClick={() => setSelectedAlertType(template.type)}
                    className={`text-sm ${
                      selectedAlertType === template.type 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "border-red-300 text-red-700 hover:bg-red-50"
                    }`}
                  >
                    <span className="mr-2">{getAlertTypeIcon(template.type)}</span>
                    {template.type.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <label className="text-sm font-medium mb-2 block">Additional Information (Optional)</label>
              <Input
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
                placeholder="Describe the emergency situation..."
                className="w-full"
              />
            </div>

            {/* Send Button */}
            <Button 
              onClick={handleSendAlert}
              disabled={isSending}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSending ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Sending Alert...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Emergency Alert
                </>
              )}
            </Button>

            <div className="text-xs text-red-600 bg-red-100 p-3 rounded-md">
              <strong>Warning:</strong> This will immediately alert emergency services (911), your emergency contacts, and local authorities. Only use in genuine emergencies.
            </div>
          </CardContent>
        </Card>

        {/* Alert History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Alert History</h2>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                alertSystem.clearAlertHistory();
                loadAlertHistory();
                toast({
                  title: "History Cleared",
                  description: "Alert history has been cleared.",
                });
              }}
            >
              Clear History
            </Button>
          </div>

          {alertHistory.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Alerts Sent</h3>
                <p className="text-muted-foreground">
                  No emergency alerts have been sent yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {alertHistory
                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                .map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getAlertTypeIcon(alert.type)}</span>
                        <div>
                          <h3 className={`font-semibold ${getAlertTypeColor(alert.type)}`}>
                            {alert.type.toUpperCase()} EMERGENCY
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(alert.status)}
                        <span className="text-sm text-muted-foreground capitalize">
                          {alert.status}
                        </span>
                      </div>
                    </div>
                    
                    {alert.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {alert.location.latitude.toFixed(6)}, {alert.location.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}
                    
                    {alert.additionalInfo && (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm">
                          <strong>Additional Info:</strong> {alert.additionalInfo}
                        </p>
                      </div>
                    )}
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

export default EmergencyAlert;



