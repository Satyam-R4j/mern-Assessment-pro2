import mongoose from 'mongoose';
import slugify from 'slugify';

const changelogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
    },
    contentMarkdown: {
      type: String,
      required: [true, 'Content in markdown is required'],
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
      redHeart: [{ type: String }],
      partyPopper: [{ type: String }],
      rocket: [{ type: String }],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// generate slug 
changelogSchema.pre('save', function (next) {
  if (!this.slug || this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true }) + '-' + Date.now().toString().slice(-4);
  }
  next();
});

const Changelog = mongoose.model('Changelog', changelogSchema);
export default Changelog;
