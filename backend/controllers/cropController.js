const Crop = require('../models/Crop');
const User = require('../models/User');

// Get all crops for authenticated farmer
const getFarmerCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ farmer: req.user.id })
      .sort({ createdAt: -1 })
      .populate('farmer', 'name email');

    res.json({
      success: true,
      data: crops,
      count: crops.length
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crops',
      error: error.message
    });
  }
};

// Get crop statistics
const getCropStats = async (req, res) => {
  try {
    const farmerId = req.user.id;

    const stats = await Crop.aggregate([
      { $match: { farmer: farmerId } },
      {
        $group: {
          _id: null,
          totalCrops: { $sum: 1 },
          activeCrops: {
            $sum: {
              $cond: [
                { $in: ['$status', ['planted', 'growing']] },
                1,
                0
              ]
            }
          },
          harvestedCrops: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'harvested'] },
                1,
                0
              ]
            }
          },
          averageProgress: { $avg: '$progress' },
          cropsByType: {
            $push: '$type'
          }
        }
      }
    ]);

    const result = stats[0] || {
      totalCrops: 0,
      activeCrops: 0,
      harvestedCrops: 0,
      averageProgress: 0,
      cropsByType: []
    };

    // Count crops by type
    const typeCount = {};
    result.cropsByType.forEach(type => {
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    result.cropsByType = typeCount;

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error fetching crop stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crop statistics',
      error: error.message
    });
  }
};

// Get single crop by ID
const getCropById = async (req, res) => {
  try {
    const crop = await Crop.findOne({
      _id: req.params.id,
      farmer: req.user.id
    }).populate('farmer', 'name email');

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      data: crop
    });
  } catch (error) {
    console.error('Error fetching crop:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching crop',
      error: error.message
    });
  }
};

// Create new crop
const createCrop = async (req, res) => {
  try {
    const {
      name,
      type,
      plantingDate,
      harvestDate,
      area,
      yield,
      notes
    } = req.body;

    // Validate required fields
    if (!name || !type || !plantingDate || !harvestDate || !area) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Create crop
    const crop = new Crop({
      farmer: req.user.id,
      name,
      type,
      plantingDate: new Date(plantingDate),
      harvestDate: new Date(harvestDate),
      area,
      yield: yield || 'Not planted',
      notes: notes || '',
      status: plantingDate === 'Planning' ? 'planning' : 'planted'
    });

    await crop.save();

    // Update user's mainCrops if not already included
    await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { mainCrops: name } }
    );

    res.status(201).json({
      success: true,
      data: crop,
      message: 'Crop created successfully'
    });
  } catch (error) {
    console.error('Error creating crop:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating crop',
      error: error.message
    });
  }
};

// Update crop
const updateCrop = async (req, res) => {
  try {
    const {
      name,
      type,
      plantingDate,
      harvestDate,
      area,
      yield,
      notes,
      status
    } = req.body;

    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      {
        name,
        type,
        plantingDate: plantingDate ? new Date(plantingDate) : undefined,
        harvestDate: harvestDate ? new Date(harvestDate) : undefined,
        area,
        yield,
        notes,
        status
      },
      { new: true, runValidators: true }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      data: crop,
      message: 'Crop updated successfully'
    });
  } catch (error) {
    console.error('Error updating crop:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating crop',
      error: error.message
    });
  }
};

// Update crop progress and health
const updateCropProgress = async (req, res) => {
  try {
    const { progress, health } = req.body;

    if (progress !== undefined && (progress < 0 || progress > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Progress must be between 0 and 100'
      });
    }

    const crop = await Crop.findOneAndUpdate(
      { _id: req.params.id, farmer: req.user.id },
      {
        progress,
        health,
        status: progress === 100 ? 'harvested' : progress > 0 ? 'growing' : 'planted'
      },
      { new: true }
    );

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      data: crop,
      message: 'Crop progress updated successfully'
    });
  } catch (error) {
    console.error('Error updating crop progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating crop progress',
      error: error.message
    });
  }
};

// Delete crop
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findOneAndDelete({
      _id: req.params.id,
      farmer: req.user.id
    });

    if (!crop) {
      return res.status(404).json({
        success: false,
        message: 'Crop not found'
      });
    }

    res.json({
      success: true,
      message: 'Crop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting crop:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting crop',
      error: error.message
    });
  }
};

module.exports = {
  getFarmerCrops,
  getCropStats,
  getCropById,
  createCrop,
  updateCrop,
  updateCropProgress,
  deleteCrop
};
