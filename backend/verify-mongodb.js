import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const uri = process.env.MONGO_URI;
const hostMatch = uri.match(/@([^/]+)\//);
const host = hostMatch ? hostMatch[1] : 'unknown';

console.log('=== MONGODB CONNECTION VERIFICATION ===');
console.log('MongoDB Hostname:', host);

await mongoose.connect(uri);
const db = mongoose.connection.db;

console.log('\n=== DATABASE INFO ===');
console.log('Database Name:', db.databaseName);

const collections = await db.listCollections().toArray();
console.log('Collections:', collections.map(c => c.name).join(', '));

console.log('\n=== COLLECTION: recipes ===');
const recipesCol = db.collection('recipes');
const count = await recipesCol.countDocuments();
console.log('Document Count:', count);

try {
  const stats = await db.admin().command({ collStats: 'recipes' });
  console.log('Collection UUID:', stats.uuid ? stats.uuid.toString('hex').slice(0, 16) + '...' : 'N/A');
  console.log('Avg Doc Size:', stats.avgObjSize || 'N/A');
  console.log('Storage Size:', stats.size || 'N/A');
} catch (e) {
  console.log('Collection stats unavailable (normal for some deployments)');
}

console.log('\n=== INDEXES ===');
const indexes = await recipesCol.listIndexes().toArray();
console.log('Total Indexes:', indexes.length);
indexes.forEach(idx => console.log('  -', idx.name, JSON.stringify(idx.key)));

console.log('\n=== SAMPLE DOCUMENTS ===');
const samples = await recipesCol.find({}).limit(5).project({ _id: 1, name: 1, category: 1 }).toArray();
samples.forEach((doc, i) => console.log(`${i+1}. ${doc.name} (${doc.category}) [_id: ${doc._id.toString().slice(0,12)}...]`));

console.log('\n=== VERIFICATION COMPLETE ===');
await mongoose.disconnect();
