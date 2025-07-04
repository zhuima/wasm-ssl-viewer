export type SSLCertificate = {
  id: string;
  domain: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
  daysRemaining: number;
  fingerprint: string;
  serialNumber: string;
}; 