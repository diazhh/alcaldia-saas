/**
 * Plantillas de Email para el Módulo Tributario
 */

/**
 * Plantilla base para emails
 */
const baseTemplate = (content, title = 'Alcaldía Municipal') => `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #2563eb;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9fafb;
      padding: 30px;
      border: 1px solid #e5e7eb;
    }
    .footer {
      background-color: #f3f4f6;
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #6b7280;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #2563eb;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      margin: 20px 0;
    }
    .alert {
      padding: 15px;
      margin: 20px 0;
      border-radius: 6px;
    }
    .alert-info {
      background-color: #dbeafe;
      border-left: 4px solid #2563eb;
    }
    .alert-warning {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
    }
    .alert-danger {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th {
      background-color: #f3f4f6;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Alcaldía Municipal</h1>
    <p>Dirección de Hacienda Municipal</p>
  </div>
  <div class="content">
    ${content}
  </div>
  <div class="footer">
    <p>Este es un correo automático, por favor no responder.</p>
    <p>Alcaldía Municipal - Sistema de Gestión Tributaria</p>
    <p>Para más información, contacte a: tributacion@municipal.gob.ve</p>
  </div>
</body>
</html>
`;

/**
 * Recordatorio amigable de pago próximo a vencer
 */
export const friendlyReminderTemplate = (data) => {
  const { taxpayerName, taxId, bills, daysUntilDue } = data;
  
  const billsTable = bills.map(bill => `
    <tr>
      <td>${bill.billNumber}</td>
      <td>${bill.concept}</td>
      <td>${new Date(bill.dueDate).toLocaleDateString('es-VE')}</td>
      <td style="text-align: right;">Bs. ${Number(bill.totalAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  const content = `
    <h2>Recordatorio de Pago</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Le recordamos que tiene facturas tributarias próximas a vencer en <strong>${daysUntilDue} días</strong>.</p>
    
    <div class="alert alert-info">
      <strong>RIF/CI:</strong> ${taxId}
    </div>

    <h3>Facturas Pendientes:</h3>
    <table>
      <thead>
        <tr>
          <th>Factura</th>
          <th>Concepto</th>
          <th>Vencimiento</th>
          <th>Monto</th>
        </tr>
      </thead>
      <tbody>
        ${billsTable}
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3" style="text-align: right;">Total:</th>
          <th style="text-align: right;">Bs. ${totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</th>
        </tr>
      </tfoot>
    </table>

    <p>Puede realizar su pago a través de:</p>
    <ul>
      <li>Portal web: <a href="${process.env.FRONTEND_URL}/tributario/pagos">www.municipal.gob.ve/pagos</a></li>
      <li>Taquillas municipales</li>
      <li>Transferencia bancaria</li>
      <li>Pago móvil</li>
    </ul>

    <p>Evite recargos e intereses moratorios pagando antes de la fecha de vencimiento.</p>
    <p>Gracias por su puntualidad.</p>
  `;

  return baseTemplate(content, 'Recordatorio de Pago - Alcaldía Municipal');
};

/**
 * Aviso de mora (factura vencida)
 */
export const overdueNoticeTemplate = (data) => {
  const { taxpayerName, taxId, bills, daysOverdue } = data;
  
  const billsTable = bills.map(bill => `
    <tr>
      <td>${bill.billNumber}</td>
      <td>${bill.concept}</td>
      <td>${new Date(bill.dueDate).toLocaleDateString('es-VE')}</td>
      <td style="text-align: right;">Bs. ${Number(bill.totalAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</td>
    </tr>
  `).join('');

  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  const content = `
    <h2>Aviso de Mora</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Le informamos que tiene facturas tributarias <strong>vencidas hace ${daysOverdue} días</strong>.</p>
    
    <div class="alert alert-warning">
      <strong>⚠️ IMPORTANTE:</strong> Su cuenta presenta morosidad.<br>
      <strong>RIF/CI:</strong> ${taxId}
    </div>

    <h3>Facturas Vencidas:</h3>
    <table>
      <thead>
        <tr>
          <th>Factura</th>
          <th>Concepto</th>
          <th>Vencimiento</th>
          <th>Monto</th>
        </tr>
      </thead>
      <tbody>
        ${billsTable}
      </tbody>
      <tfoot>
        <tr>
          <th colspan="3" style="text-align: right;">Total Adeudado:</th>
          <th style="text-align: right;">Bs. ${totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}</th>
        </tr>
      </tfoot>
    </table>

    <div class="alert alert-warning">
      <p><strong>Consecuencias de la mora:</strong></p>
      <ul>
        <li>Aplicación de intereses moratorios</li>
        <li>Imposibilidad de obtener solvencias municipales</li>
        <li>Restricciones para trámites municipales</li>
      </ul>
    </div>

    <p><strong>Le instamos a regularizar su situación a la brevedad posible.</strong></p>
    
    <p>Formas de pago:</p>
    <ul>
      <li>Portal web: <a href="${process.env.FRONTEND_URL}/tributario/pagos">www.municipal.gob.ve/pagos</a></li>
      <li>Taquillas municipales (Lunes a Viernes, 8:00 AM - 3:00 PM)</li>
      <li>Transferencia bancaria</li>
      <li>Pago móvil</li>
    </ul>

    <p>Si ya realizó el pago, por favor ignore este mensaje.</p>
  `;

  return baseTemplate(content, 'Aviso de Mora - Alcaldía Municipal');
};

/**
 * Intimación formal
 */
export const formalIntimationTemplate = (data) => {
  const { taxpayerName, taxId, bills, daysOverdue, caseNumber } = data;
  
  const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

  const content = `
    <h2>Intimación Formal de Pago</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    
    <div class="alert alert-danger">
      <strong>⚠️ INTIMACIÓN FORMAL</strong><br>
      <strong>Caso N°:</strong> ${caseNumber}<br>
      <strong>RIF/CI:</strong> ${taxId}<br>
      <strong>Días de mora:</strong> ${daysOverdue} días
    </div>

    <p>Por medio de la presente, se le intima formalmente al pago de las obligaciones tributarias vencidas, las cuales ascienden a:</p>

    <div style="text-align: center; font-size: 24px; font-weight: bold; margin: 30px 0; color: #ef4444;">
      Bs. ${totalAmount.toLocaleString('es-VE', { minimumFractionDigits: 2 })}
    </div>

    <div class="alert alert-danger">
      <p><strong>ADVERTENCIA LEGAL:</strong></p>
      <p>De no regularizar su situación en un plazo de <strong>15 días hábiles</strong> a partir de la recepción de esta notificación, se procederá a:</p>
      <ul>
        <li>Inicio de procedimientos administrativos de cobro coactivo</li>
        <li>Aplicación de multas e intereses moratorios</li>
        <li>Inclusión en el registro de morosos municipales</li>
        <li>Posibles acciones legales según lo establecido en la ordenanza municipal</li>
      </ul>
    </div>

    <h3>Opciones de Pago:</h3>
    <p>Puede regularizar su situación mediante:</p>
    <ol>
      <li><strong>Pago total inmediato</strong> de la deuda</li>
      <li><strong>Convenio de pago</strong> (plan de cuotas) - Solicítelo en nuestras oficinas</li>
    </ol>

    <p><strong>Contacto para convenios de pago:</strong></p>
    <ul>
      <li>Teléfono: (0212) 555-1234</li>
      <li>Email: cobranza@municipal.gob.ve</li>
      <li>Horario: Lunes a Viernes, 8:00 AM - 3:00 PM</li>
    </ul>

    <p>Esta es una notificación oficial de la Dirección de Hacienda Municipal.</p>
  `;

  return baseTemplate(content, 'Intimación Formal - Alcaldía Municipal');
};

/**
 * Confirmación de pago recibido
 */
export const paymentConfirmationTemplate = (data) => {
  const { taxpayerName, taxId, payment, bill } = data;

  const content = `
    <h2>Confirmación de Pago Recibido</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Hemos recibido su pago satisfactoriamente.</p>
    
    <div class="alert alert-info">
      <strong>✓ Pago Procesado Exitosamente</strong>
    </div>

    <h3>Detalles del Pago:</h3>
    <table>
      <tr>
        <th>Recibo N°:</th>
        <td>${payment.receiptNumber}</td>
      </tr>
      <tr>
        <th>RIF/CI:</th>
        <td>${taxId}</td>
      </tr>
      <tr>
        <th>Fecha de Pago:</th>
        <td>${new Date(payment.paymentDate).toLocaleDateString('es-VE')}</td>
      </tr>
      <tr>
        <th>Método de Pago:</th>
        <td>${payment.paymentMethod}</td>
      </tr>
      <tr>
        <th>Monto Pagado:</th>
        <td><strong>Bs. ${Number(payment.amount).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong></td>
      </tr>
      ${payment.referenceNumber ? `
      <tr>
        <th>Referencia:</th>
        <td>${payment.referenceNumber}</td>
      </tr>
      ` : ''}
    </table>

    ${bill ? `
    <h3>Factura Pagada:</h3>
    <table>
      <tr>
        <th>Factura N°:</th>
        <td>${bill.billNumber}</td>
      </tr>
      <tr>
        <th>Concepto:</th>
        <td>${bill.concept}</td>
      </tr>
      <tr>
        <th>Período:</th>
        <td>${bill.fiscalYear} - ${bill.fiscalPeriod || 'Anual'}</td>
      </tr>
    </table>
    ` : ''}

    <p>Puede descargar su recibo de pago desde el portal web:</p>
    <a href="${process.env.FRONTEND_URL}/tributario/pagos/${payment.id}" class="button">
      Descargar Recibo
    </a>

    <p>Gracias por cumplir con sus obligaciones tributarias.</p>
  `;

  return baseTemplate(content, 'Confirmación de Pago - Alcaldía Municipal');
};

/**
 * Notificación de solvencia emitida
 */
export const solvencyIssuedTemplate = (data) => {
  const { taxpayerName, taxId, solvency } = data;

  const content = `
    <h2>Solvencia Municipal Emitida</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Su solvencia municipal ha sido emitida exitosamente.</p>
    
    <div class="alert alert-info">
      <strong>✓ Solvencia Aprobada</strong>
    </div>

    <h3>Detalles de la Solvencia:</h3>
    <table>
      <tr>
        <th>Solvencia N°:</th>
        <td>${solvency.solvencyNumber}</td>
      </tr>
      <tr>
        <th>RIF/CI:</th>
        <td>${taxId}</td>
      </tr>
      <tr>
        <th>Tipo:</th>
        <td>${solvency.solvencyType}</td>
      </tr>
      <tr>
        <th>Fecha de Emisión:</th>
        <td>${new Date(solvency.issueDate).toLocaleDateString('es-VE')}</td>
      </tr>
      <tr>
        <th>Fecha de Vencimiento:</th>
        <td>${new Date(solvency.expiryDate).toLocaleDateString('es-VE')}</td>
      </tr>
      <tr>
        <th>Código QR:</th>
        <td>${solvency.qrCode}</td>
      </tr>
    </table>

    <p>Puede descargar su certificado de solvencia desde el portal web:</p>
    <a href="${process.env.FRONTEND_URL}/tributario/solvencias/${solvency.id}" class="button">
      Descargar Solvencia
    </a>

    <p><strong>Nota:</strong> Esta solvencia tiene una vigencia de 90 días. Puede verificar su autenticidad escaneando el código QR.</p>
  `;

  return baseTemplate(content, 'Solvencia Emitida - Alcaldía Municipal');
};

/**
 * Notificación de convenio de pago aprobado
 */
export const paymentPlanApprovedTemplate = (data) => {
  const { taxpayerName, taxId, totalDebt, installments, monthlyPayment, firstPaymentDate } = data;

  const content = `
    <h2>Convenio de Pago Aprobado</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Su solicitud de convenio de pago ha sido <strong>aprobada</strong>.</p>
    
    <div class="alert alert-info">
      <strong>✓ Convenio Aprobado</strong><br>
      <strong>RIF/CI:</strong> ${taxId}
    </div>

    <h3>Detalles del Convenio:</h3>
    <table>
      <tr>
        <th>Deuda Total:</th>
        <td><strong>Bs. ${Number(totalDebt).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong></td>
      </tr>
      <tr>
        <th>Número de Cuotas:</th>
        <td>${installments} cuotas mensuales</td>
      </tr>
      <tr>
        <th>Pago Mensual:</th>
        <td><strong>Bs. ${Number(monthlyPayment).toLocaleString('es-VE', { minimumFractionDigits: 2 })}</strong></td>
      </tr>
      <tr>
        <th>Primera Cuota:</th>
        <td>${new Date(firstPaymentDate).toLocaleDateString('es-VE')}</td>
      </tr>
    </table>

    <div class="alert alert-warning">
      <p><strong>Condiciones del Convenio:</strong></p>
      <ul>
        <li>Los pagos deben realizarse puntualmente cada mes</li>
        <li>El incumplimiento de 2 cuotas consecutivas anula el convenio</li>
        <li>Una vez anulado, se procederá a cobro coactivo</li>
        <li>No se emitirán solvencias hasta completar el pago total</li>
      </ul>
    </div>

    <p>Puede consultar el estado de su convenio en el portal web.</p>
    <p>Gracias por su compromiso de regularizar su situación tributaria.</p>
  `;

  return baseTemplate(content, 'Convenio de Pago Aprobado - Alcaldía Municipal');
};

/**
 * Recordatorio de renovación de licencia comercial
 */
export const licenseRenewalReminderTemplate = (data) => {
  const { taxpayerName, taxId, business, daysUntilExpiry } = data;

  const content = `
    <h2>Recordatorio de Renovación de Licencia</h2>
    <p>Estimado(a) <strong>${taxpayerName}</strong>,</p>
    <p>Le recordamos que su licencia comercial está próxima a vencer en <strong>${daysUntilExpiry} días</strong>.</p>
    
    <div class="alert alert-warning">
      <strong>⚠️ Licencia Próxima a Vencer</strong>
    </div>

    <h3>Detalles de la Licencia:</h3>
    <table>
      <tr>
        <th>Licencia N°:</th>
        <td>${business.licenseNumber}</td>
      </tr>
      <tr>
        <th>Negocio:</th>
        <td>${business.businessName}</td>
      </tr>
      <tr>
        <th>RIF/CI:</th>
        <td>${taxId}</td>
      </tr>
      <tr>
        <th>Actividad:</th>
        <td>${business.activityName}</td>
      </tr>
      <tr>
        <th>Fecha de Vencimiento:</th>
        <td><strong>${new Date(business.expiryDate).toLocaleDateString('es-VE')}</strong></td>
      </tr>
    </table>

    <p><strong>Para renovar su licencia debe:</strong></p>
    <ol>
      <li>Estar solvente con sus obligaciones tributarias</li>
      <li>Presentar documentación actualizada</li>
      <li>Pagar la tasa de renovación correspondiente</li>
    </ol>

    <p>Puede iniciar el proceso de renovación en línea:</p>
    <a href="${process.env.FRONTEND_URL}/tributario/patentes/${business.id}/renovar" class="button">
      Renovar Licencia
    </a>

    <p><strong>Importante:</strong> Operar sin licencia vigente puede resultar en sanciones y multas.</p>
  `;

  return baseTemplate(content, 'Renovación de Licencia - Alcaldía Municipal');
};

export default {
  friendlyReminderTemplate,
  overdueNoticeTemplate,
  formalIntimationTemplate,
  paymentConfirmationTemplate,
  solvencyIssuedTemplate,
  paymentPlanApprovedTemplate,
  licenseRenewalReminderTemplate,
};
