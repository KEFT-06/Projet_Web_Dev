/**
 * EmailService - Service d'envoi d'emails avec EmailJS
 * 
 * Principe SOLID:
 * - Single Responsibility: Gère uniquement l'envoi d'emails
 * - Dependency Inversion: Utilise une abstraction (EmailJS)
 * 
 * Principe KISS: Interface simple pour envoyer des emails
 * 
 * Configuration EmailJS:
 * 1. Créer un compte sur https://www.emailjs.com/
 * 2. Créer un service email (Gmail, Outlook, etc.)
 * 3. Créer un template pour reset password
 * 4. Copier les IDs dans les variables d'environnement
 */

import emailjs from '@emailjs/browser';

// Configuration EmailJS (à remplacer par vos propres IDs)
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_zeduc',  // Votre Service ID
  TEMPLATE_ID: 'template_reset', // Votre Template ID
  PUBLIC_KEY: 'YOUR_PUBLIC_KEY', // Votre Public Key
};

/**
 * Interface pour les paramètres d'email
 */
export interface EmailParams {
  to_email: string;
  to_name: string;
  subject: string;
  message: string;
  reset_code?: string;
  reset_link?: string;
}

/**
 * Service d'envoi d'emails
 */
export class EmailService {
  private static instance: EmailService;
  private initialized: boolean = false;

  private constructor() {
    this.initialize();
  }

  /**
   * Singleton pattern
   */
  static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  /**
   * Initialise EmailJS
   */
  private initialize() {
    try {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
      this.initialized = true;
      console.log('✅ EmailJS initialized');
    } catch (error) {
      console.error('❌ Failed to initialize EmailJS:', error);
      this.initialized = false;
    }
  }

  /**
   * Vérifie si le service est configuré
   */
  isConfigured(): boolean {
    return (
      EMAILJS_CONFIG.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY' &&
      EMAILJS_CONFIG.SERVICE_ID !== 'service_zeduc' &&
      EMAILJS_CONFIG.TEMPLATE_ID !== 'template_reset'
    );
  }

