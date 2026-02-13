import { useState, useEffect } from 'react';
import { 
  Sprout, Plus, Search, Filter, Calendar, Droplets, Thermometer, 
  Edit, Trash2, X, Save, BookOpen, Lightbulb, ChevronRight, 
  CheckCircle, AlertCircle, TrendingUp, Clock, Users, Sparkles, 
  Send, ThumbsUp, MapPin, Leaf, Sun, Cloud, Wind, Gauge, 
  Shield, Award, RotateCcw, Download, Printer, Share2,
  ChevronLeft, ChevronDown, ChevronUp, Maximize2, Minimize2,
  Play, Pause, SkipBack, SkipForward, Heart, Bookmark,
  Info, Settings, BarChart3, MessageCircle, HelpCircle
} from 'lucide-react';
import { cropAPI, apiUtils } from '../../../api';
import cropsData from '../../../data/cropsData.json';

// Enhanced Crop Stages Visualization Component
const CropStagesVisualization = ({ crop, onClose, onSuggestImprovement, userCrop, onUpdateProgress }) => {
  const [activeStage, setActiveStage] = useState('preparation');
  const [completedStages, setCompletedStages] = useState([]);
  const [currentSubStage, setCurrentSubStage] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [stageProgress, setStageProgress] = useState({});
  const [showTips, setShowTips] = useState(true);
  const [bookmarked, setBookmarked] = useState(false);

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

  useEffect(() => {
    // Load completed stages from localStorage
    const saved = localStorage.getItem(`crop_${crop.id}_stages`);
    if (saved) {
      setCompletedStages(JSON.parse(saved));
    }
  }, [crop.id]);

  const toggleStageCompletion = (stage) => {
    setCompletedStages(prev => {
      const updated = prev.includes(stage) 
        ? prev.filter(s => s !== stage)
        : [...prev, stage];
      
      // Save to localStorage
      localStorage.setItem(`crop_${crop.id}_stages`, JSON.stringify(updated));
      
      // Update overall crop progress if userCrop exists
      if (userCrop && onUpdateProgress) {
        const progress = Math.round((updated.length / stages.length) * 100);
        onUpdateProgress(userCrop._id, progress, 'good');
      }
      
      return updated;
    });
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

  const saveNotes = () => {
    localStorage.setItem(`crop_${crop.id}_notes`, notes);
    setShowNotes(false);
  };

  const currentStageData = crop.stages?.[activeStage] || [];

  const skipToNextStage = () => {
    if (currentSubStage < currentStageData.length - 1) {
      setCurrentSubStage(currentSubStage + 1);
    } else if (stages.indexOf(activeStage) < stages.length - 1) {
      const nextStage = stages[stages.indexOf(activeStage) + 1];
      setActiveStage(nextStage);
      setCurrentSubStage(0);
    }
  };

  const skipToPrevStage = () => {
    if (currentSubStage > 0) {
      setCurrentSubStage(currentSubStage - 1);
    } else if (stages.indexOf(activeStage) > 0) {
      const prevStage = stages[stages.indexOf(activeStage) - 1];
      setActiveStage(prevStage);
      setCurrentSubStage((crop.stages[prevStage]?.length || 1) - 1);
    }
  };

const [showAddModal, setShowAddModal] = useState(false);
const [editingCrop, setEditingCrop] = useState(null);

  return (
    <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${isFullscreen ? 'p-0' : ''}`}>
      <div className={`bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transition-all duration-300 ${isFullscreen ? 'w-full h-full m-0 rounded-none' : 'max-w-7xl w-full max-h-[90vh]'}`}>
        
        {/* Enhanced Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${crop.iconColor} flex items-center justify-center text-white text-2xl shadow-lg`}>
                {crop.icon}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{crop.name} Guide</h2>
                  {userCrop && (
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      userCrop.health === 'good' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      userCrop.health === 'warning' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      userCrop.health === 'poor' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      {userCrop.health === 'good' ? '🌱 Healthy' : 
                       userCrop.health === 'warning' ? '⚠️ Needs Attention' : 
                       userCrop.health === 'poor' ? '🔴 Critical' : '⚪ Not Started'}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {crop.duration} • {crop.season} Season
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Bookmark Button */}
              <button 
                onClick={() => setBookmarked(!bookmarked)}
                className={`p-2 rounded-lg transition-colors ${
                  bookmarked ? 'text-yellow-500' : 'text-gray-400 hover:text-yellow-500'
                }`}
              >
                <Bookmark className="w-5 h-5" fill={bookmarked ? 'currentColor' : 'none'} />
              </button>

              {/* Notes Button */}
              <button 
                onClick={() => setShowNotes(!showNotes)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button 
                onClick={() => onSuggestImprovement(crop)}
                className="flex items-center gap-2 px-3 py-2 bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-lg transition-colors"
              >
                <Lightbulb size={16} />
                Suggest
              </button>
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

          {/* Notes Panel */}
          {showNotes && (
            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">My Notes for {crop.name}</h4>
                <button onClick={() => setShowNotes(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your observations, tips, or reminders..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={saveNotes}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm rounded-lg"
                >
                  Save Notes
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-140px)]">
          {/* Enhanced Left Sidebar */}
          <div className="lg:w-1/4 border-r border-gray-200 dark:border-gray-800 p-6 overflow-y-auto">
            {/* User's Crop Info if available */}
            {userCrop && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                <h4 className="text-sm font-semibold text-purple-700 dark:text-purple-400 mb-3 flex items-center gap-2">
                  <Sprout className="w-4 h-4" />
                  Your Crop Details
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Planted:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userCrop.plantingDate ? new Date(userCrop.plantingDate).toLocaleDateString() : 'Planning'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Harvest:</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {userCrop.harvestDate ? new Date(userCrop.harvestDate).toLocaleDateString() : 'Planning'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Area:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{userCrop.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Expected Yield:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{userCrop.yield}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center justify-between">
                <span>Growth Journey</span>
                <span className="text-sm font-normal text-gray-500">
                  {completedStages.length}/{stages.length} completed
                </span>
              </h3>
              
              {/* Enhanced Progress Overview */}
              <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Progress</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {Math.round((completedStages.length / stages.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${(completedStages.length / stages.length) * 100}%` }}
                  />
                </div>

                {/* Estimated Time to Harvest */}
                {userCrop && userCrop.harvestDate && (
                  <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Days to harvest:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {Math.max(0, Math.ceil((new Date(userCrop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24)))} days
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Stage Timeline with Progress */}
              <div className="space-y-3">
                {stages.map((stage) => (
                  <button
                    key={stage}
                    onClick={() => setActiveStage(stage)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      activeStage === stage
                        ? `bg-gradient-to-r ${stageColors[stage]} text-white shadow-lg`
                        : completedStages.includes(stage)
                          ? 'bg-green-50 dark:bg-green-900/20 text-gray-700 dark:text-gray-300'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        activeStage === stage ? 'bg-white/20' : 
                        completedStages.includes(stage) ? 'bg-green-100 dark:bg-green-800' : 
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        {stageIcons[stage]}
                      </div>
                    </div>
                    
                    <div className="flex-1 text-left">
                      <div className="font-medium">{stageTitles[stage]}</div>
                      <div className="text-sm opacity-75 flex items-center gap-1">
                        <span>{crop.stages[stage]?.length || 0} steps</span>
                        <span>•</span>
                        <span>{crop.stages[stage]?.reduce((acc, s) => {
                          const days = parseInt(s.duration.split('-')[0]);
                          return acc + (isNaN(days) ? 0 : days);
                        }, 0)} days</span>
                      </div>
                    </div>

                    {completedStages.includes(stage) && (
                      <CheckCircle className="w-5 h-5 text-green-500" fill="white" />
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
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Playing Tour...' : 'Start Stage Tour'}
              </button>
              
              <div className="grid grid-cols-2 gap-2">
                <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  <Download className="w-4 h-4" />
                  PDF Guide
                </button>
                <button className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:w-3/4 p-6 overflow-y-auto">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stageColors[activeStage]} flex items-center justify-center text-white text-2xl shadow-lg`}>
                      {stageIcons[activeStage]}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stageTitles[activeStage]}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <span>Stage {stages.indexOf(activeStage) + 1} of {stages.length}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Est. {currentStageData.reduce((acc, s) => {
                            const days = parseInt(s.duration.split('-')[0]);
                            return acc + (isNaN(days) ? 0 : days);
                          }, 0)} days
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleStageCompletion(activeStage)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                      completedStages.includes(activeStage)
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4" />
                    {completedStages.includes(activeStage) ? 'Completed' : 'Mark Complete'}
                  </button>
                  
                  <button
                    onClick={() => setShowTips(!showTips)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    title="Toggle tips"
                  >
                    <HelpCircle className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Enhanced Stage Progress Bar */}
              {currentStageData.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <span>Step {currentSubStage + 1} of {currentStageData.length}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {currentStageData[currentSubStage]?.title}
                      </span>
                    </span>
                    <span className="text-sm font-medium bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                      {currentStageData[currentSubStage]?.duration}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full bg-gradient-to-r ${stageColors[activeStage]} transition-all duration-500`}
                      style={{ width: `${((currentSubStage + 1) / currentStageData.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Step Details */}
            {currentStageData[currentSubStage] && (
              <div className="space-y-6 animate-fade-in">
                {/* Step Header with Enhanced Info */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${stageColors[activeStage]} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
                          {currentSubStage + 1}
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                            {currentStageData[currentSubStage].title}
                          </h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Key activity for this stage
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {currentStageData[currentSubStage].description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Enhanced Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Key Tips - Enhanced */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-900/30 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center">
                        <Lightbulb className="w-4 h-4 text-blue-500" />
                      </div>
                      <h5 className="font-semibold text-blue-700 dark:text-blue-400">Pro Tips</h5>
                    </div>
                    <ul className="space-y-2">
                      {currentStageData[currentSubStage].tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Activities - Enhanced */}
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-900/30 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-emerald-500" />
                      </div>
                      <h5 className="font-semibold text-emerald-700 dark:text-emerald-400">Activities</h5>
                    </div>
                    <div className="space-y-2">
                      {currentStageData[currentSubStage].keyActivities.map((activity, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{activity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Materials - Enhanced */}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-900/30 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 bg-amber-100 dark:bg-amber-800 rounded-lg flex items-center justify-center">
                        <Sprout className="w-4 h-4 text-amber-500" />
                      </div>
                      <h5 className="font-semibold text-amber-700 dark:text-amber-400">Materials</h5>
                    </div>
                    <div className="space-y-2">
                      {currentStageData[currentSubStage].materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{material}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Success Indicator - Enhanced */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl p-6 border border-green-200 dark:border-green-900/30">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800 rounded-xl flex items-center justify-center">
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <h5 className="font-bold text-green-700 dark:text-green-400">Success Indicator</h5>
                      <p className="text-xs text-green-600 dark:text-green-500">How to know you're on track</p>
                    </div>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {currentStageData[currentSubStage].successIndicator}
                  </p>
                </div>

                {/* Weather Tips Section */}
                {crop.requirements && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-900/30">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-800 rounded-xl flex items-center justify-center">
                        <Cloud className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h5 className="font-bold text-indigo-700 dark:text-indigo-400">Ideal Conditions</h5>
                        <p className="text-xs text-indigo-600 dark:text-indigo-500">For this stage</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <Thermometer className="w-5 h-5 text-red-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Temperature</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{crop.requirements.temperature}</p>
                      </div>
                      <div className="text-center">
                        <Droplets className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Rainfall</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{crop.requirements.rainfall}</p>
                      </div>
                      <div className="text-center">
                        <Sun className="w-5 h-5 text-yellow-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Sunlight</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{crop.requirements.sunlight || 'Full sun'}</p>
                      </div>
                      <div className="text-center">
                        <Wind className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                        <p className="text-xs text-gray-500 dark:text-gray-400">Soil pH</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{crop.requirements.soilPH || '6.0-7.0'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Enhanced Navigation */}
            <div className="flex items-center justify-between mt-8 pt-8 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={skipToPrevStage}
                disabled={currentSubStage === 0 && stages.indexOf(activeStage) === 0}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <SkipBack className="w-4 h-4" />
                Previous
              </button>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, currentStageData.length))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentSubStage(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentSubStage 
                          ? `bg-gradient-to-r ${stageColors[activeStage]} w-4` 
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                  {currentStageData.length > 5 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{currentStageData.length - 5} more
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Step {currentSubStage + 1}/{currentStageData.length}
                </span>
              </div>
              
              <button
                onClick={skipToNextStage}
                disabled={currentSubStage === currentStageData.length - 1 && stages.indexOf(activeStage) === stages.length - 1}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-500/25"
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

// Enhanced Suggest Improvement Modal
const SuggestImprovementModal = ({ crop, onClose, onSubmit }) => {
  const [improvementType, setImprovementType] = useState('tip');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [stage, setStage] = useState('');
  const [step, setStep] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleSubmit = () => {
    if (!description.trim()) return;
    
    const improvement = {
      id: Date.now(),
      cropName: crop.name,
      cropId: crop.id,
      type: improvementType,
      stage,
      step,
      description,
      contactEmail,
      timestamp: new Date().toISOString(),
      status: 'pending',
      votes: 0
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('cropImprovements') || '[]');
    localStorage.setItem('cropImprovements', JSON.stringify([improvement, ...existing]));
    
    setSubmitted(true);
    setTimeout(() => {
      onSubmit(improvement);
    }, 1500);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center animate-fade-in">
          <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ThumbsUp className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thank You! 🌱</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your suggestion helps us improve the {crop.name} guide for everyone.
          </p>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-4">
            <p className="text-sm text-green-700 dark:text-green-400">
              We'll review your suggestion and update the guide soon.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Improve {crop?.name} Guide
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share your farming experience
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Improvement Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'tip', label: '💡 New Tip', desc: 'Add farming tip' },
                { value: 'step', label: '📝 New Step', desc: 'Add missing step' },
                { value: 'activity', label: '⚡ Activity', desc: 'Add activity' },
                { value: 'material', label: '🔧 Material', desc: 'Add material' },
                { value: 'correction', label: '✏️ Correction', desc: 'Fix error' },
                { value: 'other', label: '💭 Other', desc: 'General feedback' }
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setImprovementType(type.value)}
                  className={`p-3 rounded-xl text-xs transition-all ${
                    improvementType === type.value
                      ? 'bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-lg'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="font-medium mb-1">{type.label}</div>
                  <div className="text-[10px] opacity-75">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Stage (optional)
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              >
                <option value="">Select stage</option>
                <option value="preparation">Preparation</option>
                <option value="planting">Planting</option>
                <option value="growth">Growth</option>
                <option value="maturity">Maturity</option>
                <option value="harvest">Harvest</option>
                <option value="postHarvest">Post-Harvest</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Step (optional)
              </label>
              <input
                type="text"
                value={step}
                onChange={(e) => setStep(e.target.value)}
                placeholder="e.g., Step 3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Your Suggestion <span className="text-red-500">*</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows="4"
              placeholder="Describe your suggestion in detail..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email (optional)
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="For follow-up questions"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={!description.trim()}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-medium py-3 rounded-lg transition-all shadow-lg shadow-emerald-500/25"
          >
            <Send size={18} />
            Submit Suggestion
          </button>
        </div>
      </div>
    </div>
  );
};

// Add Crop Modal with Enhanced Fields
const AddCropModal = ({ isOpen, onClose, onSave, editingCrop }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'Vegetable',
    variety: '',
    plantingDate: '',
    harvestDate: '',
    area: '',
    areaUnit: 'hectares',
    expectedYield: '',
    yieldUnit: 'tons',
    notes: '',
    health: 'none',
    progress: 0,
    location: '',
    seedSource: '',
    fertilizerType: '',
    irrigationMethod: ''
  });

  useEffect(() => {
    if (editingCrop) {
      setFormData({
        name: editingCrop.name || '',
        type: editingCrop.type || 'Vegetable',
        variety: editingCrop.variety || '',
        plantingDate: editingCrop.plantingDate ? new Date(editingCrop.plantingDate).toISOString().split('T')[0] : '',
        harvestDate: editingCrop.harvestDate ? new Date(editingCrop.harvestDate).toISOString().split('T')[0] : '',
        area: editingCrop.area || '',
        areaUnit: editingCrop.areaUnit || 'hectares',
        expectedYield: editingCrop.expectedYield || '',
        yieldUnit: editingCrop.yieldUnit || 'tons',
        notes: editingCrop.notes || '',
        health: editingCrop.health || 'none',
        progress: editingCrop.progress || 0,
        location: editingCrop.location || '',
        seedSource: editingCrop.seedSource || '',
        fertilizerType: editingCrop.fertilizerType || '',
        irrigationMethod: editingCrop.irrigationMethod || ''
      });
    } else {
      // Pre-fill with today's date for planting
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        plantingDate: today
      }));
    }
  }, [editingCrop]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center">
                {editingCrop ? <Edit className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editingCrop ? 'Edit Crop' : 'Add New Crop'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {editingCrop ? 'Update your crop information' : 'Start tracking your new crop'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Sprout className="w-4 h-4" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Crop Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Maize"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Variety
                  </label>
                  <input
                    type="text"
                    name="variety"
                    value={formData.variety}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., H614, SC 649"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Crop Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="Cereal">Cereal</option>
                    <option value="Legume">Legume</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Fruit">Fruit</option>
                    <option value="Cash Crop">Cash Crop</option>
                    <option value="Tuber">Tuber</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., North Field"
                  />
                </div>
              </div>
            </div>

            {/* Dates & Planning */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Dates & Planning
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Planting Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="plantingDate"
                    value={formData.plantingDate}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Harvest Date
                  </label>
                  <input
                    type="date"
                    name="harvestDate"
                    value={formData.harvestDate}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Field & Yield */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Field & Yield
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Area <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="area"
                      value={formData.area}
                      onChange={handleChange}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <select
                      name="areaUnit"
                      value={formData.areaUnit}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="hectares">Ha</option>
                      <option value="acres">Acres</option>
                      <option value="square meters">m²</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expected Yield
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      name="expectedYield"
                      value={formData.expectedYield}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                      step="0.01"
                    />
                    <select
                      name="yieldUnit"
                      value={formData.yieldUnit}
                      onChange={handleChange}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="tons">Tons</option>
                      <option value="kg">Kg</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Farming Practices */}
            <div className="space-y-4 md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Farming Practices
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Seed Source
                  </label>
                  <input
                    type="text"
                    name="seedSource"
                    value={formData.seedSource}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="e.g., Kenya Seed Co."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Fertilizer Type
                  </label>
                  <select
                    name="fertilizerType"
                    value={formData.fertilizerType}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Select type</option>
                    <option value="organic">Organic</option>
                    <option value="chemical">Chemical</option>
                    <option value="mixed">Mixed</option>
                    <option value="none">None</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Irrigation Method
                </label>
                <select
                  name="irrigationMethod"
                  value={formData.irrigationMethod}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select method</option>
                  <option value="drip">Drip Irrigation</option>
                  <option value="sprinkler">Sprinkler</option>
                  <option value="furrow">Furrow</option>
                  <option value="rainfed">Rain-fed</option>
                  <option value="center-pivot">Center Pivot</option>
                </select>
              </div>
            </div>

            {/* Progress & Health */}
            {editingCrop && (
              <div className="space-y-4 md:col-span-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Progress & Health
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Progress (%)
                    </label>
                    <input
                      type="range"
                      name="progress"
                      value={formData.progress}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="5"
                      className="w-full"
                    />
                    <div className="text-right text-sm font-medium text-emerald-600 dark:text-emerald-400">
                      {formData.progress}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Crop Health
                    </label>
                    <select
                      name="health"
                      value={formData.health}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="none">Not Started</option>
                      <option value="good">Good - Healthy</option>
                      <option value="warning">Warning - Needs Attention</option>
                      <option value="poor">Poor - Critical</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Notes */}
            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Additional Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Add any additional information about your crop..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-2"
            >
              <Save size={18} />
              {editingCrop ? 'Update Crop' : 'Add Crop'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Enhanced Crop Card Component
const EnhancedCropCard = ({ crop, onEdit, onDelete, onViewGuide, onUpdateProgress }) => {
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [quickProgress, setQuickProgress] = useState(crop.progress || 0);

  const handleProgressUpdate = () => {
    onUpdateProgress(crop._id, quickProgress, crop.health || 'good');
    setShowQuickActions(false);
  };

  const getHealthColor = (health) => {
    switch (health) {
      case 'good': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const getHealthLabel = (health) => {
    switch (health) {
      case 'good': return 'Healthy';
      case 'warning': return 'Needs Attention';
      case 'poor': return 'Critical';
      default: return 'Not Started';
    }
  };

  const getDaysRemaining = () => {
    if (!crop.harvestDate) return null;
    const days = Math.ceil((new Date(crop.harvestDate) - new Date()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const daysRemaining = getDaysRemaining();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
      {/* Header with Status */}
      <div className="relative p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${
              crop.health === 'good' ? 'from-green-500 to-emerald-500' :
              crop.health === 'warning' ? 'from-yellow-500 to-amber-500' :
              crop.health === 'poor' ? 'from-red-500 to-rose-500' :
              'from-gray-500 to-gray-600'
            } flex items-center justify-center text-white text-xl shadow-lg`}>
              {crop.icon || '🌾'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{crop.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Sprout className="w-3 h-3" />
                {crop.type} • {crop.variety || 'Standard'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getHealthColor(crop.health)}/20 text-${getHealthColor(crop.health).replace('bg-', '')}`}>
              {getHealthLabel(crop.health)}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowQuickActions(!showQuickActions)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" />
              </button>
              
              {showQuickActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-10">
                  <div className="p-3">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">Quick Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => onViewGuide(crop)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <BookOpen className="w-4 h-4" />
                        View Guide
                      </button>
                      <button
                        onClick={() => onEdit(crop)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                        Edit Details
                      </button>
                      <button
                        onClick={() => onDelete(crop._id)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                    <label className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                      Update Progress
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={quickProgress}
                      onChange={(e) => setQuickProgress(parseInt(e.target.value))}
                      className="w-full"
                    />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-gray-500">{quickProgress}%</span>
                      <button
                        onClick={handleProgressUpdate}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600 text-white px-2 py-1 rounded"
                      >
                        Update
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        {crop.location && (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3 h-3" />
            {crop.location}
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="px-5 py-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{crop.progress || 0}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${crop.progress || 0}%` }}
          />
        </div>
      </div>

      {/* Dates */}
      <div className="px-5 py-3 bg-gray-50 dark:bg-gray-700/50">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Planted</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'Planning'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Harvest</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {crop.harvestDate ? new Date(crop.harvestDate).toLocaleDateString() : 'Planning'}
              </p>
            </div>
          </div>
        </div>

        {daysRemaining !== null && daysRemaining > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs">
            <span className="text-gray-500 dark:text-gray-400">Days to harvest</span>
            <span className="font-bold text-blue-600 dark:text-blue-400">{daysRemaining} days</span>
          </div>
        )}
      </div>

      {/* Field Info */}
      <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Area</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {crop.area} {crop.areaUnit || 'ha'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Expected</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {crop.expectedYield || '-'} {crop.yieldUnit || 'tons'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewGuide(crop)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/25"
          >
            <BookOpen className="w-4 h-4" />
            View Guide
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tips */}
        {crop.quickTips && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {crop.quickTips}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main MyCrops Component
const MyCrops = () => {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [cropStats, setCropStats] = useState(null);
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedGuideUserCrop, setSelectedGuideUserCrop] = useState(null);
  const [showImprovementModal, setShowImprovementModal] = useState(false);
  const [improvementCrop, setImprovementCrop] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [filterHealth, setFilterHealth] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
// Add this function inside MyCrops component
const handleEditCrop = (crop) => {
  setEditingCrop(crop);
  setShowAddModal(true);
};
  // Available crops data for guide matching
  const availableCrops = cropsData.crops;

  // Match user crop name with available guides
  const findMatchingGuide = (cropName) => {
    if (!cropName) return null;
    
    const normalizedName = cropName.toLowerCase().trim();
    
    // Direct match
    const directMatch = availableCrops.find(
      c => c.name.toLowerCase().includes(normalizedName) || 
           normalizedName.includes(c.name.toLowerCase().split(' ')[0])
    );
    
    if (directMatch) return directMatch;
    
    // Partial match with common crop variations
    const cropVariations = {
      'maize': 'Maize (Corn)',
      'corn': 'Maize (Corn)',
      'coffee': 'Coffee Arabica',
      'tomato': 'Tomatoes',
      'tomatoes': 'Tomatoes',
      'potato': 'Potatoes',
      'potatoes': 'Potatoes',
      'wheat': 'Wheat',
      'rice': 'Rice',
      'beans': 'Beans',
      'peas': 'Peas',
      'onion': 'Onions',
      'onions': 'Onions',
      'cabbage': 'Cabbage',
      'carrot': 'Carrots',
      'carrots': 'Carrots',
    };
    
    const variation = cropVariations[normalizedName];
    if (variation) {
      return availableCrops.find(c => c.name.toLowerCase().includes(variation.toLowerCase()));
    }
    
    // Fuzzy match - find closest crop name
    let bestMatch = null;
    let bestScore = 0;
    
    availableCrops.forEach(c => {
      const cropNameLower = c.name.toLowerCase();
      let score = 0;
      
      if (cropNameLower.includes(normalizedName)) score += 10;
      if (normalizedName.includes(cropNameLower)) score += 8;
      
      // Check for common prefixes
      const normalizedPrefix = normalizedName.split(' ')[0];
      const cropPrefix = cropNameLower.split(' ')[0];
      if (normalizedPrefix === cropPrefix) score += 5;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    });
    
    return bestMatch;
  };

  // Get quick tips for a crop
  const getQuickTips = (cropName) => {
    const guide = findMatchingGuide(cropName);
    if (!guide || !guide.stages) return null;
    
    // Get tips from growth stage
    const growthStage = guide.stages.growth || guide.stages.planting || [];
    if (growthStage.length > 0) {
      return growthStage[0].tips.slice(0, 1)[0];
    }
    return null;
  };

  // Fetch crops on component mount
  useEffect(() => {
    fetchCrops();
    fetchCropStats();
  }, []);

  const fetchCrops = async () => {
    try {
      setLoading(true);
      const response = await cropAPI.getFarmerCrops();
      if (response.data.success) {
        // Add quick tips to crops
        const cropsWithTips = response.data.data.map(crop => ({
          ...crop,
          quickTips: getQuickTips(crop.name)
        }));
        setCrops(cropsWithTips);
      }
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCropStats = async () => {
    try {
      const response = await cropAPI.getCropStats();
      if (response.data.success) {
        setCropStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching crop stats:', error);
    }
  };

  const handleUpdateProgress = async (cropId, progress, health) => {
    try {
      await cropAPI.updateCropProgress(cropId, { progress, health });
      fetchCrops();
      fetchCropStats();
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    }
  };

  // Filter and sort crops
  const filteredCrops = crops
    .filter(crop => {
      // Search filter
      const matchesSearch = crop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        crop.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (crop.variety && crop.variety.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Tab filter
      const matchesTab = 
        activeTab === 'all' || 
        (activeTab === 'active' && crop.progress < 100) ||
        (activeTab === 'completed' && crop.progress >= 100) ||
        (activeTab === 'planning' && crop.status === 'planning');
      
      // Health filter
      const matchesHealth = 
        filterHealth === 'all' || 
        crop.health === filterHealth;
      
      // Category filter
      const matchesCategory = 
        selectedCategory === 'all' || 
        crop.type === selectedCategory;
      
      return matchesSearch && matchesTab && matchesHealth && matchesCategory;
    })
    .sort((a, b) => {
      switch(sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'progress-high':
          return (b.progress || 0) - (a.progress || 0);
        case 'progress-low':
          return (a.progress || 0) - (b.progress || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'harvest-soon':
          return (new Date(a.harvestDate || '2099-12-31')) - (new Date(b.harvestDate || '2099-12-31'));
        default:
          return 0;
      }
    });

  // Calculate stats
  const totalCrops = crops.length;
  const activeCrops = crops.filter(c => c.progress < 100 && c.progress > 0).length;
  const completedCrops = crops.filter(c => c.progress >= 100).length;
  const planningCrops = crops.filter(c => c.status === 'planning').length;
  const totalArea = crops.reduce((sum, crop) => sum + (parseFloat(crop.area) || 0), 0);
  const healthyCrops = crops.filter(c => c.health === 'good').length;
  const warningCrops = crops.filter(c => c.health === 'warning').length;

  const handleSaveCrop = async (formData) => {
    try {
      const cropData = {
        ...formData,
        plantingDate: formData.plantingDate || new Date().toISOString().split('T')[0],
        harvestDate: formData.harvestDate || null,
        progress: editingCrop ? formData.progress : 0,
        health: editingCrop ? formData.health : 'none'
      };

      if (editingCrop) {
        await cropAPI.updateCrop(editingCrop._id, cropData);
      } else {
        await cropAPI.createCrop(cropData);
      }

      fetchCrops();
      fetchCropStats();
      setShowAddModal(false);
      setEditingCrop(null);
    } catch (error) {
      const errorData = apiUtils.handleError(error);
      setError(errorData.message);
    }
  };

  const handleDeleteCrop = async (cropId) => {
    if (window.confirm('Are you sure you want to delete this crop? This action cannot be undone.')) {
      try {
        await cropAPI.deleteCrop(cropId);
        fetchCrops();
        fetchCropStats();
      } catch (error) {
        const errorData = apiUtils.handleError(error);
        setError(errorData.message);
      }
    }
  };

  const handleViewGuide = (crop) => {
    const guide = findMatchingGuide(crop.name);
    if (guide) {
      setSelectedGuide(guide);
      setSelectedGuideUserCrop(crop);
    } else {
      alert(`📚 No guide available for "${crop.name}" yet. We're working on adding more crops! You can suggest improvements to help us create it.`);
    }
  };

  const handleSuggestImprovement = (crop) => {
    setImprovementCrop(crop);
    setShowImprovementModal(true);
  };

  const handleImprovementSubmit = (improvement) => {
    console.log('Improvement submitted:', improvement);
    setShowImprovementModal(false);
    setImprovementCrop(null);
    // Show success message
    alert('Thank you for your suggestion! We\'ll review it soon.');
  };

  // Get unique crop types for filter
  const cropTypes = ['all', ...new Set(crops.map(c => c.type))];

  return (
    <div className="space-y-6 pb-8">
      {/* Header with Enhanced Stats */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center shadow-lg">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Crops</h2>
                <p className="text-gray-600 dark:text-gray-400">Manage and track your crop progress</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title={viewMode === 'grid' ? 'Switch to list view' : 'Switch to grid view'}
            >
              {viewMode === 'grid' ? '📋' : '📱'}
            </button>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            <button
              onClick={() => {
                setEditingCrop(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              Add Crop
            </button>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6">
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-emerald-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Crops</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCrops}</p>
              </div>
              <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-blue-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{activeCrops}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-green-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Harvested</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{completedCrops}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

      

          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-gray-700 dark:to-gray-800 rounded-xl p-4 border border-amber-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Area</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{totalArea.toFixed(1)} ha</p>
              </div>
              <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>

         
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search crops by name, type, or variety..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="progress-high">Progress: High to Low</option>
              <option value="progress-low">Progress: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
              <option value="harvest-soon">Harvest Soon</option>
            </select>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Crop Type
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {cropTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'all' ? 'All Types' : type}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Health Status
                </label>
                <select
                  value={filterHealth}
                  onChange={(e) => setFilterHealth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="all">All Health Status</option>
                  <option value="good">Healthy</option>
                  <option value="warning">Needs Attention</option>
                  <option value="poor">Critical</option>
                  <option value="none">Not Started</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quick Filter
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      activeTab === 'all'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setActiveTab('active')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      activeTab === 'active'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    onClick={() => setActiveTab('completed')}
                    className={`flex-1 px-3 py-2 rounded-lg text-sm ${
                      activeTab === 'completed'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Crops Grid/List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your crops...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">Error Loading Crops</h3>
          <p className="text-red-600 dark:text-red-300">{error}</p>
          <button
            onClick={fetchCrops}
            className="mt-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Try Again
          </button>
        </div>
      ) : filteredCrops.length > 0 ? (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {filteredCrops.map((crop) => (
            <EnhancedCropCard
              key={crop._id}
              crop={crop}
              onEdit={handleEditCrop}
              onDelete={handleDeleteCrop}
              onViewGuide={handleViewGuide}
              onUpdateProgress={handleUpdateProgress}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Sprout className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Crops Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {searchTerm || activeTab !== 'all' || filterHealth !== 'all' 
              ? "Try adjusting your filters or search terms" 
              : "Start by adding your first crop"}
          </p>
          <button
            onClick={() => {
              setEditingCrop(null);
              setShowAddModal(true);
            }}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white rounded-lg transition-all shadow-lg shadow-emerald-500/25"
          >
            <Plus className="w-5 h-5" />
            Add Your First Crop
          </button>
        </div>
      )}

      {/* Modals */}
      <AddCropModal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setEditingCrop(null);
        }}
        onSave={handleSaveCrop}
        editingCrop={editingCrop}
      />

      {selectedGuide && (
        <CropStagesVisualization
          crop={selectedGuide}
          onClose={() => {
            setSelectedGuide(null);
            setSelectedGuideUserCrop(null);
          }}
          onSuggestImprovement={handleSuggestImprovement}
          userCrop={selectedGuideUserCrop}
          onUpdateProgress={handleUpdateProgress}
        />
      )}

      {showImprovementModal && improvementCrop && (
        <SuggestImprovementModal
          crop={improvementCrop}
          onClose={() => {
            setShowImprovementModal(false);
            setImprovementCrop(null);
          }}
          onSubmit={handleImprovementSubmit}
        />
      )}
    </div>
  );
};

export default MyCrops;