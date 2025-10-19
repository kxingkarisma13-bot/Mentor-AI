import * as React from "react";
import { useEffect, useRef } from "react";
import { ShakeDetector } from "@/utils/shakeDetector";
import { toast } from "@/hooks/use-toast";
import { EmergencyAlertSystem } from "@/utils/emergencyUtils";

const ShakeEmergencyBridge: React.FC = () => {
  const detectorRef = useRef<ShakeDetector | null>(null);
  const alertSystemRef = useRef<EmergencyAlertSystem | null>(null);

  useEffect(() => {
    alertSystemRef.current = new EmergencyAlertSystem();

    const handleShake = async () => {
      toast({
        title: "Shake detected",
        description: "Triggering emergency protocol (3 shakes).",
        variant: "destructive",
      });

      try {
        // Send direct alert to personnel and notify contacts
        await alertSystemRef.current?.sendDirectEmergencyAlert(
          "general",
          "Emergency detected via triple-shake gesture"
        );
      } catch (err) {
        console.error("Emergency alert failed from shake:", err);
      }
    };

    detectorRef.current = new ShakeDetector(handleShake, {
      requiredShakes: 3,
    });

    let clickOnce = (function once() {
      document.removeEventListener("click", clickOnce as any);
      detectorRef.current?.enable();
      return once as any;
    })();
    document.addEventListener("click", clickOnce as any);

    return () => {
      detectorRef.current?.disable();
      detectorRef.current = null;
      alertSystemRef.current = null;
      document.removeEventListener("click", clickOnce as any);
    };
  }, []);

  return null;
};

export default ShakeEmergencyBridge;


