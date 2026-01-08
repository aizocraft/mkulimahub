const mongoose = require('mongoose');
const ForumCategory = require('../models/ForumCategory');
require('dotenv').config();

const categories = [
  {
    name: 'Crop Production',
    slug: 'crop-production',
    description: 'Discussion about growing crops, planting techniques, and harvest management',
    color: '#4CAF50',
    icon: 'fa-seedling',
    expertOnly: false,
    rules: [
      'Share specific crop varieties you\'ve had success with',
      'Include your region and climate when asking for advice',
      'Be specific about problems (include photos if possible)'
    ]
  },
  {
    name: 'Livestock Farming',
    slug: 'livestock-farming',
    description: 'Animal husbandry, breeding, health, and livestock management',
    color: '#FF9800',
    icon: 'fa-paw',
    expertOnly: false,
    rules: [
      'Always mention the species and breed',
      'Include symptoms and duration when asking about health issues',
      'Share vaccination schedules and preventive care tips'
    ]
  },
  {
    name: 'Pest & Disease Control',
    slug: 'pest-disease-control',
    description: 'Identifying and managing pests, diseases, and plant health issues',
    color: '#F44336',
    icon: 'fa-bug',
    expertOnly: false,
    rules: [
      'Always include clear photos of affected plants/animals',
      'Mention what treatments you\'ve already tried',
      'State whether it\'s organic or conventional farming'
    ]
  },
  {
    name: 'Soil Science',
    slug: 'soil-science',
    description: 'Soil health, testing, amendments, and fertility management',
    color: '#795548',
    icon: 'fa-mountain',
    expertOnly: false,
    rules: [
      'Share soil test results when available',
      'Mention your soil type and drainage',
      'Include information about crop rotation'
    ]
  },
  {
    name: 'Irrigation & Water Management',
    slug: 'irrigation-water-management',
    description: 'Efficient water use, irrigation systems, and water conservation',
    color: '#2196F3',
    icon: 'fa-tint',
    expertOnly: false,
    rules: [
      'Include your water source and availability',
      'Mention your farm size and crop types',
      'Share water conservation techniques that worked for you'
    ]
  },
  {
    name: 'Farm Equipment & Technology',
    slug: 'farm-equipment-technology',
    description: 'Machinery, tools, and agricultural technology discussions',
    color: '#607D8B',
    icon: 'fa-tractor',
    expertOnly: false,
    rules: [
      'Specify the scale of your operation',
      'Mention your budget constraints',
      'Share maintenance tips and repair experiences'
    ]
  },
  {
    name: 'Agribusiness & Marketing',
    slug: 'agribusiness-marketing',
    description: 'Farm economics, business planning, and product marketing',
    color: '#9C27B0',
    icon: 'fa-chart-line',
    expertOnly: false,
    rules: [
      'Be specific about your target market',
      'Share actual numbers when discussing finances',
      'Respect confidentiality of business information'
    ]
  },
  {
    name: 'Organic Farming',
    slug: 'organic-farming',
    description: 'Certified organic practices, natural inputs, and sustainable methods',
    color: '#8BC34A',
    icon: 'fa-leaf',
    expertOnly: false,
    rules: [
      'Specify if you\'re certified organic or transitioning',
      'Share specific organic inputs and their results',
      'Discuss certification challenges and solutions'
    ]
  },
  {
    name: 'Expert Q&A',
    slug: 'expert-qa',
    description: 'Direct questions to agricultural experts and professionals',
    color: '#FF5722',
    icon: 'fa-graduation-cap',
    expertOnly: true,
    rules: [
      'Questions must be specific and well-researched',
      'Experts will verify information before responding',
      'Cite sources when providing technical information'
    ]
  },
  {
    name: 'Success Stories',
    slug: 'success-stories',
    description: 'Share your farming successes, innovations, and achievements',
    color: '#FFC107',
    icon: 'fa-trophy',
    expertOnly: false,
    rules: [
      'Include before/after photos when possible',
      'Share specific methods and inputs used',
      'Be honest about challenges faced'
    ]
  },
  {
    name: 'New Farmers',
    slug: 'new-farmers',
    description: 'Beginner questions, getting started, and basic farming knowledge',
    color: '#00BCD4',
    icon: 'fa-question-circle',
    expertOnly: false,
    rules: [
      'No question is too basic',
      'Be patient with new farmers',
      'Share your own learning experiences'
    ]
  },
  {
    name: 'Regional Farming',
    slug: 'regional-farming',
    description: 'Location-specific farming discussions, climate considerations',
    color: '#3F51B5',
    icon: 'fa-globe-africa',
    expertOnly: false,
    rules: [
      'Always mention your specific region',
      'Include local climate information',
      'Share region-specific varieties and practices'
    ]
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing categories
    await ForumCategory.deleteMany({});
    console.log('Cleared existing categories');
    
    // Insert new categories
    for (const category of categories) {
      const newCategory = new ForumCategory(category);
      await newCategory.save();
      console.log(`Created category: ${category.name}`);
    }
    
    console.log('Categories seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();