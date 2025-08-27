<template>
  <div class="chat-top-bar">
    <div class="top-bar-content">
      <!-- Back Button -->
      <button class="back-button" @click="goBack">
        <span class="back-icon">←</span>
      </button>
      
      <!-- Conversation Info -->
      <div class="conversation-info">
        <div class="conversation-title">
          {{ conversationTitle }}
        </div>
        <div class="conversation-subtitle">
          {{ conversationSubtitle }}
        </div>
      </div>
      
      <!-- Status Indicators -->
      <div class="status-indicators">
        <!-- Countdown Timer -->
        <div v-if="countdownActive" class="countdown-indicator">
          <span class="countdown-icon">⏰</span>
          <span class="countdown-text">{{ formatCountdown }}</span>
        </div>
        
        <!-- Business User Badge -->
        <div v-if="isBusinessUser" class="business-badge">
          <span class="business-icon">🏢</span>
          <span class="business-text">Business</span>
        </div>
        
        <!-- Online Status -->
        <div class="online-status">
          <span class="status-dot"></span>
          <span class="status-text">Online</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';

interface Props {
  conversation: any;
  isBusinessUser: boolean;
  countdownActive: boolean;
  formatCountdown: string;
}

const props = defineProps<Props>();
const router = useRouter();

// Computed properties
const conversationTitle = computed(() => {
  if (!props.conversation) return 'Chat';
  
  // If business user, show customer info
  if (props.isBusinessUser) {
    const customer = props.conversation.participants?.find((p: any) => 
      p.user_id !== props.conversation.owner_id
    );
    return customer?.user?.first_name 
      ? `${customer.user.first_name} ${customer.user.last_name}`
      : 'Customer';
  }
  
  // If customer, show business info
  const business = props.conversation.exchangeAd?.business;
  return business?.business_name || 'Business';
});

const conversationSubtitle = computed(() => {
  if (!props.conversation) return '';
  
  if (props.isBusinessUser) {
    return 'P2P Trade Customer';
  }
  
  const business = props.conversation.exchangeAd?.business;
  return business?.business_name ? 'P2P Trade' : 'P2P Trade';
});

// Navigation
const goBack = () => {
  router.back();
};
</script>

<style scoped>
.chat-top-bar {
  background: white;
  border-bottom: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  position: sticky;
  top: 0;
  z-index: 100;
}

.top-bar-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: none;
  border: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-button:hover {
  background: #f8f9fa;
}

.back-icon {
  font-size: 1.25rem;
  color: #495057;
  font-weight: bold;
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.conversation-title {
  font-weight: 600;
  color: #495057;
  font-size: 1rem;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.conversation-subtitle {
  color: #6c757d;
  font-size: 0.875rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.status-indicators {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.countdown-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.countdown-icon {
  font-size: 1rem;
}

.countdown-text {
  color: #856404;
  font-weight: 600;
  font-family: monospace;
}

.business-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #e3f2fd;
  border: 1px solid #bbdefb;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.business-icon {
  font-size: 1rem;
}

.business-text {
  color: #1976d2;
  font-weight: 500;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  background: #28a745;
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.status-text {
  color: #28a745;
  font-weight: 500;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .chat-top-bar {
    padding: 0.5rem;
  }
  
  .top-bar-content {
    gap: 0.75rem;
  }
  
  .back-button {
    width: 2rem;
    height: 2rem;
  }
  
  .back-icon {
    font-size: 1rem;
  }
  
  .conversation-title {
    font-size: 0.9rem;
  }
  
  .conversation-subtitle {
    font-size: 0.8rem;
  }
  
  .status-indicators {
    gap: 0.5rem;
  }
  
  .countdown-indicator,
  .business-badge {
    padding: 0.375rem 0.5rem;
    font-size: 0.8rem;
  }
}
</style>
