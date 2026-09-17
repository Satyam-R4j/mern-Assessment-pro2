import mongoose from 'mongoose';
import slugify from 'slugify';

const changelogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    contentMarkdown: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['New', 'Improved', 'Fixed'],
      default: 'New',
    },
    coverImage: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft',
    },
    reactions: {
      redHeart: [String],
      partyPopper: [String],
      rocket: [String],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// auto create slug from title
changelogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
  }
  next();
});

export default mongoose.model('Changelog', changelogSchema);
