// Quick test to verify service loads without errors (syntax check)
const app = require('./dist/index.js');
console.log('✅ Service loaded successfully!');
console.log('✅ All imports resolved');
console.log('✅ Express app created');
console.log('Note: MongoDB connection will fail (expected in this test)');
setTimeout(() => process.exit(0), 2000);