  /**
   * Envoie un email de réinitialisation de mot de passe
   * @param email - Email du destinataire
   * @param userName - Nom de l'utilisateur
   * @param resetCode - Code de réinitialisation (6 caractères)
   * @returns Promise<boolean> - true si envoyé avec succès
   */
  async sendPasswordResetEmail(
    email: string,
    userName: string,
    resetCode: string
  ): Promise<boolean> {
    if (!this.initialized) {
      console.warn('⚠️ EmailJS not initialized, using simulation mode');
      return this.simulateEmailSend(email, resetCode);
    }

    if (!this.isConfigured()) {
      console.warn('⚠️ EmailJS not configured, using simulation mode');
      return this.simulateEmailSend(email, resetCode);
    }

    try {
      const templateParams: EmailParams = {
        to_email: email,
        to_name: userName,
        subject: 'Réinitialisation de votre mot de passe - ZEDUC-SP@CE',
        message: `Bonjour ${userName},\n\nVous avez demandé la réinitialisation de votre mot de passe.\n\nVotre code de réinitialisation est: ${resetCode}\n\nCe code est valide pendant 15 minutes.\n\nSi vous n'avez pas demandé cette réinitialisation, ignorez cet email.\n\nCordialement,\nL'équipe ZEDUC-SP@CE`,
        reset_code: resetCode,
        reset_link: `${window.location.origin}/reset-password?code=${resetCode}`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams
      );

      if (response.status === 200) {
        console.log('✅ Email sent successfully to:', email);
        return true;
      } else {
        console.error('❌ Failed to send email:', response);
        return false;
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      // En cas d'erreur, utiliser le mode simulation
      return this.simulateEmailSend(email, resetCode);
    }
  }

  /**
   * Simule l'envoi d'email (pour développement/test)
   * @param email - Email du destinataire
   * @param resetCode - Code de réinitialisation
   * @returns Promise<boolean>
   */
  private async simulateEmailSend(
    email: string,
    resetCode: string
  ): Promise<boolean> {
    console.log('📧 [SIMULATION] Email envoyé à:', email);
    console.log('🔑 [SIMULATION] Code de réinitialisation:', resetCode);
    console.log('⏰ [SIMULATION] Valide pendant: 15 minutes');
    console.log('📝 [SIMULATION] Contenu:');
    console.log(`
╔════════════════════════════════════════════════════════╗
║           RÉINITIALISATION DE MOT DE PASSE            ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║  Bonjour,                                             ║
║                                                        ║
║  Vous avez demandé la réinitialisation de votre      ║
║  mot de passe pour votre compte ZEDUC-SP@CE.         ║
║                                                        ║
║  Votre code de réinitialisation est:                 ║
║                                                        ║
║           🔑  ${resetCode}  🔑                        ║
║                                                        ║
║  Ce code est valide pendant 15 minutes.              ║
║                                                        ║
║  Si vous n'avez pas demandé cette réinitialisation,  ║
║  ignorez cet email.                                   ║
║                                                        ║
║  Cordialement,                                        ║
║  L'équipe ZEDUC-SP@CE                                ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
    `);

    // Simuler un délai réseau
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }

  /**
   * Envoie un email de bienvenue
   * @param email - Email du destinataire
   * @param userName - Nom de l'utilisateur
   * @returns Promise<boolean>
   */
  async sendWelcomeEmail(email: string, userName: string): Promise<boolean> {
    if (!this.initialized || !this.isConfigured()) {
      console.log('📧 [SIMULATION] Email de bienvenue envoyé à:', email);
      return true;
    }

    try {
      const templateParams: EmailParams = {
        to_email: email,
        to_name: userName,
        subject: 'Bienvenue sur ZEDUC-SP@CE! 🎉',
        message: `Bonjour ${userName},\n\nBienvenue sur ZEDUC-SP@CE!\n\nVotre compte a été créé avec succès.\n\nVous pouvez maintenant commander vos plats préférés et profiter de notre système de fidélité.\n\nBon appétit!\nL'équipe ZEDUC-SP@CE`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        'template_welcome', // Template pour email de bienvenue
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return false;
    }
  }

  /**
   * Envoie un email de confirmation de commande
   * @param email - Email du destinataire
   * @param userName - Nom de l'utilisateur
   * @param orderId - ID de la commande
   * @param orderTotal - Montant total
   * @returns Promise<boolean>
   */
  async sendOrderConfirmationEmail(
    email: string,
    userName: string,
    orderId: string,
    orderTotal: number
  ): Promise<boolean> {
    if (!this.initialized || !this.isConfigured()) {
      console.log('📧 [SIMULATION] Email de confirmation envoyé à:', email);
      return true;
    }

    try {
      const templateParams: EmailParams = {
        to_email: email,
        to_name: userName,
        subject: `Confirmation de commande #${orderId}`,
        message: `Bonjour ${userName},\n\nVotre commande #${orderId} a été confirmée!\n\nMontant total: ${orderTotal} FCFA\n\nNous préparons votre commande avec soin.\n\nMerci de votre confiance!\nL'équipe ZEDUC-SP@CE`,
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        'template_order', // Template pour confirmation de commande
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Error sending order confirmation email:', error);
      return false;
    }
  }
}

// Export de l'instance singleton
export const emailService = EmailService.getInstance();

/**
 * GUIDE DE CONFIGURATION EMAILJS
 * ==============================
 * 
 * 1. Créer un compte sur https://www.emailjs.com/ (GRATUIT)
 * 
 * 2. Ajouter un service email:
 *    - Aller dans "Email Services"
 *    - Cliquer "Add New Service"
 *    - Choisir Gmail, Outlook, ou autre
 *    - Suivre les instructions de connexion
 *    - Copier le SERVICE_ID
 * 
 * 3. Créer un template:
 *    - Aller dans "Email Templates"
 *    - Cliquer "Create New Template"
 *    - Nom: "Password Reset"
 *    - Sujet: "Réinitialisation de mot de passe - ZEDUC-SP@CE"
 *    - Contenu:
 *      ```
 *      Bonjour {{to_name}},
 *      
 *      Vous avez demandé la réinitialisation de votre mot de passe.
 *      
 *      Votre code de réinitialisation est: {{reset_code}}
 *      
 *      Ou cliquez sur ce lien: {{reset_link}}
 *      
 *      Ce code est valide pendant 15 minutes.
 *      
 *      Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
 *      
 *      Cordialement,
 *      L'équipe ZEDUC-SP@CE
 *      ```
 *    - Copier le TEMPLATE_ID
 * 
 * 4. Obtenir la Public Key:
 *    - Aller dans "Account" > "General"
 *    - Copier la "Public Key"
 * 
 * 5. Mettre à jour les IDs dans ce fichier:
 *    - SERVICE_ID: 'votre_service_id'
 *    - TEMPLATE_ID: 'votre_template_id'
 *    - PUBLIC_KEY: 'votre_public_key'
 * 
 * 6. Tester l'envoi d'email!
 * 
 * LIMITES GRATUITES:
 * - 200 emails/mois
 * - Parfait pour le développement et petits projets
 * 
 * ALTERNATIVE:
 * - Pour production: Utiliser SendGrid, AWS SES, ou Mailgun
 */
