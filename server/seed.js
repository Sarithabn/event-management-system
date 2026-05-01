/**
 * EventSphere Seed Script
 * Run: cd server && node seed.js
 */
const mongoose = require('mongoose');
const User = require('./models/User');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');
require('dotenv').config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Ticket.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const [admin, organizer, user] = await User.create([
      { name: 'Admin User', email: 'admin@eventsphere.com', password: 'admin123', role: 'admin' },
      { name: 'Event Organizer', email: 'organizer@eventsphere.com', password: 'org123', role: 'organizer' },
      { name: 'John Doe', email: 'user@eventsphere.com', password: 'user123', role: 'user' },
    ]);
    console.log('✅ Created 3 users');

    // Create events
    const events = await Event.create([
      {
        title: 'TechConf India 2025',
        description: 'The biggest tech conference in India! Join us for two days of talks, workshops, and networking with industry leaders from Google, Microsoft, and more.',
        category: 'conference',
        organizer: organizer._id,
        venue: { name: 'Bangalore International Convention Centre', address: 'Tumkur Road', city: 'Bangalore', state: 'Karnataka', country: 'India' },
        startDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000),
        startTime: '09:00', endTime: '18:00',
        status: 'published', isFeatured: true,
        totalCapacity: 500, bookedCount: 120,
        tags: ['tech', 'AI', 'cloud', 'networking'],
        coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'
      },
      {
        title: 'Jazz Night Live',
        description: 'An intimate evening of live jazz music featuring award-winning musicians. Enjoy world-class performances in a beautiful setting.',
        category: 'concert',
        organizer: organizer._id,
        venue: { name: 'Phoenix Marketcity', address: 'Whitefield Main Road', city: 'Bangalore', state: 'Karnataka', country: 'India' },
        startDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        startTime: '19:00', endTime: '23:00',
        status: 'published', isFeatured: true,
        totalCapacity: 200, bookedCount: 80,
        tags: ['jazz', 'music', 'live'],
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800'
      },
      {
        title: 'React & Next.js Masterclass',
        description: 'A full-day hands-on workshop on modern React development, covering hooks, context, server components, and Next.js 14. Bring your laptop!',
        category: 'workshop',
        organizer: organizer._id,
        venue: { name: 'WeWork Galaxy', address: 'Residency Road', city: 'Bangalore', state: 'Karnataka', country: 'India' },
        startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        startTime: '10:00', endTime: '17:00',
        status: 'published',
        totalCapacity: 50, bookedCount: 35,
        tags: ['react', 'nextjs', 'javascript', 'workshop'],
        coverImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800'
      },
      {
        title: 'Startup Networking Mixer',
        description: 'Connect with founders, investors, and builders in Bangalore\'s vibrant startup ecosystem. Free drinks, great conversations, amazing people.',
        category: 'networking',
        organizer: organizer._id,
        venue: { name: 'The Lalit Ashok', address: 'Kumara Krupa High Grounds', city: 'Bangalore', state: 'Karnataka', country: 'India' },
        startDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        startTime: '18:00', endTime: '21:00',
        status: 'published', isFeatured: false,
        totalCapacity: 150, bookedCount: 60,
        tags: ['startup', 'networking', 'business'],
      },
    ]);
    console.log(`✅ Created ${events.length} events`);

    // Create tickets for each event
    await Ticket.create([
      // TechConf tickets
      { event: events[0]._id, name: 'Early Bird', type: 'paid', price: 999, totalQuantity: 200, soldQuantity: 80, maxPerBooking: 5 },
      { event: events[0]._id, name: 'Standard Pass', type: 'paid', price: 1999, totalQuantity: 200, soldQuantity: 30, maxPerBooking: 5 },
      { event: events[0]._id, name: 'VIP Pass', type: 'paid', price: 4999, totalQuantity: 100, soldQuantity: 10, maxPerBooking: 2 },
      // Jazz Night
      { event: events[1]._id, name: 'General Admission', type: 'paid', price: 799, totalQuantity: 150, soldQuantity: 60, maxPerBooking: 4 },
      { event: events[1]._id, name: 'Premium Table', type: 'paid', price: 2499, totalQuantity: 50, soldQuantity: 20, maxPerBooking: 2 },
      // Workshop
      { event: events[2]._id, name: 'Workshop Seat', type: 'paid', price: 1499, totalQuantity: 50, soldQuantity: 35, maxPerBooking: 2 },
      // Networking (free)
      { event: events[3]._id, name: 'Free Entry', type: 'free', price: 0, totalQuantity: 150, soldQuantity: 60, maxPerBooking: 1 },
    ]);
    console.log('✅ Created tickets');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\nDemo accounts:');
    console.log('  Admin:     admin@eventsphere.com / admin123');
    console.log('  Organizer: organizer@eventsphere.com / org123');
    console.log('  User:      user@eventsphere.com / user123');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
};

seed();
