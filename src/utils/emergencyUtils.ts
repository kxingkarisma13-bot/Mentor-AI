// Emergency Contact and Location Utilities

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  address?: string;
}

export class EmergencyContactManager {
  private contacts: EmergencyContact[] = [];
  private currentLocation: LocationData | null = null;

  constructor() {
    this.loadContacts();
  }

  // Load contacts from localStorage
  private loadContacts(): void {
    try {
      const saved = localStorage.getItem('emergency-contacts');
      if (saved) {
        this.contacts = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  }

  // Save contacts to localStorage
  private saveContacts(): void {
    try {
      localStorage.setItem('emergency-contacts', JSON.stringify(this.contacts));
    } catch (error) {
      console.error('Failed to save emergency contacts:', error);
    }
  }

  // Add or update emergency contact
  addContact(contact: Omit<EmergencyContact, 'id'>): string {
    const id = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newContact: EmergencyContact = { ...contact, id };
    
    // If this is the first contact or marked as primary, make it primary
    if (this.contacts.length === 0 || contact.isPrimary) {
      this.contacts.forEach(c => c.isPrimary = false);
      newContact.isPrimary = true;
    }

    this.contacts.push(newContact);
    this.saveContacts();
    return id;
  }

  // Update existing contact
  updateContact(id: string, updates: Partial<EmergencyContact>): boolean {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.contacts[index] = { ...this.contacts[index], ...updates };
    
    // If setting as primary, unset others
    if (updates.isPrimary) {
      this.contacts.forEach((c, i) => {
        if (i !== index) c.isPrimary = false;
      });
    }

    this.saveContacts();
    return true;
  }

  // Remove contact
  removeContact(id: string): boolean {
    const index = this.contacts.findIndex(c => c.id === id);
    if (index === -1) return false;

    this.contacts.splice(index, 1);
    this.saveContacts();
    return true;
  }

  // Get all contacts
  getContacts(): EmergencyContact[] {
    return [...this.contacts];
  }

  // Get primary contact
  getPrimaryContact(): EmergencyContact | null {
    return this.contacts.find(c => c.isPrimary && c.isActive) || null;
  }

  // Get active contacts
  getActiveContacts(): EmergencyContact[] {
    return this.contacts.filter(c => c.isActive);
  }
}

export class LocationService {
  private currentLocation: LocationData | null = null;
  private watchId: number | null = null;

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return null;
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.currentLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now()
          };
          resolve(this.currentLocation);
        },
        (error) => {
          console.error('Location error:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Start watching location
  startLocationWatch(): void {
    if (!navigator.geolocation || this.watchId) return;

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now()
        };
      },
      (error) => {
        console.error('Location watch error:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000 // 1 minute
      }
    );
  }

