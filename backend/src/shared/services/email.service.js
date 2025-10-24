/**
 * Servicio de Email
 * Gestiona el envío de correos electrónicos del sistema
 */

import nodemailer from 'nodemailer';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Inicializa el transportador de email
   */
  initialize() {
    const emailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    // Si no hay configuración SMTP, usar modo test (ethereal)
    if (!process.env.SMTP_USER) {
      console.warn('⚠️  No SMTP configuration found. Emails will be logged to console only.');
      this.transporter = null;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport(emailConfig);
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Error initializing email service:', error.message);
      this.transporter = null;
    }
  }

  /**
   * Envía un email
   * @param {Object} options - Opciones del email
   * @param {string} options.to - Destinatario
   * @param {string} options.subject - Asunto
   * @param {string} options.html - Contenido HTML
   * @param {string} options.text - Contenido texto plano
   * @param {string} options.from - Remitente (opcional)
   * @returns {Promise<Object>} Resultado del envío
   */
  async sendEmail({ to, subject, html, text, from }) {
    const fromAddress = from || process.env.SMTP_FROM || 'noreply@municipal.gob.ve';

    const mailOptions = {
      from: fromAddress,
      to,
      subject,
      html,
      text: text || this.htmlToText(html),
    };

    // Si no hay transporter configurado, solo loguear
    if (!this.transporter) {
      console.log('📧 [EMAIL SIMULATION]');
      console.log(`To: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`From: ${fromAddress}`);
      console.log('---');
      return { success: true, messageId: 'simulated-' + Date.now(), simulated: true };
    }

    try {
      const info = await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error(`❌ Error sending email to ${to}:`, error.message);
      throw error;
    }
  }

  /**
   * Convierte HTML simple a texto plano
   * @param {string} html - Contenido HTML
   * @returns {string} Texto plano
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
  }

  /**
   * Verifica la conexión con el servidor SMTP
   * @returns {Promise<boolean>}
   */
  async verifyConnection() {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('❌ SMTP connection error:', error.message);
      return false;
    }
  }
}

// Exportar instancia singleton
export default new EmailService();
