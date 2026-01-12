import {BUSINESS_SHORT_CODE, PASSKEY} from '../env';
import crypto from 'node:crypto';

/**
 * Generates a timestamp in the format of YEAR+MONTH+DATE+HOUR+MINUTE+SECOND (YYYYMMDDHHMMSS).
 * @returns {string} Timestamp in the specified format.
 * @example generateTimestamp(); // Returns "20230926124530" (for September 26, 2023, 12:45:30)
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear().toString().padStart(4, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const date = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${date}${hours}${minutes}${seconds}`;
}

/**
 * Generate the Lipa Na M-Pesa password by base64-encoding Shortcode + Passkey + Timestamp.
 * Pass the same timestamp used in the request body to avoid mismatches.
 */
export const generatePassword = (timestamp: string): string => {
  const businessShortCode = BUSINESS_SHORT_CODE;
  const passkey = PASSKEY;

  const concatenatedString = `${businessShortCode}${passkey}${timestamp}`;

  // Check if the environment is Node.js
  if (typeof btoa === 'undefined') {
    // Node.js environment
    const encodedString = Buffer.from(concatenatedString).toString('base64');
    return encodedString;
  } else {
    // Browser environment
    const encodedString = btoa(concatenatedString);
    return encodedString;
  }
};

/**
 * Generate SecurityCredential by encrypting the initiator password using the M-Pesa X509 public key certificate.
 * - RSA algorithm
 * - PKCS#1 v1.5 padding (NOT OAEP)
 * Returns base64-encoded ciphertext.
 */
export function generateSecurityCredential(
  initiatorPassword: string,
  mpesaPublicCertPem: string
): string {
  const buffer = Buffer.from(initiatorPassword, 'utf8');
  const encrypted = crypto.publicEncrypt(
    {
      key: mpesaPublicCertPem,
      padding: crypto.constants.RSA_PKCS1_PADDING
    },
    buffer
  );
  return encrypted.toString('base64');
}
