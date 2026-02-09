const axios = require('axios');

class StunTurnService {
  constructor() {
    // Free STUN servers (you can add your own TURN servers for production)
    this.stunServers = [
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ];
    
    // For production, use paid TURN servers (Twilio, Xirsys, etc.)
    this.turnServers = [];
  }

  // Get WebRTC configuration
  getRTCConfiguration() {
    return {
      iceServers: [
        ...this.stunServers,
        ...this.turnServers
      ],
      iceCandidatePoolSize: 10
    };
  }

  // Generate TURN credentials (for paid services)
  async generateTurnCredentials() {
    try {
      // Example with Xirsys service
      if (process.env.XIRSYS_USERNAME && process.env.XIRSYS_SECRET) {
        const response = await axios.get(
          `https://global.xirsys.net/_turn/consultation-app`,
          {
            auth: {
              username: process.env.XIRSYS_USERNAME,
              password: process.env.XIRSYS_SECRET
            }
          }
        );
        
        if (response.data && response.data.v && response.data.v.iceServers) {
          return response.data.v.iceServers;
        }
      }
      
      return this.stunServers;
    } catch (error) {
      console.error('Error generating TURN credentials:', error);
      return this.stunServers;
    }
  }
}

module.exports = new StunTurnService();