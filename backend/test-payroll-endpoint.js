import fetch from 'node-fetch';

async function testPayrolls() {
  try {
    // 1. Login
    console.log('1. Autenticando...');
    const loginRes = await fetch('http://localhost:3001/api/auth/login', {
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
    
    const token = loginData.data?.token || loginData.token;
    console.log('✅ Autenticado correctamente\n');
    
    // 2. Obtener nóminas
    console.log('2. Obteniendo nóminas...');
    const payrollRes = await fetch('http://localhost:3001/api/hr/payrolls', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const payrollData = await payrollRes.json();
    console.log('\n📊 RESPUESTA DEL ENDPOINT:');
    console.log(JSON.stringify(payrollData, null, 2));
    
    if (payrollData.success && payrollData.data) {
      console.log(`\n✅ Total de nóminas: ${payrollData.data.length || 0}`);
      if (Array.isArray(payrollData.data)) {
        payrollData.data.forEach(p => {
          console.log(`   - ${p.reference}: ${p.period} - Total: $${p.totalNet}`);
        });
      }
    } else {
      console.log('\n❌ No se obtuvieron nóminas');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPayrolls();
