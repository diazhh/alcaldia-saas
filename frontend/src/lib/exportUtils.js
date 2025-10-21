/**
 * Utilidades para exportación de datos
 */

/**
 * Exportar datos a CSV
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo
 * @param {Array} columns - Columnas a exportar con formato {key, label}
 */
export const exportToCSV = (data, filename, columns) => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear encabezados
  const headers = columns.map(col => col.label).join(',');
  
  // Crear filas
  const rows = data.map(item => {
    return columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
      // Escapar comillas y comas
      const stringValue = String(value || '');
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',');
  });

  // Combinar todo
  const csv = [headers, ...rows].join('\n');

  // Crear blob y descargar
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exportar tabla HTML a Excel (usando CSV con extensión .xls)
 * @param {Array} data - Array de objetos con los datos
 * @param {string} filename - Nombre del archivo
 * @param {Array} columns - Columnas a exportar
 */
export const exportToExcel = (data, filename, columns) => {
  if (!data || data.length === 0) {
    console.warn('No hay datos para exportar');
    return;
  }

  // Crear tabla HTML
  let html = '<table><thead><tr>';
  
  // Encabezados
  columns.forEach(col => {
    html += `<th>${col.label}</th>`;
  });
  html += '</tr></thead><tbody>';
  
  // Filas
  data.forEach(item => {
    html += '<tr>';
    columns.forEach(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], item);
      html += `<td>${value || ''}</td>`;
    });
    html += '</tr>';
  });
  
  html += '</tbody></table>';

  // Crear blob y descargar
  const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xls`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exportar a JSON
 * @param {any} data - Datos a exportar
 * @param {string} filename - Nombre del archivo
 */
export const exportToJSON = (data, filename) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

/**
 * Exportar elemento DOM a PNG usando html2canvas (requiere instalación)
 * @param {HTMLElement} element - Elemento a exportar
 * @param {string} filename - Nombre del archivo
 */
export const exportToPNG = async (element, filename) => {
  try {
    // Nota: Requiere html2canvas instalado
    // npm install html2canvas
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2, // Mayor calidad
    });
    
    canvas.toBlob((blob) => {
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${filename}.png`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error al exportar a PNG:', error);
    alert('Error al exportar la imagen. Asegúrate de que html2canvas esté instalado.');
  }
};

/**
 * Generar PDF simple con texto
 * @param {string} content - Contenido del PDF
 * @param {string} filename - Nombre del archivo
 */
export const exportToPDF = (content, filename) => {
  // Crear un documento HTML simple para imprimir
  const printWindow = window.open('', '', 'height=600,width=800');
  
  printWindow.document.write('<html><head><title>' + filename + '</title>');
  printWindow.document.write('<style>');
  printWindow.document.write('body { font-family: Arial, sans-serif; padding: 20px; }');
  printWindow.document.write('table { border-collapse: collapse; width: 100%; margin-top: 20px; }');
  printWindow.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
  printWindow.document.write('th { background-color: #f2f2f2; }');
  printWindow.document.write('</style>');
  printWindow.document.write('</head><body>');
  printWindow.document.write(content);
  printWindow.document.write('</body></html>');
  
  printWindow.document.close();
  
  // Esperar a que se cargue y luego imprimir
  printWindow.onload = function() {
    printWindow.print();
    printWindow.close();
  };
};

/**
 * Exportar listado de personal por departamento
 * @param {Object} department - Departamento con usuarios
 */
export const exportDepartmentPersonnel = (department) => {
  const columns = [
    { key: 'user.firstName', label: 'Nombre' },
    { key: 'user.lastName', label: 'Apellido' },
    { key: 'user.email', label: 'Email' },
    { key: 'user.phone', label: 'Teléfono' },
    { key: 'departmentRole', label: 'Rol en Departamento' },
    { key: 'user.role', label: 'Rol Sistema' },
    { key: 'isPrimary', label: 'Es Principal' },
  ];

  const data = department.users || [];
  const filename = `personal_${department.code}_${new Date().toISOString().split('T')[0]}`;

  exportToExcel(data, filename, columns);
};

/**
 * Exportar directorio telefónico
 * @param {Array} departments - Lista de departamentos con usuarios
 */
export const exportPhoneDirectory = (departments) => {
  const data = [];
  
  // Aplanar la estructura
  const flattenDepartments = (depts) => {
    depts.forEach(dept => {
      if (dept.users && dept.users.length > 0) {
        dept.users.forEach(userDept => {
          data.push({
            departamento: dept.name,
            codigo: dept.code,
            nombre: `${userDept.user.firstName} ${userDept.user.lastName}`,
            email: userDept.user.email,
            telefono: userDept.user.phone || 'N/A',
            rol: userDept.departmentRole,
          });
        });
      }
      
      if (dept.children && dept.children.length > 0) {
        flattenDepartments(dept.children);
      }
    });
  };

  flattenDepartments(departments);

  const columns = [
    { key: 'departamento', label: 'Departamento' },
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'rol', label: 'Rol' },
  ];

  const filename = `directorio_telefonico_${new Date().toISOString().split('T')[0]}`;

  exportToExcel(data, filename, columns);
};

/**
 * Exportar estructura organizacional completa
 * @param {Array} departments - Árbol de departamentos
 */
export const exportOrganizationalStructure = (departments) => {
  const data = [];
  
  const flattenDepartments = (depts, level = 0, parentName = '') => {
    depts.forEach(dept => {
      data.push({
        nivel: level,
        padre: parentName,
        codigo: dept.code,
        nombre: dept.name,
        tipo: dept.type,
        empleados: dept._count?.users || 0,
        subdepartamentos: dept._count?.children || 0,
        telefono: dept.phone || 'N/A',
        email: dept.email || 'N/A',
        ubicacion: dept.location || 'N/A',
        estado: dept.isActive ? 'Activo' : 'Inactivo',
      });
      
      if (dept.children && dept.children.length > 0) {
        flattenDepartments(dept.children, level + 1, dept.name);
      }
    });
  };

  flattenDepartments(departments);

  const columns = [
    { key: 'nivel', label: 'Nivel' },
    { key: 'padre', label: 'Departamento Padre' },
    { key: 'codigo', label: 'Código' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'empleados', label: 'Empleados' },
    { key: 'subdepartamentos', label: 'Subdepartamentos' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'ubicacion', label: 'Ubicación' },
    { key: 'estado', label: 'Estado' },
  ];

  const filename = `estructura_organizacional_${new Date().toISOString().split('T')[0]}`;

  exportToExcel(data, filename, columns);
};
