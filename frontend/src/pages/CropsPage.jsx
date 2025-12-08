import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import cropsData from '../data/cropsData.json';
import {
  Sprout,
  Search,
  Filter,
  ChevronRight,
  Sparkles,
  Calendar,
  MapPin,
  Thermometer,
  CloudDrizzle,
  Leaf,
  Droplets,
  Sun,
  Clock,
  Users,
  BookOpen,
  CheckCircle,
  ArrowRight,
  X,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Maximize2,
  Minimize2,
  Share2,
  Download,
  Printer,
  Info,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Settings,
  Edit3,
  Heart,
  Bookmark
} from 'lucide-react';

// Interactive Crop Card Component
const InteractiveCropCard = ({ crop, onClick, isSelected }) => {
  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Low': return 'bg-green-500';
      case 'Medium': return 'bg-yellow-500';
      case 'High': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyTextColor = (difficulty) => {
    switch(difficulty) {
      case 'Low': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'High': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div 
      onClick={() => onClick(crop)}
      className={`group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border-2 transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${
        isSelected 
          ? 'border-emerald-500 ring-2 ring-emerald-500/20' 
          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700'
      }`}
    >
      {/* Card Header with Interactive Elements */}
      <div className="relative h-40 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 overflow-hidden">
        <div 
          className="w-full h-full bg-center bg-cover transition-all duration-500 group-hover:scale-110"
          style={{ backgroundImage: `url(${crop.image})` }}
        />
        
        {/* Favorite/Bookmark Button */}
        <button 
          className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
          onClick={(e) => {
            e.stopPropagation();
            console.log('Bookmarked:', crop.name);
          }}
        >
          <Bookmark className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </button>

        {/* Category Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700 dark:text-gray-300">
            {crop.category}
          </span>
        </div>

        {/* Success Rate Indicator */}
        <div className="absolute bottom-4 right-4">
          <div className="px-2 py-1 bg-green-500/90 backdrop-blur-sm rounded-full">
            <span className="text-xs font-bold text-white">{crop.successRate}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${crop.iconColor} flex items-center justify-center text-white text-lg shadow-lg`}>
              {crop.icon}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                {crop.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {crop.season}
                </span>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {crop.duration}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
          {crop.description}
        </p>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Thermometer className="w-3 h-3 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temp</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{crop.requirements.temperature}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <CloudDrizzle className="w-3 h-3 text-indigo-500" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Rain</p>
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200">{crop.requirements.rainfall}</p>
            </div>
          </div>
        </div>

        {/* Difficulty and Tags */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getDifficultyColor(crop.difficulty)}`} />
            <span className={`text-xs font-semibold ${getDifficultyTextColor(crop.difficulty)}`}>
              {crop.difficulty}
            </span>
          </div>
          
          <div className="flex gap-1">
            {crop.tags.slice(0, 2).map((tag, index) => (
              <span 
                key={index}
                className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Interactive Action Button */}
        <button className="w-full group/btn bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40">
          <Play className="w-4 h-4" />
          View Stages
          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};

// Crop Stages Visualization Component
const CropStagesVisualization = ({ crop, onClose }) => {
  const [activeStage, setActiveStage] = useState('preparation');
  const [completedStages, setCompletedStages] = useState([]);
  const [currentSubStage, setCurrentSubStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const stageColors = {
    preparation: 'from-blue-500 to-cyan-500',
    planting: 'from-green-500 to-emerald-500',
    growth: 'from-lime-500 to-green-500',
    maturity: 'from-yellow-500 to-amber-500',
    harvest: 'from-orange-500 to-red-500',
    postHarvest: 'from-purple-500 to-pink-500'
  };

  const stageIcons = {
    preparation: '🏗️',
    planting: '🌱',
    growth: '🌿',
    maturity: '🌾',
    harvest: '✂️',
    postHarvest: '📦'
  };

  const stageTitles = {
    preparation: 'Preparation',
    planting: 'Planting',
    growth: 'Growth & Care',
    maturity: 'Maturity',
    harvest: 'Harvest',
    postHarvest: 'Post-Harvest'
  };

  const stages = Object.keys(crop.stages || {});

  const toggleStageCompletion = (stage) => {
    setCompletedStages(prev => 
      prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const playStageTour = () => {
    setIsPlaying(true);
    let stageIndex = 0;
    const interval = setInterval(() => {
      if (stageIndex < stages.length) {
        setActiveStage(stages[stageIndex]);
        stageIndex++;
      } else {
        clearInterval(interval);
        setIsPlaying(false);
      }
    }, 2000);
  };

  const currentStageData = crop.stages?.[activeStage] || [];

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
      isFullscreen ? 'p-0' : ''
    }`}>
      <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${
        isFullscreen ? 'w-full h-full m-0 rounded-none' : 'max-w-6xl w-full max-h-[90vh]'
      }`}>
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${crop.iconColor} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {crop.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{crop.name}</h2>
                <p className="text-gray-600 dark:text-gray-400">Complete Growth Stages Guide</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-120px)]">
          {/* Left Sidebar - Stage Navigation */}
          <div className="lg:w-1/4 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Growth Journey</h3>
              
              {/* Progress Overview */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((completedStages.length / stages.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(completedStages.length / stages.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Stage Timeline */}
              <div className="space-y-3">
                {stages.map((stage, index) => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      activeStage === stage
                        ? `bg-gradient-to-r ${stageColors[stage]} text-white shadow-lg`
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        activeStage === stage ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {stageIcons[stage]}
                      </div>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-medium">{stageTitles[stage]}</div>
                      <div className="text-sm opacity-75">
                        {crop.stages[stage]?.length || 0} steps • {crop.stages[stage]?.reduce((acc, s) => acc + parseInt(s.duration.split('-')[0]), 0)} days
                      </div>
                    </div>

                    {completedStages.includes(stage) && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Controls */}
            <div className="space-y-3">
              <button
                onClick={playStageTour}
                disabled={isPlaying}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4" />
                Tour All Stages
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>
          </div>

          {/* Main Content - Stage Details */}
          <div className="lg:w-3/4 p-6 overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${stageColors[activeStage]} flex items-center justify-center text-white text-2xl`}>
                      {stageIcons[activeStage]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stageTitles[activeStage]}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Stage {stages.indexOf(activeStage) + 1} of {stages.length}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStageCompletion(activeStage)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      completedStages.includes(activeStage)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {completedStages.includes(activeStage) ? '✓ Completed' : 'Mark Complete'}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setCurrentSubStage(Math.max(0, currentSubStage - 1))}
                      disabled={currentSubStage === 0}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                      <SkipBack className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => setCurrentSubStage(Math.min(currentStageData.length - 1, currentSubStage + 1))}
                      disabled={currentSubStage === currentStageData.length - 1}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg disabled:opacity-50"
                    >
                      <SkipForward className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Stage Progress Bar */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Step {currentSubStage + 1} of {currentStageData.length}
                  </span>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {currentStageData[currentSubStage]?.duration}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${stageColors[activeStage]} transition-all duration-500`}
                    style={{ width: `${((currentSubStage + 1) / currentStageData.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Current Step Details */}
            {currentStageData[currentSubStage] && (
              <div className="space-y-6 animate-fade-in">
                {/* Step Header */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${stageColors[activeStage]} flex items-center justify-center text-white`}>
                          <span className="font-bold">{currentSubStage + 1}</span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                          {currentStageData[currentSubStage].title}
                        </h4>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentStageData[currentSubStage].description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        {currentStageData[currentSubStage].duration}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Step Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Key Tips */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-5 h-5 text-blue-500" />
                      <h5 className="font-semibold text-blue-700 dark:text-blue-400">Key Tips</h5>
                    </div>
                    <ul className="space-y-2">
                      {currentStageData[currentSubStage].tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Activities */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <Settings className="w-5 h-5 text-emerald-500" />
                      <h5 className="font-semibold text-emerald-700 dark:text-emerald-400">Activities</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentStageData[currentSubStage].keyActivities.map((activity, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Materials Needed */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-900/30">
                    <div className="flex items-center gap-2 mb-3">
                      <BookOpen className="w-5 h-5 text-amber-500" />
                      <h5 className="font-semibold text-amber-700 dark:text-amber-400">Materials</h5>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentStageData[currentSubStage].materials.map((material, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 bg-amber-100 dark:bg-amber-800/30 text-amber-700 dark:text-amber-300 text-sm rounded-full"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Success Indicator */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6 text-green-500" />
                    <h5 className="font-bold text-green-700 dark:text-green-400">Success Indicator</h5>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">
                    {currentStageData[currentSubStage].successIndicator}
                  </p>
                </div>
              </div>
            )}

            {/* Next/Previous Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={() => {
                  if (currentSubStage > 0) {
                    setCurrentSubStage(currentSubStage - 1);
                  } else if (stages.indexOf(activeStage) > 0) {
                    const prevStage = stages[stages.indexOf(activeStage) - 1];
                    setActiveStage(prevStage);
                    setCurrentSubStage((crop.stages[prevStage]?.length || 1) - 1);
                  }
                }}
                disabled={currentSubStage === 0 && stages.indexOf(activeStage) === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
              >
                <SkipBack className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Step {currentSubStage + 1} of {currentStageData.length}
                </span>
              </div>
              
              <button
                onClick={() => {
                  if (currentSubStage < currentStageData.length - 1) {
                    setCurrentSubStage(currentSubStage + 1);
                  } else if (stages.indexOf(activeStage) < stages.length - 1) {
                    const nextStage = stages[stages.indexOf(activeStage) + 1];
                    setActiveStage(nextStage);
                    setCurrentSubStage(0);
                  }
                }}
                disabled={currentSubStage === currentStageData.length - 1 && stages.indexOf(activeStage) === stages.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all"
              >
                Next
                <SkipForward className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Crops Page Component
const CropsPage = () => {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  
  const categories = ['All', 'Cereal', 'Cash Crop', 'Vegetable', 'Tuber', 'Legume'];
  const difficulties = ['All', 'Low', 'Medium', 'High'];

  const filteredCrops = cropsData.crops.filter(crop => {
    const matchesSearch = crop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         crop.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         crop.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || crop.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || crop.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900/20 transition-colors duration-300">
      {/* Sleek Minimal Header */}
      <div className="relative pt-12 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="flex flex-col items-center gap-3 mb-6">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/25">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full flex items-center justify-center">
                  <Sparkles className="w-1.5 h-1.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  Smart <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">Crops</span>
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Interactive crop guides with complete growth stages
                </p>
              </div>
            </div>

            {/* Compact Search */}
            <div className="max-w-xl mx-auto mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search crops..."
                  className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="flex items-center gap-1">
                <Sprout className="w-3 h-3" />
                {filteredCrops.length} crops
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Updated today
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-1" />
            
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all duration-200 ${
                  selectedDifficulty === difficulty
                    ? difficulty === 'Low' ? 'bg-green-500 text-white' :
                      difficulty === 'Medium' ? 'bg-yellow-500 text-white' :
                      difficulty === 'High' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Crops Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {filteredCrops.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCrops.map((crop) => (
              <InteractiveCropCard
                key={crop.id}
                crop={crop}
                onClick={setSelectedCrop}
                isSelected={selectedCrop?.id === crop.id}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No crops found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* Full Guide Modal */}
      {selectedCrop && (
        <CropStagesVisualization
          crop={selectedCrop}
          onClose={() => setSelectedCrop(null)}
        />
      )}

      {/* Minimal Footer */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Interactive crop guides • Expert-verified stages • Complete growth cycles
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CropsPage;