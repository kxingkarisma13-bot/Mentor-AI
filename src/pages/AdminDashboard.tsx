import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Shield, CheckCircle2, XCircle, AlertTriangle, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent } from "@/utils/validation";

interface Professional {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  specialties: string[];
  hourly_rate: number;
  years_experience: number;
  certifications: string[] | null;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingProfessionals, setPendingProfessionals] = useState<Professional[]>([]);
  const [verifiedProfessionals, setVerifiedProfessionals] = useState<Professional[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      // Check if user has admin role
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .single();

      if (error || !roles) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate('/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchProfessionals();
    } catch (error: any) {
      console.error('Admin access check error:', error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfessionals = async () => {
    try {
      // Fetch pending professionals
      const { data: pending, error: pendingError } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_verified', false)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      setPendingProfessionals(pending || []);

      // Fetch verified professionals
      const { data: verified, error: verifiedError } = await supabase
        .from('professionals')
        .select('*')
        .eq('is_verified', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (verifiedError) throw verifiedError;
      setVerifiedProfessionals(verified || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load professionals data",
        variant: "destructive",
      });
    }
  };

  const handleVerification = async (professionalId: string, verified: boolean) => {
    setProcessingId(professionalId);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Update professional verification status
      const { error: updateError } = await supabase
        .from('professionals')
        .update({ is_verified: verified })
        .eq('id', professionalId);

      if (updateError) throw updateError;

      // Log verification action in audit table
      const { error: auditError } = await supabase
        .from('verification_audit')
        .insert({
          professional_id: professionalId,
          verified_by: session.user.id,
          action: verified ? 'verified' : 'rejected',
        });

      if (auditError) console.error('Audit log error:', auditError);

      logSecurityEvent({
        event_type: 'verification_request',
        user_id: session.user.id,
        details: {
          professional_id: professionalId,
          action: verified ? 'approved' : 'rejected',
        },
      });

      toast({
        title: verified ? "Professional Verified" : "Verification Rejected",
        description: verified 
          ? "The professional can now accept consultations."
          : "The professional has been notified.",
      });

      // Refresh data
      await fetchProfessionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update verification status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeactivate = async (professionalId: string, active: boolean) => {
    setProcessingId(professionalId);
    try {
      const { error } = await supabase
        .from('professionals')
        .update({ is_active: active })
        .eq('id', professionalId);

      if (error) throw error;

      toast({
        title: active ? "Professional Activated" : "Professional Deactivated",
        description: active 
          ? "The professional is now active."
          : "The professional can no longer accept consultations.",
      });

      await fetchProfessionals();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const ProfessionalCard = ({ professional, showVerifyActions }: { professional: Professional; showVerifyActions: boolean }) => (
    <Card key={professional.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {professional.display_name}
              {professional.is_verified && (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
            </CardTitle>
            <CardDescription>
              {professional.years_experience} years experience • ${professional.hourly_rate}/hr
            </CardDescription>
          </div>
          <Badge variant={professional.is_active ? "default" : "secondary"}>
            {professional.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">Specialties:</p>
          <div className="flex flex-wrap gap-2">
            {professional.specialties.map((spec) => (
              <Badge key={spec} variant="outline">{spec}</Badge>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Bio:</p>
          <p className="text-sm text-muted-foreground">{professional.bio}</p>
        </div>

        {professional.certifications && professional.certifications.length > 0 && (
          <div>
            <p className="text-sm font-medium mb-1">Certifications:</p>
            <ul className="text-sm text-muted-foreground list-disc list-inside">
              {professional.certifications.map((cert, idx) => (
                <li key={idx}>{cert}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-2">
          {showVerifyActions && (
            <>
              <Button
                onClick={() => handleVerification(professional.id, true)}
                disabled={processingId === professional.id}
                className="flex-1 bg-[image:var(--gradient-primary)]"
              >
                {processingId === professional.id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Approve
              </Button>
              <Button
                onClick={() => handleVerification(professional.id, false)}
                disabled={processingId === professional.id}
                variant="destructive"
                className="flex-1"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {!showVerifyActions && (
            <Button
              onClick={() => handleDeactivate(professional.id, !professional.is_active)}
              disabled={processingId === professional.id}
              variant={professional.is_active ? "destructive" : "default"}
              className="w-full"
            >
              {professional.is_active ? "Deactivate" : "Activate"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold">Admin Panel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Professional Verification</h1>
          <p className="text-muted-foreground">
            Review and verify professional credentials before they can accept consultations.
          </p>
        </div>

        <Alert className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Security Notice:</strong> Only verified professionals can accept paid consultations.
            Review credentials carefully before approving.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pending">
              Pending ({pendingProfessionals.length})
            </TabsTrigger>
            <TabsTrigger value="verified">
              Verified ({verifiedProfessionals.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingProfessionals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending verifications</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pendingProfessionals.map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} showVerifyActions={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="verified">
            {verifiedProfessionals.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No verified professionals yet</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {verifiedProfessionals.map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} showVerifyActions={false} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
