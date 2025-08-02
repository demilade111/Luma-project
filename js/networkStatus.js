// Network Status Indicator Component
class NetworkStatusIndicator {
  constructor() {
    this.isOnline = navigator.onLine;
    this.indicator = null;
    this.init();
  }

  init() {
    this.createIndicator();
    this.setupEventListeners();
    this.updateStatus();
  }

  createIndicator() {
    // Create network status indicator
    this.indicator = document.createElement('div');
    this.indicator.id = 'network-status-indicator';
    this.indicator.className = 'fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 transform -translate-y-full';
    
    this.indicator.innerHTML = `
      <div class="network-icon">
        <i class="fas fa-wifi text-sm"></i>
      </div>
      <span class="network-text text-sm font-medium"></span>
      <button class="network-close ml-2 text-xs opacity-70 hover:opacity-100">
        <i class="fas fa-times"></i>
      </button>
    `;

    // Add to page
    document.body.appendChild(this.indicator);

    // Setup close button
    const closeBtn = this.indicator.querySelector('.network-close');
    closeBtn.addEventListener('click', () => {
      this.hide();
    });
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.updateStatus();
      this.show('You are back online!', 'success');
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.updateStatus();
      this.show('You are offline. Some features may be limited.', 'warning');
    });
  }

  updateStatus() {
    const icon = this.indicator.querySelector('.network-icon i');
    const text = this.indicator.querySelector('.network-text');

    if (this.isOnline) {
      icon.className = 'fas fa-wifi text-sm text-green-500';
      text.textContent = 'Online';
      text.className = 'network-text text-sm font-medium text-green-700';
    } else {
      icon.className = 'fas fa-wifi-slash text-sm text-yellow-500';
      text.textContent = 'Offline';
      text.className = 'network-text text-sm font-medium text-yellow-700';
    }
  }

  show(message, type = 'info') {
    const text = this.indicator.querySelector('.network-text');
    const icon = this.indicator.querySelector('.network-icon i');

    // Update colors based on type
    const colors = {
      success: { icon: 'text-green-500', text: 'text-green-700', bg: 'bg-green-100 border-green-300' },
      warning: { icon: 'text-yellow-500', text: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
      error: { icon: 'text-red-500', text: 'text-red-700', bg: 'bg-red-100 border-red-300' },
      info: { icon: 'text-blue-500', text: 'text-blue-700', bg: 'bg-blue-100 border-blue-300' }
    };

    const colorScheme = colors[type] || colors.info;
    
    icon.className = `fas fa-wifi text-sm ${colorScheme.icon}`;
    text.className = `network-text text-sm font-medium ${colorScheme.text}`;
    text.textContent = message;
    
    this.indicator.className = `fixed top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg shadow-lg transition-all duration-300 border ${colorScheme.bg}`;

    // Show indicator
    this.indicator.style.transform = 'translateY(0)';
    this.indicator.style.opacity = '1';

    // Auto-hide after 5 seconds for success messages
    if (type === 'success') {
      setTimeout(() => {
        this.hide();
      }, 5000);
    }
  }

  hide() {
    this.indicator.style.transform = 'translateY(-100%)';
    this.indicator.style.opacity = '0';
  }

  // Get current network status
  getStatus() {
    return {
      isOnline: this.isOnline,
      connectionType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
      downlink: navigator.connection ? navigator.connection.downlink : null,
      rtt: navigator.connection ? navigator.connection.rtt : null
    };
  }

  // Show offline mode information
  showOfflineInfo() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md mx-4">
        <div class="flex items-center gap-3 mb-4">
          <i class="fas fa-wifi-slash text-2xl text-yellow-500"></i>
          <h3 class="text-lg font-semibold">Offline Mode</h3>
        </div>
        <p class="text-gray-600 mb-4">
          You're currently offline. Here's what you can still do:
        </p>
        <ul class="text-sm text-gray-600 mb-6 space-y-2">
          <li class="flex items-center gap-2">
            <i class="fas fa-check text-green-500"></i>
            Browse cached games and events
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check text-green-500"></i>
            View your bookmarks and profile
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-check text-green-500"></i>
            Access tutorials and game rules
          </li>
          <li class="flex items-center gap-2">
            <i class="fas fa-clock text-yellow-500"></i>
            Queue actions for when you're back online
          </li>
        </ul>
        <div class="flex gap-3">
          <button class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">
            Got it
          </button>
          <button class="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Close on background click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
  }

  // Show cache statistics
  async showCacheStats() {
    if (window.offlineManager) {
      const stats = await window.offlineManager.getCacheStats();
      
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      modal.innerHTML = `
        <div class="bg-white rounded-lg p-6 max-w-md mx-4">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-database text-2xl text-blue-500"></i>
            <h3 class="text-lg font-semibold">Cache Statistics</h3>
          </div>
          <div class="space-y-3 mb-6">
            <div class="flex justify-between">
              <span class="text-gray-600">Cached Collections:</span>
              <span class="font-semibold">${stats.collections}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Cached Data:</span>
              <span class="font-semibold">${stats.cache}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Pending Actions:</span>
              <span class="font-semibold">${stats.pendingActions}</span>
            </div>
          </div>
          <div class="flex gap-3">
            <button class="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors" onclick="this.closest('.fixed').remove()">
              Close
            </button>
            <button class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors" onclick="window.offlineManager.clearOldCache(); this.closest('.fixed').remove();">
              Clear Cache
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Close on background click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.remove();
        }
      });
    }
  }
}

// Create and export singleton instance
const networkStatusIndicator = new NetworkStatusIndicator();

// Make it available globally
if (typeof window !== 'undefined') {
  window.networkStatusIndicator = networkStatusIndicator;
}

export default networkStatusIndicator; 