// backend/routes/dbRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// In-memory store for metrics history (use Redis in production)
const metricsHistory = [];

// Start collecting metrics
setInterval(async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    const serverStatus = await db.admin().serverStatus();
    
    metricsHistory.push({
      timestamp: new Date(),
      collections: stats.collections,
      objects: stats.objects,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexSize: stats.indexSize,
      connections: serverStatus.connections.current,
      operations: { ...serverStatus.opcounters }
    });
    
    // Keep only last 1000 data points (approx 16 hours)
    if (metricsHistory.length > 1000) {
      metricsHistory.shift();
    }
  } catch (err) {
    console.error("Error collecting metrics:", err);
  }
}, 60000); // Collect every minute

// Helper function to analyze document schema
const analyzeSchema = (docs) => {
  if (!docs.length) return {};
  
  const fieldTypes = {};
  docs.forEach(doc => {
    Object.entries(doc).forEach(([key, value]) => {
      if (!fieldTypes[key]) fieldTypes[key] = new Set();
      fieldTypes[key].add(typeof value);
      
      // Detect arrays and null values
      if (Array.isArray(value)) fieldTypes[key].add('array');
      if (value === null) fieldTypes[key].add('null');
    });
  });
  
  return Object.fromEntries(
    Object.entries(fieldTypes).map(([key, types]) => [
      key, Array.from(types)
    ])
  );
};

// 📊 GET /api/db/stats → General database stats
router.get("/stats", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    const serverStatus = await db.admin().serverStatus();

    res.json({
      dbName: stats.db,
      collections: stats.collections,
      objects: stats.objects,
      avgObjSize: stats.avgObjSize,
      dataSize: stats.dataSize,
      storageSize: stats.storageSize,
      indexes: stats.indexes,
      indexSize: stats.indexSize,
      totalSize: stats.storageSize + stats.indexSize,

      // 🧠 System-level info
      uptime: serverStatus.uptime,
      host: serverStatus.host,
      version: serverStatus.version,
      connections: serverStatus.connections,
      mem: serverStatus.mem,
      opcounters: serverStatus.opcounters,
    });
  } catch (err) {
    console.error("Error fetching DB stats:", err);
    res.status(500).json({
      message: "Failed to get DB stats",
      error: err.message,
    });
  }
});

// 🗃️ GET /api/db/collections → Per-collection stats
router.get("/collections", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const statsPromises = collections.map(async (col) => {
      const colStats = await db.collection(col.name).stats();
      return {
        name: col.name,
        count: colStats.count,
        storageSize: colStats.storageSize,
        totalIndexSize: colStats.totalIndexSize,
        avgObjSize: colStats.avgObjSize,
        dataSize: colStats.size,
      };
    });

    const result = await Promise.all(statsPromises);

    // 🧮 Add relative percentages for better frontend insights
    const totalStorage = result.reduce((sum, c) => sum + c.storageSize, 0);
    const enhanced = result.map((col) => ({
      ...col,
      storagePct: totalStorage > 0 ? ((col.storageSize / totalStorage) * 100).toFixed(2) : "0.00",
    }));

    res.json(enhanced);
  } catch (err) {
    console.error("Error fetching collection stats:", err);
    res.status(500).json({
      message: "Failed to get collection stats",
      error: err.message,
    });
  }
});

// 🔍 GET /api/db/collections/:name/details → Detailed collection analysis
router.get("/collections/:name/details", async (req, res) => {
  try {
    const { name } = req.params;
    const db = mongoose.connection.db;
    const collection = db.collection(name);
    
    const [stats, indexInfo, sampleDocs] = await Promise.all([
      collection.stats(),
      collection.indexes(),
      collection.find().limit(5).toArray()
    ]);

    res.json({
      name,
      stats: {
        size: stats.size,
        storageSize: stats.storageSize,
        totalIndexSize: stats.totalIndexSize,
        avgObjSize: stats.avgObjSize,
        count: stats.count,
        capped: stats.capped || false,
        max: stats.max || null,
        maxSize: stats.maxSize || null,
      },
      indexes: indexInfo.map(idx => ({
        name: idx.name,
        key: idx.key,
        size: idx.size || 0,
        unique: idx.unique || false,
        sparse: idx.sparse || false,
        background: idx.background || false
      })),
      sampleDocuments: sampleDocs,
      schemaAnalysis: analyzeSchema(sampleDocs)
    });
  } catch (err) {
    console.error("Error fetching collection details:", err);
    res.status(500).json({ 
      message: "Failed to get collection details", 
      error: err.message 
    });
  }
});

