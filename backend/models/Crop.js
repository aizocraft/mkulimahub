const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true
    },
    type: {
      type: String,
      required: [true, 'Crop type is required'],
      enum: ['Cereal', 'Legume', 'Vegetable', 'Fruit', 'Other'],
      default: 'Other'
    },
    plantingDate: {
      type: Date,
      required: [true, 'Planting date is required']
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    progress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    health: {
      type: String,
      enum: ['good', 'warning', 'poor', 'none'],
      default: 'none'
    },
    area: {
      type: String,
      required: [true, 'Area is required'],
      trim: true
    },
    yield: {
      type: String,
      default: 'Not planted',
      trim: true
    },
    status: {
      type: String,
      enum: ['planning', 'planted', 'growing', 'harvested', 'failed'],
      default: 'planning'
    },
    notes: {
      type: String,
      maxlength: 500,
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for formatted planting date
cropSchema.virtual('formattedPlantingDate').get(function() {
  return this.plantingDate ? this.plantingDate.toLocaleDateString() : 'Planning';
});

// Virtual for formatted harvest date
cropSchema.virtual('formattedHarvestDate').get(function() {
  return this.harvestDate ? this.harvestDate.toLocaleDateString() : 'Planning';
});

// Index for better query performance
cropSchema.index({ farmer: 1 });
cropSchema.index({ type: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ plantingDate: 1 });
cropSchema.index({ harvestDate: 1 });

module.exports = mongoose.model('Crop', cropSchema);
