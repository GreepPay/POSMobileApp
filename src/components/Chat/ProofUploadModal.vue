<template>
  <div class="modal-overlay" @click="handleOverlayClick">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>📸 Upload Proof</h3>
        <button class="close-button" @click="$emit('cancel')">×</button>
      </div>
      
      <div class="modal-body">
        <p class="modal-description">
          Please provide proof of cash delivery to complete your order
        </p>
        
        <div class="proof-options">
          <div class="proof-option" @click="selectOption('photo')">
            <div class="option-icon">📸</div>
            <div class="option-content">
              <h4>Photo Proof</h4>
              <p>Take a photo of the cash received</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
          
          <div class="proof-option" @click="selectOption('document')">
            <div class="option-icon">📄</div>
            <div class="option-content">
              <h4>Document Proof</h4>
              <p>Upload receipt or document</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
          
          <div class="proof-option" @click="selectOption('text')">
            <div class="option-icon">✍️</div>
            <div class="option-content">
              <h4>Text Description</h4>
              <p>Describe the delivery confirmation</p>
            </div>
            <div class="option-arrow">→</div>
          </div>
        </div>
        
        <div class="proof-tips">
          <h4>💡 Proof Tips:</h4>
          <ul>
            <li>Ensure proof is clear and readable</li>
            <li>Include relevant details (amount, date, location)</li>
            <li>Keep proof for your records</li>
            <li>Contact support if you have issues</li>
          </ul>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn-secondary" @click="$emit('cancel')">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

interface Emits {
  (e: 'upload', type: 'photo' | 'document' | 'text'): void;
  (e: 'cancel'): void;
}

const emit = defineEmits<Emits>();

const selectOption = (type: 'photo' | 'document' | 'text') => {
  emit('upload', type);
};

const handleOverlayClick = () => {
  emit('cancel');
};
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

.proof-options {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.proof-option {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border: 2px solid #e9ecef;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.proof-option:hover {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.proof-option:active {
  transform: translateY(0);
}

.option-icon {
  font-size: 2rem;
  width: 3rem;
  height: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  border-radius: 50%;
  flex-shrink: 0;
}

.option-content {
  flex: 1;
}

.option-content h4 {
  margin: 0 0 0.25rem 0;
  color: #495057;
  font-size: 1rem;
}

.option-content p {
  margin: 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.option-arrow {
  font-size: 1.5rem;
  color: #6c757d;
  font-weight: bold;
}

.proof-tips {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 0.375rem;
  border-left: 4px solid #28a745;
}

.proof-tips h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.9rem;
}

.proof-tips ul {
  margin: 0;
  padding-left: 1.25rem;
  color: #6c757d;
  font-size: 0.85rem;
  line-height: 1.4;
}

.proof-tips li {
  margin-bottom: 0.25rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 1rem 1.5rem 1.5rem;
  border-top: 1px solid #e9ecef;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.375rem;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
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
  
  .proof-option {
    padding: 0.75rem;
  }
  
  .option-icon {
    font-size: 1.5rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
