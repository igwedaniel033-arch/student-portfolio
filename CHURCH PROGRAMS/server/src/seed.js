require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const About = require('./models/About');

const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/gigal';

const members = [
  'Henry Gilgal','My Strength','Nwoke Ocha','Amaka Ann','Anita','Chidinma','Chinyere','Divinefavour','Femi','Field and Fabric Studio','Goldameirozioma','Laurachidinmma','Lekutae','Samie','Stasia Chidinma','Mummy B','My Mummy','Udoh E.I','Orogwuregi','Sis Christabel','Ada For Life','Bro Daniel','God\'s Favourite'
];

async function seed() {
  await mongoose.connect(DB_URI);
  console.log('Connected to', DB_URI);

  // About
  let about = await About.findOne();
  if (!about) {
    about = new About();
    await about.save();
    console.log('About created');
  }

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'daniel@gigal.example';
  const adminPass = process.env.ADMIN_PASSWORD || 'AdminPass123';
  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const hash = await bcrypt.hash(adminPass, 10);
    admin = new User({ fullName: 'Daniel', email: adminEmail, password: hash, role: 'admin' });
    await admin.save();
    console.log('Admin user created:', adminEmail);
  }

  // Seed members
  for (const name of members) {
    const exists = await User.findOne({ fullName: name });
    if (!exists) {
      const u = new User({ fullName: name, role: 'member', avatarURL: '' });
      await u.save();
    }
  }
  console.log('Members seeded');
  process.exit(0);
}

seed().catch((err)=>{console.error(err); process.exit(1)});
