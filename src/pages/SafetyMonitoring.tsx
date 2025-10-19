import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, Activity, Mic, AlertTriangle, CheckCircle, XCircle, Clock, MapPin, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SafetyMonitoringAssistant, SafetyEvent, DistressIndicator } from "@/utils/safetyMonitor";
import { EmergencyAlertSystem } from "@/utils/emergencyUtils";

const SafetyMonitoring = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [safetyMonitor] = useState<SafetyMonitoringAssistant>(new SafetyMonitoringAssistant());
  const [emergencyAlertSystem] = useState<EmergencyAlertSystem>(new EmergencyAlertSystem());
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [safetyEvents, setSafetyEvents] = useState<SafetyEvent[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSafetyEvents();
    return () => {
      safetyMonitor.stopMonitoring();
    };
  }, []);

  const loadSafetyEvents = () => {
    const events = safetyMonitor.getSafetyEvents();
    setSafetyEvents(events);
  };

  const toggleMonitoring = () => {
    if (isMonitoring) {
      safetyMonitor.stopMonitoring();
      setIsMonitoring(false);
      toast({
        title: "Safety Monitoring Stopped",
        description: "Continuous safety monitoring has been disabled.",
      });
    } else {
      safetyMonitor.startMonitoring(emergencyAlertSystem);
      setIsMonitoring(true);
      toast({
        title: "Safety Monitoring Started",
        description: "Continuous monitoring for distress indicators is now active.",
      });
    }
  };

  const clearSafetyEvents = () => {
    safetyMonitor.clearSafetyEvents();
    setSafetyEvents([]);
    toast({
      title: "Safety Events Cleared",
      description: "All safety monitoring events have been cleared.",
    });
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'motion': return <Activity className="w-4 h-4" />;
      case 'speech': return <Mic className="w-4 h-4" />;
      case 'voice_pattern': return <Mic className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'detected': return <Clock className="w-4 h-4 text-blue-500" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'false_positive': return <XCircle className="w-4 h-4 text-gray-500" />;
      case 'emergency_activated': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
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
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">Safety Monitoring</h1>
              <p className="text-xs text-muted-foreground">Continuous distress detection</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Monitoring Status */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Safety Monitoring Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isMonitoring ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                <span className="font-medium">
                  {isMonitoring ? 'Monitoring Active' : 'Monitoring Inactive'}
                </span>
              </div>
              <Button 
                onClick={toggleMonitoring}
                className={isMonitoring ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
              >
                {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Motion Detection</span>
                </div>
                <p className="text-gray-600">Detects rapid shaking (3x in 2s)</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Mic className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Speech Analysis</span>
                </div>
                <p className="text-gray-600">Monitors for distress keywords</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Emergency Response</span>
                </div>
                <p className="text-gray-600">Auto-activates if confirmed</p>
              </div>
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800 mb-1">Privacy & Consent</h4>
                  <p className="text-sm text-amber-700">
                    Safety monitoring requires your explicit consent and only activates during detected distress. 
                    All data is processed locally and only shared during confirmed emergencies.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Safety Events */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Safety Events</h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showDetails ? 'Hide Details' : 'Show Details'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearSafetyEvents}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Clear Events
              </Button>
            </div>
          </div>

          {safetyEvents.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Safety Events</h3>
                <p className="text-muted-foreground">
                  No distress indicators have been detected yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {safetyEvents
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((event) => (
                <Card key={event.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(event.status)}
                        <span className="font-medium">
                          {event.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatTimestamp(event.timestamp)}
                        </span>
                      </div>
                    </div>

                    {/* Indicators */}
                    <div className="space-y-2 mb-3">
                      {event.indicators.map((indicator, index) => (
                        <div 
                          key={index}
                          className={`p-2 rounded-lg border ${getSeverityColor(indicator.severity)}`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {getIndicatorIcon(indicator.type)}
                            <span className="font-medium text-sm">
                              {indicator.type.toUpperCase()}
                            </span>
                            <span className="text-xs">
                              Confidence: {Math.round(indicator.confidence * 100)}%
                            </span>
                          </div>
                          {showDetails && (
                            <div className="text-xs text-gray-600 mt-1">
                              <p>Severity: {indicator.severity}</p>
                              <p>Time: {formatTimestamp(indicator.timestamp)}</p>
                              {indicator.data && (
                                <p>Data: {JSON.stringify(indicator.data, null, 2)}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Location */}
                    {event.location && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {event.location.latitude.toFixed(6)}, {event.location.longitude.toFixed(6)}
                        </span>
                      </div>
                    )}

                    {/* User Response */}
                    {event.userResponse && (
                      <div className="text-sm">
                        <strong>User Response:</strong> {event.userResponse}
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

export default SafetyMonitoring;



