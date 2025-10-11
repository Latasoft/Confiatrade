// 🧪 SCRIPT DE TEST AUTOMATIZADO - CONFIATRADE
// Ejecutar desde la consola del navegador (F12)

console.log('🧪 INICIANDO TEST AUTOMATIZADO - CONFIATRADE');

// Test 1: Verificar elementos básicos de la página
function testElementosPagina() {
  console.log('\n📋 TEST 1: Elementos de la página');
  
  const tests = [
    {
      name: 'Navbar existe',
      test: () => document.querySelector('nav') !== null
    },
    {
      name: 'Botones de autenticación existen', 
      test: () => document.querySelector('[href="/sign-in"]') !== null
    },
    {
      name: 'Footer existe',
      test: () => document.querySelector('footer') !== null
    },
    {
      name: 'Estilos glass morphism aplicados',
      test: () => {
        const elements = document.querySelectorAll('[class*="glass"], [class*="backdrop-blur"]');
        return elements.length > 0;
      }
    }
  ];

  tests.forEach(test => {
    const result = test.test();
    console.log(`${result ? '✅' : '❌'} ${test.name}: ${result}`);
  });
}

// Test 2: Verificar conectividad con APIs
async function testAPIs() {
  console.log('\n🔗 TEST 2: Conectividad APIs');
  
  const apis = [
    {
      name: 'Verify Supabase',
      url: '/api/verify-supabase'
    },
    {
      name: 'Test Supabase Connection',
      url: '/api/test-supabase-connection'
    }
  ];

  for (const api of apis) {
    try {
      const response = await fetch(api.url);
      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ ${api.name}: OK (${response.status})`);
        if (data.success) {
          console.log(`   ℹ️ ${data.message || 'Success'}`);
        }
      } else {
        console.log(`❌ ${api.name}: Error (${response.status})`);
        console.log(`   ⚠️ ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.log(`❌ ${api.name}: Network Error`);
      console.log(`   ⚠️ ${error.message}`);
    }
  }
}

// Test 3: Verificar rutas públicas
async function testRutasPublicas() {
  console.log('\n🌐 TEST 3: Rutas públicas');
  
  const rutas = [
    '/',
    '/productos', 
    '/sobre-nosotros',
    '/como-funciona'
  ];

  for (const ruta of rutas) {
    try {
      const response = await fetch(ruta);
      console.log(`${response.ok ? '✅' : '❌'} ${ruta}: ${response.status} ${response.statusText}`);
    } catch (error) {
      console.log(`❌ ${ruta}: Error - ${error.message}`);
    }
  }
}

// Test 4: Verificar Local Storage y Session Storage
function testStorage() {
  console.log('\n💾 TEST 4: Storage y Cookies');
  
  console.log('📊 Local Storage keys:', Object.keys(localStorage));
  console.log('📊 Session Storage keys:', Object.keys(sessionStorage));
  
  // Verificar cookies de Clerk
  const clerkCookies = document.cookie.split(';')
    .filter(cookie => cookie.includes('__clerk') || cookie.includes('__session'));
  
  console.log('🍪 Clerk cookies:', clerkCookies.length > 0 ? '✅ Found' : '❌ Not found');
  
  // Verificar si hay datos de usuario
  const hasUserData = localStorage.getItem('user') || 
                     sessionStorage.getItem('user') ||
                     clerkCookies.length > 0;
                     
  console.log('👤 User data present:', hasUserData ? '✅ Yes' : '❌ No');
}

// Test 5: Verificar errores en consola
function testErroresConsola() {
  console.log('\n🚨 TEST 5: Verificar errores críticos');
  
  // Override console.error temporalmente para capturar errores
  const originalError = console.error;
  const errors = [];
  
  console.error = function(...args) {
    errors.push(args.join(' '));
    originalError.apply(console, args);
  };
  
  setTimeout(() => {
    console.error = originalError;
    
    const criticalErrors = errors.filter(error => 
      error.includes('404') || 
      error.includes('406') || 
      error.includes('400') ||
      error.includes('usuarios_roles') ||
      error.includes('PGRST205')
    );
    
    console.log(`🔍 Total errors captured: ${errors.length}`);
    console.log(`🚨 Critical errors: ${criticalErrors.length}`);
    
    if (criticalErrors.length > 0) {
      console.log('❌ Critical errors found:');
      criticalErrors.forEach(error => console.log(`   • ${error}`));
    } else {
      console.log('✅ No critical errors found');
    }
  }, 5000);
  
  console.log('⏳ Monitoring errors for 5 seconds...');
}

// Ejecutar todos los tests
async function ejecutarTodosLosTests() {
  console.log('🚀 EJECUTANDO BATERÍA COMPLETA DE TESTS\n');
  
  testElementosPagina();
  await testAPIs();
  await testRutasPublicas(); 
  testStorage();
  testErroresConsola();
  
  console.log('\n🏁 TESTS COMPLETADOS');
  console.log('📋 Revisa los resultados arriba');
  console.log('📝 Para test manual completo, revisa: TEST-COMPLETO.md');
}

// Auto-ejecutar si se carga el script
ejecutarTodosLosTests();

// Funciones disponibles globalmente
window.ConfiatradeTest = {
  ejecutarTodos: ejecutarTodosLosTests,
  testElementos: testElementosPagina,
  testAPIs: testAPIs,
  testRutas: testRutasPublicas,
  testStorage: testStorage,
  testErrores: testErroresConsola
};

console.log('\n💡 TIP: Usa window.ConfiatradeTest.ejecutarTodos() para repetir tests');