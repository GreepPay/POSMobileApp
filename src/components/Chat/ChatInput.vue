<template>
  <div class="chat-input-container">
    <!-- Address Input Mode -->
    <div v-if="showAddressInput" class="address-input-mode">
      <div class="address-input-header">
        <h3>📍 Delivery Address</h3>
        <p>Please provide your complete delivery address</p>
      </div>
      
      <div class="address-input-form">
        <textarea
          v-model="addressInput"
          placeholder="Enter your full address (e.g., 123 Main Street, Lagos, Nigeria)"
          class="address-textarea"
          rows="3"
        ></textarea>
        
        <div class="address-actions">
          <button @click="handleAddressSubmit" class="btn-primary">
            Confirm Address
          </button>
          <button @click="handleAddressCancel" class="btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>

    <!-- Regular Chat Input -->
    <div v-else class="regular-chat-input">
      <div class="input-container">
        <textarea
          v-model="messageInput"
          placeholder="Type your message..."
          class="message-textarea"
          rows="1"
          @keydown.enter.prevent="handleEnterKey"
          @input="autoResize"
          ref="textareaRef"
        ></textarea>
        
        <button 
          @click="handleSendMessage" 
          class="send-button"
          :disabled="!canSendMessage"
        >
          <span class="send-icon">📤</span>
        </button>
      </div>
      
      <!-- Countdown Timer Display -->
      <div v-if="showCountdown" class="countdown-display">
        <div class="countdown-label">⏰ Order Timer:</div>
        <div class="countdown-time">{{ formatCountdown }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue';

interface Props {
  showAddressInput: boolean;
  showCountdown: boolean;
  formatCountdown: string;
  isInteractive: boolean;
}

interface Emits {
  (e: 'send-message', message: string): void;
  (e: 'address-submit', address: string): void;
  (e: 'address-cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const messageInput = ref('');
const addressInput = ref('');
const textareaRef = ref<HTMLTextAreaElement>();

// Check if message can be sent
const canSendMessage = computed(() => {
  if (props.showAddressInput) return false;
  if (!props.isInteractive) return false;
  return messageInput.value.trim().length > 0;
});

// Auto-resize textarea
const autoResize = () => {
  if (textareaRef.value) {
    textareaRef.value.style.height = 'auto';
    textareaRef.value.style.height = textareaRef.value.scrollHeight + 'px';
  }
};

// Handle Enter key
const handleEnterKey = (event: KeyboardEvent) => {
  if (event.shiftKey) {
    // Allow new line with Shift+Enter
    return;
  }
  handleSendMessage();
};

// Handle send message
const handleSendMessage = () => {
  const message = messageInput.value.trim();
  if (message && canSendMessage.value) {
    emit('send-message', message);
    messageInput.value = '';
    nextTick(() => {
      if (textareaRef.value) {
        textareaRef.value.style.height = 'auto';
      }
    });
  }
};

// Handle address submit
const handleAddressSubmit = () => {
  const address = addressInput.value.trim();
  if (address.length >= 5) {
    emit('address-submit', address);
    addressInput.value = '';
  }
};

// Handle address cancel
const handleAddressCancel = () => {
  emit('address-cancel');
  addressInput.value = '';
};

// Watch for showAddressInput changes to reset inputs
watch(() => props.showAddressInput, (newValue) => {
  if (!newValue) {
    addressInput.value = '';
  }
});
</script>

<style scoped>
.chat-input-container {
  border-top: 1px solid #e9ecef;
  background: white;
  padding: 1rem;
}

.address-input-mode {
  background: #f8f9fa;
  border-radius: 0.5rem;
  padding: 1rem;
}

.address-input-header h3 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 1.1rem;
}

.address-input-header p {
  margin: 0 0 1rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.address-textarea {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 80px;
}

.address-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.regular-chat-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-container {
  display: flex;
  gap: 0.5rem;
  align-items: flex-end;
}

.message-textarea {
  flex: 1;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  resize: none;
  max-height: 120px;
  min-height: 40px;
}

.send-button {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: #007bff;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.send-button:hover:not(:disabled) {
  background: #0056b3;
  transform: scale(1.05);
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.send-icon {
  font-size: 1rem;
}

.countdown-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 0.375rem;
  font-size: 0.9rem;
}

.countdown-label {
  color: #856404;
  font-weight: 500;
}

.countdown-time {
  color: #856404;
  font-weight: bold;
  font-family: monospace;
  font-size: 1.1rem;
}
</style>
