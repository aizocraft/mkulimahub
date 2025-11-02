import { useEffect, useState } from "react";
import axios from "axios";
import { useTheme } from "../context/ThemeContext";
import LoadingSpinner from "./LoadingSpinner";
import {
  Database,
  HardDrive,
  BarChart3,
  RefreshCw,
  Activity,
  Server,
  PieChart,
  LineChart,
  AlertTriangle,
  Cpu,
  Network,
  Shield,
  Zap,
  Search,
  Filter,
  Download
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const STORAGE_LIMIT_MB = 512;

const DbStats = () => {
  const { theme } = useTheme();
  const [dbStats, setDbStats] = useState(null);
  const [collections, setCollections] = useState([]);
  const [serverInfo, setServerInfo] = useState(null);
  const [healthStatus, setHealthStatus] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [metricsHistory, setMetricsHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionDetails, setCollectionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [dbRes, colRes, serverRes, healthRes, perfRes, metricsRes] = await Promise.all([
        axios.get(`${API_BASE}/db/stats`),
        axios.get(`${API_BASE}/db/collections`),
        axios.get(`${API_BASE}/db/server`),
        axios.get(`${API_BASE}/db/health`),
        axios.get(`${API_BASE}/db/performance/operations`),
        axios.get(`${API_BASE}/db/metrics/history?hours=6&limit=50`)
      ]);
      
      setDbStats(dbRes.data);
      setCollections(colRes.data);
      setServerInfo(serverRes.data);
      setHealthStatus(healthRes.data);
      setPerformanceData(perfRes.data);
      setMetricsHistory(metricsRes.data.metrics || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCollectionDetails = async (collectionName) => {
    try {
      const response = await axios.get(`${API_BASE}/db/collections/${collectionName}/details`);
      setCollectionDetails(response.data);
      setSelectedCollection(collectionName);
    } catch (err) {
      console.error("Error fetching collection details:", err);
    }
  };

  useEffect(() => {
    fetchAllData();
    let interval;
    if (autoRefresh) interval = setInterval(fetchAllData, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Filter collections based on search
  const filteredCollections = collections.filter(col => 
    col.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500 font-medium">
        ❌ {error}
      </div>
    );

  const usedMB = (dbStats?.storageSize + dbStats?.indexSize) / 1024 / 1024 || 0;
  const usagePercent = ((usedMB / STORAGE_LIMIT_MB) * 100).toFixed(1);
  const remainingMB = (STORAGE_LIMIT_MB - usedMB).toFixed(1);

  const usageColor = usagePercent < 60 ? "bg-emerald-500" : usagePercent < 85 ? "bg-yellow-500" : "bg-red-600";
  const isDark = theme === "dark";

  // Storage breakdown data
  const storageBreakdown = [
    { name: 'Data', size: dbStats?.dataSize / 1024 / 1024 || 0, color: '#10b981' },
    { name: 'Indexes', size: dbStats?.indexSize / 1024 / 1024 || 0, color: '#3b82f6' },
    { name: 'Free', size: Math.max(0, STORAGE_LIMIT_MB - usedMB), color: '#6b7280' }
  ];

  const operationsData = performanceData?.operations ? Object.entries(performanceData.operations).map(([key, value]) => ({
    name: key,
    value: value,
    color: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'][Object.keys(performanceData.operations).indexOf(key)]
  })) : [];

  return (
    <div className={`min-h-screen px-6 py-10 transition-colors duration-300 ${
      isDark ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-800"
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Database className="text-emerald-500" size={28} />
            Database Analytics
          </h1>
          <p className={`text-sm mt-1 ${isDark ? "text-gray-400" : "text-gray-500"}`}>
            Real-time MongoDB performance and collection insights
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-200 shadow-md"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
              autoRefresh
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : isDark
                ? "bg-gray-800 hover:bg-gray-700 text-gray-200"
                : "bg-gray-100 hover:bg-gray-200 text-gray-800"
            }`}
          >
            <Activity size={16} />
            {autoRefresh ? "Auto-Refresh ON" : "Auto-Refresh OFF"}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 mb-8 border-b border-gray-200 dark:border-gray-700">
        {["overview", "collections", "performance", "health", "schema"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all duration-200 ${
              activeTab === tab
                ? "bg-emerald-500 text-white"
                : isDark
                ? "text-gray-400 hover:text-gray-200"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Health Status Banner */}
          {healthStatus && (
            <div className={`p-4 rounded-lg border ${
              healthStatus.status === "healthy" 
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
                : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
            }`}>
              <div className="flex items-center gap-3">
                <Shield className={healthStatus.status === "healthy" ? "text-emerald-500" : "text-yellow-500"} />
                <div>
                  <h3 className="font-semibold">Database Status: {healthStatus.status.toUpperCase()}</h3>
                  {healthStatus.issues && (
                    <p className="text-sm opacity-80">Issues: {healthStatus.issues.join(", ")}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Database className="text-emerald-500" />
                <h3 className="font-semibold">Database</h3>
              </div>
              <p className="text-2xl font-bold">{dbStats?.dbName}</p>
              <p className="text-sm opacity-70">{dbStats?.collections} collections</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Cpu className="text-blue-500" />
                <h3 className="font-semibold">Operations</h3>
              </div>
              <p className="text-2xl font-bold">{dbStats?.opcounters?.command?.toLocaleString()}</p>
              <p className="text-sm opacity-70">Total commands</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Network className="text-purple-500" />
                <h3 className="font-semibold">Connections</h3>
              </div>
              <p className="text-2xl font-bold">{serverInfo?.connections?.current}</p>
              <p className="text-sm opacity-70">Active connections</p>
            </div>

            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <div className="flex items-center gap-3 mb-3">
                <Zap className="text-orange-500" />
                <h3 className="font-semibold">Uptime</h3>
              </div>
              <p className="text-2xl font-bold">{Math.round(serverInfo?.uptime / 3600)}h</p>
              <p className="text-sm opacity-70">Server runtime</p>
            </div>
          </div>

          {/* Storage Visualization - UPDATED to Progress Bar */}
          <div className={`rounded-2xl shadow-lg p-6 ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          }`}>
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <HardDrive className="text-emerald-500" />
              Storage Usage
            </h3>
            
            {/* Main Storage Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm mb-3">
                <span className="font-medium">Total Storage Usage</span>
                <span className="font-semibold">
                  {usedMB.toFixed(2)} MB / {STORAGE_LIMIT_MB} MB ({usagePercent}%)
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`${usageColor} h-4 rounded-full transition-all duration-500 ease-out`}
                  style={{ width: `${usagePercent}%` }}
                ></div>
              </div>
              <p className={`mt-2 text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
                {remainingMB > 0
                  ? `${remainingMB} MB remaining`
                  : "⚠️ Storage limit exceeded!"}
              </p>
            </div>

            {/* Storage Breakdown */}
            <div className="space-y-4">
              <h4 className="font-semibold text-sm uppercase tracking-wide opacity-70">
                Storage Breakdown
              </h4>
              
              {storageBreakdown.map((item) => {
                const itemPercent = ((item.size / STORAGE_LIMIT_MB) * 100).toFixed(1);
                return (
                  <div key={item.name} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        {item.size.toFixed(2)} MB ({itemPercent}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ 
                          width: `${itemPercent}%`,
                          backgroundColor: item.color
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Storage Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-center p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <div className="text-2xl font-bold text-emerald-500 mb-1">
                  {(dbStats?.dataSize / 1024 / 1024).toFixed(2)}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">Data Size (MB)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                <div className="text-2xl font-bold text-blue-500 mb-1">
                  {(dbStats?.indexSize / 1024 / 1024).toFixed(2)}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Index Size (MB)</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-500/10 border border-gray-500/20">
                <div className="text-2xl font-bold text-gray-500 mb-1">
                  {remainingMB}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Free Space (MB)</div>
              </div>
            </div>
          </div>

          {/* Operations Chart */}
          {operationsData.length > 0 && (
            <div className={`rounded-2xl shadow-lg p-6 ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <LineChart className="text-blue-500" />
                Operations Distribution
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {operationsData.map((op) => (
                  <div key={op.name} className="text-center p-4 rounded-lg bg-opacity-10 border" 
                    style={{ 
                      backgroundColor: `${op.color}20`,
                      borderColor: `${op.color}40`
                    }}>
                    <div className="text-2xl font-bold mb-1" style={{ color: op.color }}>
                      {op.value.toLocaleString()}
                    </div>
                    <div className="text-sm capitalize" style={{ color: op.color }}>
                      {op.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collections Tab */}
      {activeTab === "collections" && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="flex gap-4 items-center">
            <div className={`flex-1 max-w-md relative ${
              isDark ? "bg-gray-800" : "bg-white"
            } rounded-lg border border-gray-300 dark:border-gray-600`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search collections..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-transparent border-none focus:outline-none"
              />
            </div>
            <button className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-white hover:bg-gray-100"
            } border border-gray-300 dark:border-gray-600`}>
              <Filter size={16} />
              Filter
            </button>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCollections.map((collection) => (
              <div
                key={collection.name}
                className={`p-6 rounded-2xl shadow-lg cursor-pointer transition-all duration-200 hover:scale-105 ${
                  selectedCollection === collection.name
                    ? "ring-2 ring-emerald-500"
                    : isDark
                    ? "bg-gray-800 border border-gray-700"
                    : "bg-white border border-gray-200"
                }`}
                onClick={() => fetchCollectionDetails(collection.name)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg truncate">{collection.name}</h3>
                  <div className={`px-2 py-1 rounded text-xs ${
                    collection.storagePct > 20 
                      ? "bg-red-500/20 text-red-500" 
                      : collection.storagePct > 10
                      ? "bg-yellow-500/20 text-yellow-500"
                      : "bg-emerald-500/20 text-emerald-500"
                  }`}>
                    {collection.storagePct}%
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Documents:</span>
                    <span className="font-semibold">{collection.count.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Storage:</span>
                    <span className="font-semibold">{(collection.storageSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Indexes:</span>
                    <span className="font-semibold">{(collection.totalIndexSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>

                {/* Collection Storage Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Storage Usage</span>
                    <span>{(collection.storageSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-emerald-500 transition-all duration-500 ease-out"
                      style={{ width: `${Math.min(100, (collection.storageSize / dbStats?.storageSize) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Collection Details Modal */}
          {collectionDetails && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className={`rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
                isDark ? "bg-gray-800" : "bg-white"
              }`}>
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <h3 className="text-xl font-semibold">Collection: {collectionDetails.name}</h3>
                  <button
                    onClick={() => setCollectionDetails(null)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="p-6 space-y-6">
                  {/* Schema Analysis */}
                  <div>
                    <h4 className="font-semibold mb-3">Schema Analysis</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(collectionDetails.schemaAnalysis || {}).map(([field, types]) => (
                        <div key={field} className={`p-3 rounded-lg ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}>
                          <div className="font-medium">{field}</div>
                          <div className="text-sm opacity-70">{types.join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Indexes */}
                  <div>
                    <h4 className="font-semibold mb-3">Indexes ({collectionDetails.indexes?.length || 0})</h4>
                    <div className="space-y-2">
                      {collectionDetails.indexes?.map((index, idx) => (
                        <div key={idx} className={`p-3 rounded-lg ${
                          isDark ? "bg-gray-700" : "bg-gray-100"
                        }`}>
                          <div className="font-medium">{index.name}</div>
                          <div className="text-sm opacity-70">
                            Keys: {JSON.stringify(index.key)} • 
                            {index.unique && " Unique"} • 
                            {index.sparse && " Sparse"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remaining tabs (Performance, Health) remain the same as previous version */}
      {/* Performance Tab */}
      {activeTab === "performance" && performanceData && (
        <div className="space-y-6">
          <div className={`rounded-2xl shadow-lg p-6 ${
            isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
          }`}>
            <h3 className="text-lg font-semibold mb-4">Real-time Operations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(performanceData.operations || {}).map(([key, value]) => (
                <div key={key} className="text-center p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <div className="text-2xl font-bold text-blue-500 mb-1">
                    {value.toLocaleString()}
                  </div>
                  <div className="text-sm capitalize text-blue-600 dark:text-blue-400">
                    {key}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Network Metrics */}
          {performanceData.network && (
            <div className={`rounded-2xl shadow-lg p-6 ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <h3 className="text-lg font-semibold mb-4">Network Activity</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="text-2xl font-bold text-green-500 mb-1">
                    {(performanceData.network.bytesIn / 1024 / 1024).toFixed(2)}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">MB In</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <div className="text-2xl font-bold text-purple-500 mb-1">
                    {(performanceData.network.bytesOut / 1024 / 1024).toFixed(2)}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">MB Out</div>
                </div>
                <div className="text-center p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="text-2xl font-bold text-orange-500 mb-1">
                    {performanceData.network.numRequests?.toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-600 dark:text-orange-400">Requests</div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Health Tab */}
      {activeTab === "health" && healthStatus && (
        <div className="space-y-6">
          <div className={`p-6 rounded-2xl shadow-lg ${
            healthStatus.status === "healthy" 
              ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800"
              : "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${
                healthStatus.status === "healthy" ? "bg-emerald-500" : "bg-yellow-500"
              }`}>
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Database Health: {healthStatus.status.toUpperCase()}</h3>
                <p className="opacity-80">Last checked: {new Date(healthStatus.timestamp).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Database Health */}
            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Database className="text-blue-500" />
                Database
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Data Size Valid:</span>
                  <span className={healthStatus.database?.isDataSizeValid ? "text-emerald-500" : "text-red-500"}>
                    {healthStatus.database?.isDataSizeValid ? "✓" : "✗"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Collections:</span>
                  <span>{healthStatus.database?.collections}</span>
                </div>
              </div>
            </div>

            {/* Connections Health */}
            <div className={`p-6 rounded-2xl shadow-lg ${
              isDark ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
            }`}>
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Network className="text-purple-500" />
                Connections
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className={healthStatus.server?.connections?.healthy ? "text-emerald-500" : "text-red-500"}>
                    {healthStatus.server?.connections?.healthy ? "Healthy" : "High Usage"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current:</span>
                  <span>{healthStatus.server?.connections?.current}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span>{healthStatus.server?.connections?.available}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DbStats;