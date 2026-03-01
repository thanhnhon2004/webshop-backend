/**
 * Test script to verify FE-BE connection for ProductsPage
 * Run: node testProductsAPI.js
 */

const axios = require('axios');

const API_BASE = 'http://localhost:2004/api';

async function testProductsAPI() {
  console.log('🧪 Testing Products API Connection...\n');

  try {
    // Test 1: Get all products (default)
    console.log('✅ Test 1: GET /api/products (default)');
    const res1 = await axios.get(`${API_BASE}/products`);
    console.log(`   Status: ${res1.status}`);
    console.log(`   Items: ${res1.data.data.items.length}`);
    console.log(`   Pagination:`, res1.data.data.pagination);
    console.log('');

    // Test 2: Search
    console.log('✅ Test 2: GET /api/products?search=ahri');
    const res2 = await axios.get(`${API_BASE}/products`, {
      params: { search: 'ahri' }
    });
    console.log(`   Status: ${res2.status}`);
    console.log(`   Items found: ${res2.data.data.items.length}`);
    console.log('');

    // Test 3: Filter by category
    console.log('✅ Test 3: GET /api/products?category=Mô hình');
    const res3 = await axios.get(`${API_BASE}/products`, {
      params: { category: 'Mô hình' }
    });
    console.log(`   Status: ${res3.status}`);
    console.log(`   Items: ${res3.data.data.items.length}`);
    console.log('');

    // Test 4: Price range filter
    console.log('✅ Test 4: GET /api/products?minPrice=200000&maxPrice=500000');
    const res4 = await axios.get(`${API_BASE}/products`, {
      params: { minPrice: 200000, maxPrice: 500000 }
    });
    console.log(`   Status: ${res4.status}`);
    console.log(`   Items: ${res4.data.data.items.length}`);
    console.log('');

    // Test 5: Sorting - Price Ascending
    console.log('✅ Test 5: GET /api/products?sort=price_asc');
    const res5 = await axios.get(`${API_BASE}/products`, {
      params: { sort: 'price_asc' }
    });
    console.log(`   Status: ${res5.status}`);
    if (res5.data.data.items.length > 0) {
      console.log(`   First item price: ${res5.data.data.items[0].price}`);
      console.log(`   Last item price: ${res5.data.data.items[res5.data.data.items.length - 1].price}`);
    }
    console.log('');

    // Test 6: Sorting - Price Descending
    console.log('✅ Test 6: GET /api/products?sort=price_desc');
    const res6 = await axios.get(`${API_BASE}/products`, {
      params: { sort: 'price_desc' }
    });
    console.log(`   Status: ${res6.status}`);
    if (res6.data.data.items.length > 0) {
      console.log(`   First item price: ${res6.data.data.items[0].price}`);
    }
    console.log('');

    // Test 7: Pagination
    console.log('✅ Test 7: GET /api/products?page=2&limit=5');
    const res7 = await axios.get(`${API_BASE}/products`, {
      params: { page: 2, limit: 5 }
    });
    console.log(`   Status: ${res7.status}`);
    console.log(`   Current page: ${res7.data.data.pagination.page}`);
    console.log(`   Items per page: ${res7.data.data.pagination.limit}`);
    console.log(`   Total pages: ${res7.data.data.pagination.totalPages}`);
    console.log('');

    // Test 8: Combined filters
    console.log('✅ Test 8: Combined filters (category + price + sort)');
    const res8 = await axios.get(`${API_BASE}/products`, {
      params: {
        category: 'Figrue',
        minPrice: 100000,
        sort: 'popular'
      }
    });
    console.log(`   Status: ${res8.status}`);
    console.log(`   Items: ${res8.data.data.items.length}`);
    console.log('');

    console.log('✅ All tests passed! FE-BE connection is working properly.');

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    console.error('');
    console.error('⚠️  Make sure the backend server is running on port 2004');
  }
}

testProductsAPI();
