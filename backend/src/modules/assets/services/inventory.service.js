/**
 * Servicio para gestión de inventario de almacén
 */

import prisma from '../../../config/database.js';

// ============================================
// ITEMS DE INVENTARIO
// ============================================

/**
 * Genera el siguiente código de item
 * @returns {Promise<string>} Código generado
 */
async function generateItemCode() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const lastItem = await prisma.inventoryItem.findFirst({
    where: {
      code: {
        startsWith: prefix
      }
    },
    orderBy: {
      code: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastItem) {
    const lastNumber = parseInt(lastItem.code.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Obtiene todos los items con filtros
 * @param {Object} filters - Filtros de búsqueda
 * @returns {Promise<Object>} Lista de items
 */
async function getAllItems(filters = {}) {
  const { category, search, lowStock, page = 1, limit = 50 } = filters;
  
  const where = { isActive: true };
  
  if (category) where.category = category;
  
  if (search) {
    where.OR = [
      { code: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (lowStock === 'true') {
    where.currentStock = { lte: prisma.raw('min_stock') };
  }
  
  const skip = (page - 1) * limit;
  
  const [items, total] = await Promise.all([
    prisma.inventoryItem.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { name: 'asc' },
    }),
    prisma.inventoryItem.count({ where }),
  ]);
  
  return {
    items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene un item por ID
 * @param {string} id - ID del item
 * @returns {Promise<Object>} Item encontrado
 */
async function getItemById(id) {
  const item = await prisma.inventoryItem.findUnique({
    where: { id },
    include: {
      entries: {
        orderBy: { entryDate: 'desc' },
        take: 10,
      },
      exits: {
        orderBy: { exitDate: 'desc' },
        take: 10,
      },
    },
  });
  
  if (!item) {
    throw new Error('Item no encontrado');
  }
  
  return item;
}

/**
 * Crea un nuevo item
 * @param {Object} data - Datos del item
 * @returns {Promise<Object>} Item creado
 */
async function createItem(data) {
  const code = await generateItemCode();
  
  const totalValue = data.currentStock * data.unitCost;
  
  const item = await prisma.inventoryItem.create({
    data: {
      ...data,
      code,
      totalValue,
    },
  });
  
  return item;
}

/**
 * Actualiza un item
 * @param {string} id - ID del item
 * @param {Object} data - Datos a actualizar
 * @returns {Promise<Object>} Item actualizado
 */
async function updateItem(id, data) {
  const item = await getItemById(id);
  
  const updateData = { ...data };
  
  // Recalcular valor total si cambia stock o costo
  if (data.currentStock !== undefined || data.unitCost !== undefined) {
    const currentStock = data.currentStock !== undefined ? data.currentStock : item.currentStock;
    const unitCost = data.unitCost !== undefined ? data.unitCost : item.unitCost;
    updateData.totalValue = currentStock * unitCost;
  }
  
  const updated = await prisma.inventoryItem.update({
    where: { id },
    data: updateData,
  });
  
  return updated;
}

/**
 * Elimina un item (soft delete)
 * @param {string} id - ID del item
 * @returns {Promise<Object>} Item desactivado
 */
async function deleteItem(id) {
  await getItemById(id);
  
  const item = await prisma.inventoryItem.update({
    where: { id },
    data: { isActive: false },
  });
  
  return item;
}

/**
 * Obtiene items con stock bajo
 * @returns {Promise<Array>} Items con stock bajo
 */
async function getLowStockItems() {
  const items = await prisma.$queryRaw`
    SELECT * FROM inventory_items
    WHERE current_stock <= min_stock
    AND is_active = true
    ORDER BY current_stock ASC
  `;
  
  return items;
}

// ============================================
// ENTRADAS DE INVENTARIO
// ============================================

/**
 * Genera referencia de entrada
 * @returns {Promise<string>} Referencia generada
 */
async function generateEntryReference() {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `ENT-${year}${month}-`;
  
  const lastEntry = await prisma.inventoryEntry.findFirst({
    where: {
      reference: {
        startsWith: prefix
      }
    },
    orderBy: {
      reference: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastEntry) {
    const lastNumber = parseInt(lastEntry.reference.split('-')[1].substring(6));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Crea una entrada de inventario
 * @param {Object} data - Datos de la entrada
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Entrada creada
 */
async function createEntry(data, userId) {
  const item = await getItemById(data.itemId);
  
  const reference = await generateEntryReference();
  const totalCost = data.quantity * data.unitCost;
  
  // Crear entrada y actualizar stock en una transacción
  const [entry] = await prisma.$transaction([
    prisma.inventoryEntry.create({
      data: {
        ...data,
        reference,
        totalCost,
        receivedBy: userId,
        entryDate: new Date(data.entryDate),
      },
    }),
    prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: {
        currentStock: { increment: data.quantity },
        unitCost: data.unitCost, // Actualizar costo unitario
        totalValue: (item.currentStock + data.quantity) * data.unitCost,
      },
    }),
  ]);
  
  return entry;
}

/**
 * Obtiene todas las entradas con filtros
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>} Lista de entradas
 */
async function getAllEntries(filters = {}) {
  const { itemId, source, page = 1, limit = 50 } = filters;
  
  const where = {};
  if (itemId) where.itemId = itemId;
  if (source) where.source = source;
  
  const skip = (page - 1) * limit;
  
  const [entries, total] = await Promise.all([
    prisma.inventoryEntry.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        item: {
          select: {
            code: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { entryDate: 'desc' },
    }),
    prisma.inventoryEntry.count({ where }),
  ]);
  
  return {
    entries,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

// ============================================
// SALIDAS DE INVENTARIO
// ============================================

/**
 * Genera referencia de salida
 * @returns {Promise<string>} Referencia generada
 */
async function generateExitReference() {
  const year = new Date().getFullYear();
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const prefix = `SAL-${year}${month}-`;
  
  const lastExit = await prisma.inventoryExit.findFirst({
    where: {
      reference: {
        startsWith: prefix
      }
    },
    orderBy: {
      reference: 'desc'
    }
  });
  
  let nextNumber = 1;
  if (lastExit) {
    const lastNumber = parseInt(lastExit.reference.split('-')[1].substring(6));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

/**
 * Crea una salida de inventario
 * @param {Object} data - Datos de la salida
 * @param {string} userId - ID del usuario
 * @returns {Promise<Object>} Salida creada
 */
async function createExit(data, userId) {
  const item = await getItemById(data.itemId);
  
  // Verificar stock disponible
  if (item.currentStock < data.quantity) {
    throw new Error(`Stock insuficiente. Disponible: ${item.currentStock}, Solicitado: ${data.quantity}`);
  }
  
  const reference = await generateExitReference();
  const totalCost = data.quantity * item.unitCost;
  
  // Crear salida y actualizar stock en una transacción
  const [exit] = await prisma.$transaction([
    prisma.inventoryExit.create({
      data: {
        ...data,
        reference,
        unitCost: item.unitCost,
        totalCost,
        deliveredBy: userId,
        exitDate: new Date(data.exitDate),
      },
    }),
    prisma.inventoryItem.update({
      where: { id: data.itemId },
      data: {
        currentStock: { decrement: data.quantity },
        totalValue: (item.currentStock - data.quantity) * item.unitCost,
      },
    }),
  ]);
  
  return exit;
}

/**
 * Obtiene todas las salidas con filtros
 * @param {Object} filters - Filtros
 * @returns {Promise<Object>} Lista de salidas
 */
async function getAllExits(filters = {}) {
  const { itemId, departmentId, page = 1, limit = 50 } = filters;
  
  const where = {};
  if (itemId) where.itemId = itemId;
  if (departmentId) where.departmentId = departmentId;
  
  const skip = (page - 1) * limit;
  
  const [exits, total] = await Promise.all([
    prisma.inventoryExit.findMany({
      where,
      skip,
      take: parseInt(limit),
      include: {
        item: {
          select: {
            code: true,
            name: true,
            unit: true,
          },
        },
      },
      orderBy: { exitDate: 'desc' },
    }),
    prisma.inventoryExit.count({ where }),
  ]);
  
  return {
    exits,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
    },
  };
}

/**
 * Obtiene estadísticas de inventario
 * @returns {Promise<Object>} Estadísticas
 */
async function getInventoryStats() {
  const [
    totalItems,
    totalValue,
    lowStockCount,
    totalEntries,
    totalExits,
  ] = await Promise.all([
    prisma.inventoryItem.count({ where: { isActive: true } }),
    prisma.inventoryItem.aggregate({
      where: { isActive: true },
      _sum: { totalValue: true },
    }),
    prisma.$queryRaw`
      SELECT COUNT(*) as count FROM inventory_items
      WHERE current_stock <= min_stock AND is_active = true
    `,
    prisma.inventoryEntry.count(),
    prisma.inventoryExit.count(),
  ]);
  
  return {
    totalItems,
    totalValue: totalValue._sum.totalValue || 0,
    lowStockCount: parseInt(lowStockCount[0].count),
    totalEntries,
    totalExits,
  };
}

export {
  // Items
  generateItemCode,
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getLowStockItems,
  // Entradas
  generateEntryReference,
  createEntry,
  getAllEntries,
  // Salidas
  generateExitReference,
  createExit,
  getAllExits,
  // Estadísticas
  getInventoryStats,
};