// ⚙️ GET /api/db/server → MongoDB server info
router.get("/server", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const status = await db.admin().serverStatus();

    res.json({
      host: status.host,
      version: status.version,
      process: status.process,
      uptime: status.uptime,
      connections: status.connections,
      network: status.network,
      mem: status.mem,
      opcounters: status.opcounters,
    });
  } catch (err) {
    console.error("Error fetching server info:", err);
    res.status(500).json({ 
      message: "Failed to get server info", 
      error: err.message 
    });
  }
});

// 📈 GET /api/db/performance/slow-queries → Recent slow queries
router.get("/performance/slow-queries", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const profileCollection = db.collection('system.profile');
    
    const slowQueries = await profileCollection
      .find({ millis: { $gt: 100 } }) // queries slower than 100ms
      .sort({ ts: -1 })
      .limit(20)
      .toArray();

    const formattedQueries = slowQueries.map(query => ({
      op: query.op,
      namespace: query.ns,
      duration: query.millis,
      timestamp: query.ts,
      command: query.command,
      planSummary: query.planSummary,
      docsExamined: query.docsExamined,
      keysExamined: query.keysExamined,
      nreturned: query.nreturned
    }));

    res.json(formattedQueries);
  } catch (err) {
    console.error("Error fetching slow queries:", err);
    res.status(500).json({ 
      message: "Failed to get slow queries", 
      error: err.message 
    });
  }
});

// 📈 GET /api/db/performance/operations → Operation counters
router.get("/performance/operations", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const status = await db.admin().serverStatus();
    
    res.json({
      operations: {
        insert: status.opcounters?.insert || 0,
        query: status.opcounters?.query || 0,
        update: status.opcounters?.update || 0,
        delete: status.opcounters?.delete || 0,
        getmore: status.opcounters?.getmore || 0,
        command: status.opcounters?.command || 0
      },
      current: status.metrics?.commands || {},
      connections: status.connections,
      network: {
        bytesIn: status.network?.bytesIn || 0,
        bytesOut: status.network?.bytesOut || 0,
        numRequests: status.network?.numRequests || 0
      }
    });
  } catch (err) {
    console.error("Error fetching operation stats:", err);
    res.status(500).json({ 
      message: "Failed to get operation stats", 
      error: err.message 
    });
  }
});

// 🗂️ GET /api/db/indexes → All indexes across collections
router.get("/indexes", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    const indexesPromises = collections.map(async (col) => {
      try {
        const indexes = await db.collection(col.name).indexes();
        return {
          collection: col.name,
          indexes: indexes.map(idx => ({
            name: idx.name,
            key: idx.key,
            size: idx.size || 0,
            unique: idx.unique || false,
            sparse: idx.sparse || false,
            background: idx.background || false
          }))
        };
      } catch (err) {
        return { 
          collection: col.name, 
          indexes: [], 
          error: err.message 
        };
      }
    });

    const result = await Promise.all(indexesPromises);
    res.json(result);
  } catch (err) {
    console.error("Error fetching indexes:", err);
    res.status(500).json({ 
      message: "Failed to get indexes", 
      error: err.message 
    });
  }
});

// 🗂️ DELETE /api/db/indexes/:collection/:index → Drop specific index
router.delete("/indexes/:collection/:index", async (req, res) => {
  try {
    const { collection, index } = req.params;
    const db = mongoose.connection.db;
    
    // Prevent dropping _id index
    if (index === '_id_') {
      return res.status(400).json({ 
        message: "Cannot drop _id index" 
      });
    }
    
    await db.collection(collection).dropIndex(index);
    res.json({ 
      message: `Index ${index} dropped successfully from ${collection}` 
    });
  } catch (err) {
    console.error("Error dropping index:", err);
    res.status(500).json({ 
      message: "Failed to drop index", 
      error: err.message 
    });
  }
});

