let rawApiBase = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

// Auto-fix if /api is missing from production URL
if (rawApiBase.startsWith('http') && !rawApiBase.endsWith('/api') && !rawApiBase.includes('localhost')) {
    rawApiBase = rawApiBase.endsWith('/') ? `${rawApiBase}api` : `${rawApiBase}/api`;
}

const API_BASE = rawApiBase;

console.log('--- TaskQuest API Debug ---');
console.log('API_BASE:', API_BASE);

export default {
    API_BASE
};
