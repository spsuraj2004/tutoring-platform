/**
 * Seed Script for MongoDB Atlas
 * 
 * Run this ONCE to populate your Atlas DB with
 * the initial users (admin, tutors, students).
 * 
 * Usage:  npx ts-node src/seed.ts
 */

import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// ── User Schema (matches user.schema.ts) ──
const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, required: true, enum: ['admin', 'tutor', 'student'] },
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);

// ── Seed Data ──
const seedUsers = [
  // Admin
  {
    name: 'Admin',
    email: 'admin@tution4all.com',
    password: 'admin123',
    role: 'admin',
  },

  // Tutors
  {
    name: 'Maths Tutor',
    email: 'maths@tution4all.com',
    password: 'tutor123',
    role: 'tutor',
  },
  {
    name: 'Science Tutor',
    email: 'science@tution4all.com',
    password: 'tutor123',
    role: 'tutor',
  },
  {
    name: 'English Tutor',
    email: 'english@tution4all.com',
    password: 'tutor123',
    role: 'tutor',
  },

  // Students
  {
    name: 'Student 1',
    email: 'student1@tution4all.com',
    password: 'student123',
    role: 'student',
  },
  {
    name: 'Student 2',
    email: 'student2@tution4all.com',
    password: 'student123',
    role: 'student',
  },
  {
    name: 'Student 3',
    email: 'student3@tution4all.com',
    password: 'student123',
    role: 'student',
  },
];

// ── Main ──
async function seed() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }

  console.log('🔗 Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('✅ Connected!\n');

  for (const userData of seedUsers) {
    // Check if user already exists
    const existing = await User.findOne({ email: userData.email });

    if (existing) {
      console.log(`⏭️  Skipping ${userData.email} (already exists)`);
      continue;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create user
    await User.create({
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userData.role as 'admin' | 'tutor' | 'student',
    });

    console.log(`✅ Created ${userData.role}: ${userData.email}`);
  }

  console.log('\n🎉 Seed complete!');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