// 🔔 GET /api/db/health → Comprehensive health check
router.get("/health", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const [stats, serverStatus, replStatus] = await Promise.all([
      db.stats(),
      db.admin().serverStatus(),
      db.admin().replSetGetStatus().catch(() => ({ 
        isReplicaSet: false,
        message: "Not a replica set or no access" 
      }))
    ]);

    const health = {
      status: "healthy",
      timestamp: new Date(),
      database: {
        name: stats.db,
        collections: stats.collections,
        dataSize: stats.dataSize,
        storageSize: stats.storageSize,
        isDataSizeValid: stats.dataSize <= stats.storageSize
      },
      server: {
        version: serverStatus.version,
        uptime: serverStatus.uptime,
        connections: {
          current: serverStatus.connections.current,
          available: serverStatus.connections.available,
          healthy: serverStatus.connections.current < serverStatus.connections.available * 0.8
        }
      },
      memory: {
        resident: serverStatus.mem.resident,
        virtual: serverStatus.mem.virtual,
        mapped: serverStatus.mem.mapped,
        healthy: serverStatus.mem.resident < serverStatus.mem.virtual * 0.9
      },
      replication: replStatus
    };

    // Overall health assessment
    const issues = [];
    if (!health.database.isDataSizeValid) issues.push("Data size exceeds storage size");
    if (!health.server.connections.healthy) issues.push("High connection usage");
    if (!health.memory.healthy) issues.push("High memory usage");

    if (issues.length > 0) {
      health.status = "degraded";
      health.issues = issues;
    }

    res.json(health);
  } catch (err) {
    console.error("Error in health check:", err);
    res.status(500).json({ 
      status: "unhealthy", 
      message: "Database health check failed", 
      error: err.message 
    });
  }
});

// 📊 GET /api/db/metrics/history → Historical metrics
router.get("/metrics/history", async (req, res) => {
  try {
    const { hours = 24, limit = 100 } = req.query;
    const cutoffTime = new Date(Date.now() - (hours * 60 * 60 * 1000));
    
    const filteredMetrics = metricsHistory
      .filter(metric => new Date(metric.timestamp) > cutoffTime)
      .slice(-limit); // Return most recent data points

    res.json({
      timeframe: `${hours} hours`,
      dataPoints: filteredMetrics.length,
      metrics: filteredMetrics
    });
  } catch (err) {
    console.error("Error fetching metrics history:", err);
    res.status(500).json({ 
      message: "Failed to get metrics history", 
      error: err.message 
    });
  }
});

// 🧹 GET /api/db/maintenance/cleanup → Identify potential cleanup candidates
router.get("/maintenance/cleanup", async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    const analysisPromises = collections.map(async (col) => {
      const stats = await db.collection(col.name).stats();
      const indexes = await db.collection(col.name).indexes();
      
      return {
        collection: col.name,
        documentCount: stats.count,
        storageSize: stats.storageSize,
        indexCount: indexes.length,
        totalIndexSize: stats.totalIndexSize,
        avgObjSize: stats.avgObjSize,
        potentialIssues: []
      };
    });

    let results = await Promise.all(analysisPromises);
    
    // Analyze for potential issues
    results = results.map(col => {
      const issues = [];
      
      if (col.documentCount === 0 && col.storageSize > 0) {
        issues.push("Empty collection with allocated storage");
      }
      
      if (col.indexCount > 5) {
        issues.push("High number of indexes");
      }
      
      if (col.totalIndexSize > col.storageSize * 2) {
        issues.push("Index size significantly larger than data size");
      }
      
      if (col.avgObjSize > 1024 * 1024) { // 1MB
        issues.push("Large average document size");
      }
      
      return {
        ...col,
        potentialIssues: issues,
        recommendation: issues.length > 0 ? "Review recommended" : "Healthy"
      };
    });

    res.json(results);
  } catch (err) {
    console.error("Error in maintenance analysis:", err);
    res.status(500).json({ 
      message: "Failed to analyze maintenance needs", 
      error: err.message 
    });
  }
});

module.exports = router;