import fetch from 'node-fetch';

async function testEmployees() {
  try {
    // 1. Login
    console.log('1. Autenticando...');
    const loginRes = await fetch('http://147.93.184.19:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@municipal.gob.ve',
        password: 'Admin123!'
      })
    });
    
    const loginData = await loginRes.json();
    if (!loginData.success) {
      console.error('❌ Error en login:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Autenticado correctamente\n');
    
    // 2. Obtener empleados
    console.log('2. Obteniendo empleados...');
    const empRes = await fetch('http://147.93.184.19:3001/api/hr/employees', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const empData = await empRes.json();
    console.log('\n📊 RESPUESTA DEL ENDPOINT:');
    console.log(JSON.stringify(empData, null, 2));
    
    if (empData.success && empData.data) {
      console.log(`\n✅ Total de empleados: ${empData.data.length}`);
      empData.data.forEach(emp => {
        console.log(`   - ${emp.employeeNumber}: ${emp.firstName} ${emp.lastName}`);
      });
    } else {
      console.log('\n❌ No se obtuvieron empleados');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testEmployees();
