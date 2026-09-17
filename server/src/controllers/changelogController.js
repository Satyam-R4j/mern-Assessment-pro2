import Changelog from '../models/Changelog.js';
import User from '../models/User.js';

// get public published updates with category filter and search
export const getChangelogs = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { status: 'Published' };

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { contentMarkdown: { $regex: search, $options: 'i' } },
      ];
    }

    const updates = await Changelog.find(query)
      .sort({ publishedAt: -1 })
      .populate('author', 'name email');

    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// json feed endpoint for integrations
export const getPublicFeed = async (req, res) => {
  try {
    const feedItems = await Changelog.find({ status: 'Published' })
      .sort({ publishedAt: -1 })
      .select('title slug contentMarkdown category coverImage publishedAt reactions');

    res.json({
      title: 'Product Updates & Changelog Feed',
      count: feedItems.length,
      feed: feedItems,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get update by slug
export const getChangelogBySlug = async (req, res) => {
  try {
    const update = await Changelog.findOne({
      slug: req.params.slug,
      status: 'Published',
    }).populate('author', 'name email');

    if (!update) {
      return res.status(404).json({ error: 'Update not found' });
    }

    res.json(update);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// get unread updates count
export const getUnreadCount = async (req, res) => {
  try {
    let lastViewed = new Date(0);

    if (req.user) {
      const user = await User.findById(req.user._id);
      if (user && user.lastViewedChangelogDate) {
        lastViewed = user.lastViewedChangelogDate;
      }
    } else if (req.query.lastViewed) {
      lastViewed = new Date(req.query.lastViewed);
    }

    const unreadCount = await Changelog.countDocuments({
      status: 'Published',
      publishedAt: { $gt: lastViewed },
    });

    res.json({ unreadCount, lastViewed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// emoji reaction handler
export const toggleReaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { emojiType } = req.body;

    const allowed = ['redHeart', 'partyPopper', 'rocket'];
    if (!allowed.includes(emojiType)) {
      return res.status(400).json({ error: 'Invalid emoji type' });
    }

    const item = await Changelog.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Update post not found' });
    }

    const userKey = req.user ? req.user._id.toString() : req.ip || 'guest';
    const list = item.reactions[emojiType] || [];
    const idx = list.indexOf(userKey);

    if (idx > -1) {
      list.splice(idx, 1);
    } else {
      list.push(userKey);
    }

    item.reactions[emojiType] = list;
    await item.save();

    res.json({ reactions: item.reactions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// --- ADMIN API HANDLERS ---

export const getAllAdminChangelogs = async (req, res) => {
  try {
    const allItems = await Changelog.find()
      .sort({ createdAt: -1 })
      .populate('author', 'name email');

    res.json(allItems);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createChangelog = async (req, res) => {
  try {
    const { title, contentMarkdown, category, coverImage, status } = req.body;

    if (!title || !contentMarkdown) {
      return res.status(400).json({ error: 'Title and content markdown are required' });
    }

    const created = await Changelog.create({
      title,
      contentMarkdown,
      category: category || 'New',
      coverImage: coverImage || '',
      status: status || 'Draft',
      publishedAt: status === 'Published' ? new Date() : Date.now(),
      author: req.user._id,
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updateChangelog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, contentMarkdown, category, coverImage, status } = req.body;

    const item = await Changelog.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (title) item.title = title;
    if (contentMarkdown) item.contentMarkdown = contentMarkdown;
    if (category) item.category = category;
    if (coverImage !== undefined) item.coverImage = coverImage;

    if (status && status !== item.status) {
      item.status = status;
      if (status === 'Published') {
        item.publishedAt = new Date();
      }
    }

    await item.save();
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteChangelog = async (req, res) => {
  try {
    const { id } = req.params;

    const item = await Changelog.findById(id);
    if (!item) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await item.deleteOne();
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
