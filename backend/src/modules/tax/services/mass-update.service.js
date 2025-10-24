/**
 * Servicio de Actualización Masiva Tributaria
 * Gestiona actualizaciones masivas de valores catastrales, alícuotas y generación de facturas
 */

import prisma from '../../../config/database.js';

class MassUpdateService {
  /**
   * Actualiza valores catastrales aplicando un índice de inflación
   * @param {Object} params - Parámetros de actualización
   * @param {number} params.inflationRate - Tasa de inflación (ej: 15.5 para 15.5%)
   * @param {string} params.zoneCode - Código de zona (opcional, para actualizar solo una zona)
   * @param {string} params.propertyUse - Uso del inmueble (opcional)
   * @param {boolean} params.dryRun - Si es true, solo simula sin aplicar cambios
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateCadastralValues({ inflationRate, zoneCode, propertyUse, dryRun = false }) {
    try {
      const multiplier = 1 + (inflationRate / 100);

      // Construir filtros
      const where = {
        status: 'ACTIVE',
      };

      if (zoneCode) {
        where.zoneCode = zoneCode;
      }

      if (propertyUse) {
        where.propertyUse = propertyUse;
      }

      // Obtener propiedades a actualizar
      const properties = await prisma.property.findMany({
        where,
        select: {
          id: true,
          cadastralCode: true,
          address: true,
          landValue: true,
          buildingValue: true,
          totalValue: true,
        },
      });

      if (dryRun) {
        // Modo simulación: calcular sin aplicar
        const simulation = properties.map(prop => ({
          cadastralCode: prop.cadastralCode,
          address: prop.address,
          currentLandValue: Number(prop.landValue),
          newLandValue: Number(prop.landValue) * multiplier,
          currentBuildingValue: Number(prop.buildingValue),
          newBuildingValue: Number(prop.buildingValue) * multiplier,
          currentTotalValue: Number(prop.totalValue),
          newTotalValue: Number(prop.totalValue) * multiplier,
          increase: Number(prop.totalValue) * (multiplier - 1),
        }));

        const totalIncrease = simulation.reduce((sum, item) => sum + item.increase, 0);

        return {
          success: true,
          dryRun: true,
          propertiesAffected: properties.length,
          inflationRate,
          totalIncrease,
          simulation,
        };
      }

      // Aplicar actualización real
      const updates = [];
      for (const property of properties) {
        const newLandValue = Number(property.landValue) * multiplier;
        const newBuildingValue = Number(property.buildingValue) * multiplier;
        const newTotalValue = Number(property.totalValue) * multiplier;

        const updated = await prisma.property.update({
          where: { id: property.id },
          data: {
            landValue: newLandValue,
            buildingValue: newBuildingValue,
            totalValue: newTotalValue,
          },
        });

        updates.push({
          cadastralCode: property.cadastralCode,
          oldValue: Number(property.totalValue),
          newValue: Number(updated.totalValue),
        });
      }

      console.log(`✅ Updated ${updates.length} properties with ${inflationRate}% inflation rate`);

      return {
        success: true,
        dryRun: false,
        propertiesAffected: updates.length,
        inflationRate,
        updates,
      };
    } catch (error) {
      console.error('Error in mass cadastral value update:', error);
      throw error;
    }
  }

  /**
   * Actualiza alícuotas (tasas impositivas) masivamente
   * @param {Object} params - Parámetros de actualización
   * @param {string} params.taxType - Tipo de impuesto (PROPERTY, BUSINESS, VEHICLE)
   * @param {number} params.newRate - Nueva alícuota
   * @param {string} params.category - Categoría específica (opcional)
   * @param {boolean} params.dryRun - Modo simulación
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async updateTaxRates({ taxType, newRate, category, dryRun = false }) {
    try {
      let model, where;

      switch (taxType) {
        case 'PROPERTY':
          model = prisma.property;
          where = { status: 'ACTIVE' };
          if (category) where.propertyUse = category;
          break;
        case 'BUSINESS':
          model = prisma.business;
          where = { status: 'ACTIVE' };
          if (category) where.category = category;
          break;
        case 'VEHICLE':
          model = prisma.vehicle;
          where = { status: 'ACTIVE' };
          if (category) where.vehicleType = category;
          break;
        default:
          throw new Error('Invalid tax type');
      }

      const items = await model.findMany({ where });

      if (dryRun) {
        return {
          success: true,
          dryRun: true,
          itemsAffected: items.length,
          taxType,
          newRate,
          category,
        };
      }

      // Aplicar actualización
      const result = await model.updateMany({
        where,
        data: { taxRate: newRate },
      });

      console.log(`✅ Updated ${result.count} ${taxType} tax rates to ${newRate}%`);

      return {
        success: true,
        dryRun: false,
        itemsAffected: result.count,
        taxType,
        newRate,
        category,
      };
    } catch (error) {
      console.error('Error in mass tax rate update:', error);
      throw error;
    }
  }

  /**
   * Genera facturas anuales masivamente
   * @param {Object} params - Parámetros de generación
   * @param {number} params.fiscalYear - Año fiscal
   * @param {string} params.taxType - Tipo de impuesto
   * @param {boolean} params.dryRun - Modo simulación
   * @returns {Promise<Object>} Resultado de la generación
   */
  async generateAnnualBills({ fiscalYear, taxType, dryRun = false }) {
    try {
      let items, billData;
      const currentYear = new Date().getFullYear();
      const year = fiscalYear || currentYear;

      // Verificar que no existan facturas ya generadas para este año
      const existingBills = await prisma.taxBill.count({
        where: {
          fiscalYear: year,
          taxType,
        },
      });

      if (existingBills > 0 && !dryRun) {
        throw new Error(`Bills already exist for ${taxType} in year ${year}`);
      }

      switch (taxType) {
        case 'PROPERTY_TAX':
          items = await prisma.property.findMany({
            where: { status: 'ACTIVE' },
            include: { taxpayer: true },
          });
          break;
        case 'BUSINESS_TAX':
          items = await prisma.business.findMany({
            where: { status: 'ACTIVE' },
            include: { taxpayer: true },
          });
          break;
        case 'VEHICLE_TAX':
          items = await prisma.vehicle.findMany({
            where: { status: 'ACTIVE' },
            include: { taxpayer: true },
          });
          break;
        default:
          throw new Error('Invalid tax type for annual bills');
      }

      if (dryRun) {
        const totalAmount = items.reduce((sum, item) => {
          const baseAmount = Number(item.totalValue || item.assessedValue || item.annualIncome || 0);
          const taxAmount = baseAmount * Number(item.taxRate);
          return sum + taxAmount;
        }, 0);

        return {
          success: true,
          dryRun: true,
          billsToGenerate: items.length,
          fiscalYear: year,
          taxType,
          estimatedTotalAmount: totalAmount,
        };
      }

      // Generar facturas reales
      const bills = [];
      let billCounter = 1;

      for (const item of items) {
        const baseAmount = Number(item.totalValue || item.assessedValue || item.annualIncome || 0);
        const taxRate = Number(item.taxRate);
        const taxAmount = baseAmount * taxRate;
        const totalAmount = taxAmount;

        // Determinar fecha de vencimiento según el tipo
        const dueDate = new Date(year, this.getDueMonth(taxType), 1);

        const billNumber = `${taxType.substring(0, 3)}-${year}-${String(billCounter).padStart(6, '0')}`;

        const billDataObj = {
          billNumber,
          taxpayerId: item.taxpayerId,
          taxType,
          fiscalYear: year,
          fiscalPeriod: 'ANUAL',
          baseAmount,
          taxRate,
          taxAmount,
          totalAmount,
          balanceAmount: totalAmount,
          issueDate: new Date(),
          dueDate,
          status: 'PENDING',
          concept: this.getTaxConcept(taxType, item),
        };

        // Agregar referencia al objeto tributario
        if (taxType === 'PROPERTY_TAX') {
          billDataObj.propertyId = item.id;
        } else if (taxType === 'BUSINESS_TAX') {
          billDataObj.businessId = item.id;
        } else if (taxType === 'VEHICLE_TAX') {
          billDataObj.vehicleId = item.id;
        }

        const bill = await prisma.taxBill.create({
          data: billDataObj,
        });

        bills.push(bill);
        billCounter++;
      }

      const totalAmount = bills.reduce((sum, bill) => sum + Number(bill.totalAmount), 0);

      console.log(`✅ Generated ${bills.length} ${taxType} bills for year ${year}`);

      return {
        success: true,
        dryRun: false,
        billsGenerated: bills.length,
        fiscalYear: year,
        taxType,
        totalAmount,
        bills: bills.slice(0, 10), // Retornar solo las primeras 10 como muestra
      };
    } catch (error) {
      console.error('Error in mass bill generation:', error);
      throw error;
    }
  }

