<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📍 Delivery Address</h3>
        <button class="close-button" @click="$emit('cancel')">×</button>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          Please provide your complete delivery address for cash pickup
        </p>
        
        <div class="address-form">
          <label for="address-input">Full Address:</label>
          <textarea
            id="address-input"
            v-model="addressInput"
            placeholder="Enter your complete address (e.g., 123 Main Street, Lagos, Nigeria)"
            class="address-textarea"
            rows="4"
            ref="textareaRef"
          ></textarea>
          
          <div class="address-tips">
            <h4>💡 Address Tips:</h4>
            <ul>
              <li>Include street name and number</li>
              <li>Add city and state/province</li>
              <li>Include landmarks or nearby locations</li>
              <li>Be specific for easy delivery</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button 
          class="btn-secondary" 
          @click="$emit('cancel')"
        >
          Cancel
        </button>
        <button 
          class="btn-primary" 
          @click="handleConfirm"
          :disabled="!canConfirm"
        >
          Confirm Address
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';

interface Emits {
  (e: 'confirm', address: string): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const addressInput = ref('');
const textareaRef = ref<HTMLTextAreaElement>();

const canConfirm = computed(() => {
  return addressInput.value.trim().length >= 10;
});

const handleConfirm = () => {
  if (canConfirm.value) {
    emit('confirm', addressInput.value.trim());
  }
};

const handleOverlayClick = () => {
  emit('cancel');
};

// Auto-focus textarea when modal opens
nextTick(() => {
  if (textareaRef.value) {
    textareaRef.value.focus();
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: white;
  border-radius: 0.5rem;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 1.5rem 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #495057;
  font-size: 1.25rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-button:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 1.5rem;
}

.modal-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  line-height: 1.5;
}

.address-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.address-textarea {
  width: 100%;
  border: 1px solid #ced4da;
  border-radius: 0.375rem;
  padding: 0.75rem;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

.address-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.address-tips {
  margin-top: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  border-left: 4px solid #007bff;
}

.address-tips h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.9rem;
}

.address-tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.address-tips li {
  margin-bottom: 0.25rem;
}

.modal-footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
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

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

/* Mobile optimizations */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-content {
    max-height: 95vh;
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
}
</style>
