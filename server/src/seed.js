import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Changelog from './models/Changelog.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/changelog_db';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for seeding');

    await User.deleteMany({ email: { $in: ['admin@changelog.com', 'user@changelog.com'] } });
    await Changelog.deleteMany({});

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@changelog.com',
      password: 'Admin@123',
      role: 'admin',
      isVerified: true,
      lastViewedChangelogDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    });

    const user = await User.create({
      name: 'Alex Rivera',
      email: 'user@changelog.com',
      password: 'User@123',
      role: 'user',
      isVerified: true,
      lastViewedChangelogDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    });

    const changelogs = [
      {
        title: 'v2.4.0 — Instant Search & Advanced Timeline Filtering',
        slug: 'v2-4-0-instant-search',
        category: 'New',
        status: 'Published',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
        coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        reactions: {
          redHeart: [user._id.toString()],
          partyPopper: [admin._id.toString(), user._id.toString()],
          rocket: [admin._id.toString()],
        },
        contentMarkdown: `### What's new in v2.4.0
We are excited to roll out instant live search and category filtering directly inside the changelog feed.

#### Highlights
- **Instant Search**: Quickly locate any release note or bug fix by typing keywords.
- **Category Badges**: Filter updates by \`New\`, \`Improved\`, and \`Fixed\` with live counts.
- **Deep Linking**: Each update has a shareable link that scrolls directly to the card.

Enjoying the release? Let us know with an emoji reaction below!`,
      },
      {
        title: 'v2.3.1 — Performance Optimizations & Reduced Bundle Size',
        slug: 'v2-3-1-performance-boost',
        category: 'Improved',
        status: 'Published',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        author: admin._id,
        reactions: {
          redHeart: [admin._id.toString()],
          partyPopper: [],
          rocket: [user._id.toString()],
        },
        contentMarkdown: `### Performance Enhancements
In this release, we focused on shaving load time and optimizing client-side asset delivery.

- Replaced bulky runtime dependencies with lightweight native utilities.
- Implemented optimistic UI updates for emoji reactions and read status tracking.
- Client production bundle size reduced by over **35%**.`,
      },
      {
        title: 'v2.3.0 — In-App Notification Drawer Widget',
        slug: 'v2-3-0-notification-drawer',
        category: 'New',
        status: 'Published',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
        coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
        author: admin._id,
        reactions: {
          redHeart: [user._id.toString()],
          partyPopper: [admin._id.toString()],
          rocket: [admin._id.toString(), user._id.toString()],
        },
        contentMarkdown: `### Introducing the "What's New" Slide-Over Widget
Users can now catch up on product updates without ever leaving their current workflow.

#### Key Capabilities
- **Unread Badge**: A dynamic indicator badge highlights unread updates.
- **Auto-Clear**: Opening the slide-over drawer marks updates as read instantly.
- **Inline Reactions**: React with ❤️, 🎉, or 🚀 directly inside the drawer.
- **Guest Support**: Works seamlessly for both registered members and guest visitors.`,
      },
      {
        title: 'v2.2.4 — Fix Session Expiry on Token Refresh & Cookie Parsing',
        slug: 'v2-2-4-auth-cookie-fix',
        category: 'Fixed',
        status: 'Published',
        publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 120), // 5 days ago
        author: admin._id,
        reactions: {
          redHeart: [],
          partyPopper: [user._id.toString()],
          rocket: [],
        },
        contentMarkdown: `### Resolved Issues
We identified and fixed a race condition during silent token refresh:

- Fixed an issue where expired access tokens did not auto-rotate the refresh token cleanly.
- Enhanced cookie security flags with \`httpOnly\` and \`sameSite: lax\`.
- Resolved a minor visual layout bug on mobile screens for category filter pills.`,
      },
      {
        title: 'v2.5.0 — Webhook Integration & Slack Notifications (Draft)',
        slug: 'v2-5-0-webhooks-draft',
        category: 'New',
        status: 'Draft',
        publishedAt: new Date(),
        author: admin._id,
        reactions: {
          redHeart: [],
          partyPopper: [],
          rocket: [],
        },
        contentMarkdown: `### Upcoming Feature Preview
We are building native webhook support and Slack notifications whenever a new product update is published.

> Note: This is an internal draft currently being prepared in Admin Studio.`,
      },
    ];

    await Changelog.insertMany(changelogs);
    console.log(`Successfully seeded ${changelogs.length} changelog entries.`);
    console.log('Seed completed successfully.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.log('Seed script error:', err);
    process.exit(1);
  }
};

seedDatabase();
