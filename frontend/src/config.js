const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000/api';

console.log('--- TaskQuest API Debug ---');
console.log('API_BASE:', API_BASE);
console.log('Env Mode:', import.meta.env.MODE);

export default {
    API_BASE
};
