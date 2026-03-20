import mongoose, { Schema, model, models } from 'mongoose';

// --- Users ---
const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  preferences: {
    bodyType: String,
    skinTone: String,
    stylePreferences: [String],
    location: String,
    climate: String
  },
  createdAt: { type: Date, default: Date.now },
});

// --- Clothing Items ---
const ClothingItemSchema = new Schema({
  name: { type: String, required: true },
  brand: String,
  category: String,
  imageUrl: String,
  modelUrl: String, // For AR
  price: Number,
  currency: { type: String, default: 'USD' },
  sustainability: {
    score: Number,
    co2: String,
    durability: Number
  },
  tags: [String],
});

// --- Outfits ---
const OutfitSchema = new Schema({
  name: String,
  items: [{ type: Schema.Types.ObjectId, ref: 'ClothingItem' }],
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  thumbnailUrl: String,
  isAIGenerated: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// --- Saved Outfits (User Favorites) ---
const SavedOutfitSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  outfitId: { type: Schema.Types.ObjectId, ref: 'Outfit' },
  notes: String,
  savedAt: { type: Date, default: Date.now },
});

// --- AI History (Feature Tracking) ---
const AIHistorySchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  feature: { type: String, required: true }, // e.g., 'mood-outfit', 'aging'
  input: Schema.Types.Mixed,
  output: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

// --- Voice Requests ---
const VoiceRequestSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  transcript: String,
  audioUrl: String, // If stored in S3
  actionTaken: String,
  timestamp: { type: Date, default: Date.now },
});

// Export all models
export const User = models.User || model('User', UserSchema);
export const ClothingItem = models.ClothingItem || model('ClothingItem', ClothingItemSchema);
export const Outfit = models.Outfit || model('Outfit', OutfitSchema);
export const SavedOutfit = models.SavedOutfit || model('SavedOutfit', SavedOutfitSchema);
export const AIHistory = models.AIHistory || model('AIHistory', AIHistorySchema);
export const VoiceRequest = models.VoiceRequest || model('VoiceRequest', VoiceRequestSchema);