  // Stop watching location
  stopLocationWatch(): void {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Get cached location
  getCachedLocation(): LocationData | null {
    return this.currentLocation;
  }

  // Get location as Google Maps URL
  getLocationUrl(): string | null {
    if (!this.currentLocation) return null;
    return `https://www.google.com/maps?q=${this.currentLocation.latitude},${this.currentLocation.longitude}`;
  }

  // Get location as text
  async getLocationText(): Promise<string> {
    if (!this.currentLocation) {
      const location = await this.getCurrentLocation();
      if (!location) return 'Location unavailable';
    }

    const { latitude, longitude } = this.currentLocation;
    return `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

export class EmergencyService {
  private contactManager: EmergencyContactManager;
  private locationService: LocationService;

  constructor() {
    this.contactManager = new EmergencyContactManager();
    this.locationService = new LocationService();
  }

  // Call emergency services (911/112)
  async callEmergencyServices(): Promise<boolean> {
    try {
      // Create tel: link for emergency services
      const emergencyNumber = '911'; // US emergency number
      const telUrl = `tel:${emergencyNumber}`;
      
      // Open phone dialer
      window.open(telUrl, '_self');
      return true;
    } catch (error) {
      console.error('Failed to call emergency services:', error);
      return false;
    }
  }

  // Send emergency message to contacts
  async sendEmergencyMessage(message: string): Promise<boolean> {
    try {
      const contacts = this.contactManager.getActiveContacts();
      const location = await this.locationService.getLocationText();
      
      const fullMessage = `${message}\n\nMy location: ${location}\nTime: ${new Date().toLocaleString()}`;
      
      // Create SMS links for each contact
      for (const contact of contacts) {
        const smsUrl = `sms:${contact.phone}?body=${encodeURIComponent(fullMessage)}`;
        window.open(smsUrl, '_blank');
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send emergency messages:', error);
      return false;
    }
  }

  // Send emergency email to contacts
  async sendEmergencyEmail(subject: string, message: string): Promise<boolean> {
    try {
      const contacts = this.contactManager.getActiveContacts();
      const location = await this.locationService.getLocationText();
      
      const fullMessage = `${message}\n\nMy location: ${location}\nTime: ${new Date().toLocaleString()}`;
      
      // Create mailto links for contacts with email
      for (const contact of contacts) {
        if (contact.email) {
          const mailtoUrl = `mailto:${contact.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullMessage)}`;
          window.open(mailtoUrl, '_blank');
        }
      }
      
      return true;
    } catch (error) {
      console.error('Failed to send emergency emails:', error);
      return false;
    }
  }

  // Get emergency contacts
  getContacts(): EmergencyContact[] {
    return this.contactManager.getContacts();
  }

  // Add emergency contact
  addContact(contact: Omit<EmergencyContact, 'id'>): string {
    return this.contactManager.addContact(contact);
  }

  // Update emergency contact
  updateContact(id: string, updates: Partial<EmergencyContact>): boolean {
    return this.contactManager.updateContact(id, updates);
  }

  // Remove emergency contact
  removeContact(id: string): boolean {
    return this.contactManager.removeContact(id);
  }

  // Get current location
  async getCurrentLocation(): Promise<LocationData | null> {
    return await this.locationService.getCurrentLocation();
  }

  // Start location tracking
  startLocationTracking(): void {
    this.locationService.startLocationWatch();
  }

  // Stop location tracking
  stopLocationTracking(): void {
    this.locationService.stopLocationWatch();
  }

  // Get location URL
  getLocationUrl(): string | null {
    return this.locationService.getLocationUrl();
  }
}

// Emergency message templates
export const EMERGENCY_MESSAGES = {
  MEDICAL: "🚨 MEDICAL EMERGENCY: I need immediate medical assistance. Please help!",
  SAFETY: "🚨 SAFETY EMERGENCY: I'm in danger and need help immediately!",
  GENERAL: "🚨 EMERGENCY: I need help right now! Please contact me immediately.",
  FALL: "🚨 FALL DETECTED: I may have fallen and need assistance. Please check on me.",
  PANIC: "🚨 PANIC ATTACK: I'm having a panic attack and need support immediately."
};

// Emergency contact types
export const EMERGENCY_CONTACT_TYPES = {
  FAMILY: 'Family',
  FRIEND: 'Friend',
  NEIGHBOR: 'Neighbor',
  DOCTOR: 'Doctor',
  THERAPIST: 'Therapist',
  OTHER: 'Other'
};

// Emergency Alert System for Direct Personnel Notification
export class EmergencyAlertSystem {
  private emergencyService: EmergencyService;
  private alertHistory: EmergencyAlert[] = [];

  constructor() {
    this.emergencyService = new EmergencyService();
  }

  // Send direct alert to emergency personnel
  async sendDirectEmergencyAlert(alertType: EmergencyAlertType, additionalInfo?: string): Promise<boolean> {
    try {
      const location = await this.emergencyService.getCurrentLocation();
      const timestamp = new Date().toISOString();
      
      const alert: EmergencyAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: alertType,
        timestamp,
        location,
        additionalInfo: additionalInfo || '',
        status: 'sent'
      };

      // Store alert in history
      this.alertHistory.push(alert);
      this.saveAlertHistory();

      // Send alert via multiple channels
      await this.sendAlertToEmergencyServices(alert);
      await this.sendAlertToEmergencyContacts(alert);
      await this.sendAlertToLocalAuthorities(alert);

      return true;
    } catch (error) {
      console.error('Failed to send emergency alert:', error);
      return false;
    }
  }

  // Send alert to emergency services (911/112)
  private async sendAlertToEmergencyServices(alert: EmergencyAlert): Promise<void> {
    try {
      // Call emergency services
      await this.emergencyService.callEmergencyServices();
      
      // Send SMS to emergency services if supported
      const emergencyMessage = this.formatEmergencyMessage(alert);
      const smsUrl = `sms:911?body=${encodeURIComponent(emergencyMessage)}`;
      window.open(smsUrl, '_blank');
      
      console.log('Emergency alert sent to emergency services');
    } catch (error) {
      console.error('Failed to send alert to emergency services:', error);
    }
  }

  // Send alert to emergency contacts
  private async sendAlertToEmergencyContacts(alert: EmergencyAlert): Promise<void> {
    try {
      const message = this.formatEmergencyMessage(alert);
      await this.emergencyService.sendEmergencyMessage(message);
      
      // Send email alert
      await this.emergencyService.sendEmergencyEmail(
        `🚨 EMERGENCY ALERT - ${alert.type.toUpperCase()}`,
        message
      );
      
      console.log('Emergency alert sent to contacts');
    } catch (error) {
      console.error('Failed to send alert to emergency contacts:', error);
    }
  }

  // Send alert to local authorities (police, fire, medical)
  private async sendAlertToLocalAuthorities(alert: EmergencyAlert): Promise<void> {
    try {
      // This would integrate with local emergency services APIs
      // For now, we'll use the emergency services number
      const message = this.formatEmergencyMessage(alert);
      
      // Send to local emergency services
      const emergencyNumbers = this.getLocalEmergencyNumbers();
      for (const number of emergencyNumbers) {
        const smsUrl = `sms:${number}?body=${encodeURIComponent(message)}`;
        window.open(smsUrl, '_blank');
      }
      
      console.log('Emergency alert sent to local authorities');
    } catch (error) {
      console.error('Failed to send alert to local authorities:', error);
    }
  }

  // Format emergency message for alerts
  private formatEmergencyMessage(alert: EmergencyAlert): string {
    const locationText = alert.location 
      ? `Location: ${alert.location.latitude.toFixed(6)}, ${alert.location.longitude.toFixed(6)}`
      : 'Location: Unable to determine';
    
    const mapUrl = alert.location 
      ? `https://www.google.com/maps?q=${alert.location.latitude},${alert.location.longitude}`
      : '';

    return `🚨 EMERGENCY ALERT 🚨

Type: ${alert.type.toUpperCase()}
Time: ${new Date(alert.timestamp).toLocaleString()}
${locationText}
${mapUrl ? `Map: ${mapUrl}` : ''}

${alert.additionalInfo ? `Additional Info: ${alert.additionalInfo}` : ''}

This is an automated emergency alert from Mentor AI. Please respond immediately.

---
Sent via Mentor AI Emergency System`;
  }