  /**
   * Obtiene el mes de vencimiento según el tipo de impuesto
   * @param {string} taxType - Tipo de impuesto
   * @returns {number} Mes (0-11)
   */
  getDueMonth(taxType) {
    const dueDates = {
      PROPERTY_TAX: 6, // Julio
      BUSINESS_TAX: 5, // Junio
      VEHICLE_TAX: 7,  // Agosto
    };
    return dueDates[taxType] || 11; // Diciembre por defecto
  }

  /**
   * Genera el concepto de la factura
   * @param {string} taxType - Tipo de impuesto
   * @param {Object} item - Item tributario
   * @returns {string} Concepto
   */
  getTaxConcept(taxType, item) {
    switch (taxType) {
      case 'PROPERTY_TAX':
        return `Impuesto sobre Inmuebles Urbanos - ${item.cadastralCode}`;
      case 'BUSINESS_TAX':
        return `Impuesto sobre Actividades Económicas - ${item.businessName}`;
      case 'VEHICLE_TAX':
        return `Impuesto sobre Vehículos - Placa ${item.plate}`;
      default:
        return 'Impuesto Municipal';
    }
  }

  /**
   * Aplica descuentos por pronto pago masivamente
   * @param {Object} params - Parámetros
   * @param {number} params.discountPercent - Porcentaje de descuento
   * @param {Date} params.validUntil - Válido hasta
   * @param {string} params.taxType - Tipo de impuesto (opcional)
   * @param {boolean} params.dryRun - Modo simulación
   * @returns {Promise<Object>} Resultado
   */
  async applyEarlyPaymentDiscount({ discountPercent, validUntil, taxType, dryRun = false }) {
    try {
      const where = {
        status: 'PENDING',
        dueDate: { gte: validUntil },
      };

      if (taxType) {
        where.taxType = taxType;
      }

      const bills = await prisma.taxBill.findMany({ where });

      if (dryRun) {
        const totalDiscount = bills.reduce((sum, bill) => {
          return sum + (Number(bill.totalAmount) * discountPercent / 100);
        }, 0);

        return {
          success: true,
          dryRun: true,
          billsAffected: bills.length,
          discountPercent,
          totalDiscount,
        };
      }

      // Aplicar descuentos
      const updates = [];
      for (const bill of bills) {
        const discountAmount = Number(bill.totalAmount) * (discountPercent / 100);
        const newTotal = Number(bill.totalAmount) - discountAmount;

        const updated = await prisma.taxBill.update({
          where: { id: bill.id },
          data: {
            discounts: discountAmount,
            totalAmount: newTotal,
            balanceAmount: newTotal,
          },
        });

        updates.push(updated);
      }

      console.log(`✅ Applied ${discountPercent}% discount to ${updates.length} bills`);

      return {
        success: true,
        dryRun: false,
        billsAffected: updates.length,
        discountPercent,
        totalDiscount: updates.reduce((sum, bill) => sum + Number(bill.discounts), 0),
      };
    } catch (error) {
      console.error('Error applying early payment discount:', error);
      throw error;
    }
  }
}

export default new MassUpdateService();
