const axios = require('axios');

// Test the stablecoin pairs endpoint (without API key to see if that's the issue)
async function testStablecoinPairs() {
  try {
    const response = await axios.get(
      'http://localhost:3000/arbitrage-opportunities/debug/stablecoin-pairs',
    );
    console.log(
      '✅ Stablecoin pairs data:',
      JSON.stringify(response.data, null, 2),
    );
  } catch (error) {
    console.log(
      '❌ Error fetching stablecoin pairs:',
      error.response?.data || error.message,
    );
  }
}

// Test the triangular arbitrage analysis (with a debug endpoint)
async function testTriangularAnalysis() {
  try {
    const response = await axios.get(
      'http://localhost:3000/arbitrage-opportunities/debug/analyze-triangular?minProfitPercentage=0.01',
    );
    console.log(
      '✅ Triangular analysis result:',
      JSON.stringify(response.data, null, 2),
    );
  } catch (error) {
    console.log(
      '❌ Error in triangular analysis:',
      error.response?.data || error.message,
    );
  }
}

async function main() {
  console.log('🧪 Testing Arbitrage Opportunities API...\n');

  await testStablecoinPairs();
  console.log('\n' + '='.repeat(50) + '\n');
  await testTriangularAnalysis();
}

main();