  // Get local emergency numbers based on location
  private getLocalEmergencyNumbers(): string[] {
    // Default emergency numbers
    const defaultNumbers = ['911', '112'];
    
    // In a real implementation, this would determine local numbers based on GPS location
    // For now, return default emergency numbers
    return defaultNumbers;
  }

  // Save alert history to localStorage
  private saveAlertHistory(): void {
    try {
      localStorage.setItem('emergency-alert-history', JSON.stringify(this.alertHistory));
    } catch (error) {
      console.error('Failed to save alert history:', error);
    }
  }

  // Load alert history from localStorage
  private loadAlertHistory(): void {
    try {
      const saved = localStorage.getItem('emergency-alert-history');
      if (saved) {
        this.alertHistory = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load alert history:', error);
    }
  }

  // Get alert history
  getAlertHistory(): EmergencyAlert[] {
    return [...this.alertHistory];
  }

  // Clear alert history
  clearAlertHistory(): void {
    this.alertHistory = [];
    localStorage.removeItem('emergency-alert-history');
  }
}

// Emergency Alert Types
export type EmergencyAlertType = 
  | 'medical'
  | 'safety'
  | 'fire'
  | 'police'
  | 'fall'
  | 'panic'
  | 'general';

// Emergency Alert Interface
export interface EmergencyAlert {
  id: string;
  type: EmergencyAlertType;
  timestamp: string;
  location: LocationData | null;
  additionalInfo: string;
  status: 'sent' | 'delivered' | 'failed';
}

// Emergency Alert Templates
export const EMERGENCY_ALERT_TEMPLATES = {
  MEDICAL: {
    type: 'medical' as EmergencyAlertType,
    message: 'Medical emergency requiring immediate assistance',
    priority: 'high'
  },
  SAFETY: {
    type: 'safety' as EmergencyAlertType,
    message: 'Safety threat requiring immediate police response',
    priority: 'high'
  },
  FIRE: {
    type: 'fire' as EmergencyAlertType,
    message: 'Fire emergency requiring immediate fire department response',
    priority: 'critical'
  },
  FALL: {
    type: 'fall' as EmergencyAlertType,
    message: 'Fall detected - may require medical assistance',
    priority: 'medium'
  },
  PANIC: {
    type: 'panic' as EmergencyAlertType,
    message: 'Panic attack or mental health crisis requiring support',
    priority: 'medium'
  },
  GENERAL: {
    type: 'general' as EmergencyAlertType,
    message: 'General emergency requiring assistance',
    priority: 'high'
  }
};
