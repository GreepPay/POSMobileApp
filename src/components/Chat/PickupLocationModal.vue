<template>
  <div class="fixed inset-0 bg-white bg-opacity-60 z-50 flex items-end" @click="handleCancel">
    <div class="w-full bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto shadow-2xl border-t border-gray-200" @click.stop>
      <div class="p-4 pb-8">
        <!-- Handle bar -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>

        <!-- Header -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🏪</span>
            <span class="text-lg font-semibold text-gray-800">Select Pickup Location</span>
          </div>
          <button @click="handleCancel" class="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <!-- Description -->
        <p class="modal-description">
          Choose the branch location where you'd like to pickup your cash
        </p>

        <!-- Store Locations List -->
        <div v-if="storeLocations.length > 0" class="locations-list">
          <div
            v-for="location in storeLocations"
            :key="location.name"
            @click="selectLocation(location)"
            class="location-item"
          >
            <div class="location-info">
              <div class="location-name">{{ location.name }}</div>
              <div class="location-address">{{ location.address }}</div>
              <div class="location-city">{{ location.city }}, {{ location.country }}</div>
            </div>
            <div class="select-icon">→</div>
          </div>
        </div>

        <!-- No Locations Available -->
        <div v-else class="no-locations">
          <div class="no-locations-icon">🏪</div>
          <p class="no-locations-title">No pickup locations available</p>
          <p class="no-locations-subtitle">Please contact the business for pickup options</p>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ errorMessage }}
        </div>
      </div>
      

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface StoreLocation {
  name: string;
  address: string;
  city: string;
  country: string;
  __typename: string;
}

interface Props {
  show: boolean;
  storeLocations: StoreLocation[];
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
});

const emit = defineEmits<{
  'location-selected': [location: StoreLocation];
  'cancel': [];
}>();

// Reactive data
const isSubmitting = ref(false);
const errorMessage = ref('');



// Methods
const selectLocation = (location: StoreLocation) => {
  try {
    isSubmitting.value = true;
    errorMessage.value = '';
    
    // Emit the selected location
    emit('location-selected', location);
  } catch (error) {
    console.error('Failed to select location:', error);
    errorMessage.value = 'Failed to select location. Please try again.';
  } finally {
    isSubmitting.value = false;
  }
};



const handleCancel = () => {
  emit('cancel');
};
</script>

<style scoped>
.modal-description {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  line-height: 1.5;
}

/* Locations List Styles */
.locations-list {
  margin-bottom: 1rem;
}

.location-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.375rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.location-item:hover {
  border-color: #007bff;
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.1);
}

.location-info {
  flex: 1;
}

.location-name {
  font-weight: 500;
  color: #495057;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.location-address {
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  line-height: 1.4;
}

.location-city {
  font-size: 0.75rem;
  color: #007bff;
  font-weight: 500;
}

.select-icon {
  color: #007bff;
  font-weight: bold;
  font-size: 1.1rem;
}

/* No Locations Styles */
.no-locations {
  text-align: center;
  padding: 2rem 1rem;
  color: #6c757d;
}

.no-locations-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.6;
}

.no-locations-title {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #495057;
}

.no-locations-subtitle {
  font-size: 0.9rem;
  line-height: 1.4;
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 0.375rem;
  color: #721c24;
  font-size: 0.85rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1rem;
}



/* Mobile optimizations */
@media (max-width: 768px) {
  .location-item {
    padding: 0.75rem;
  }

  .location-name {
    font-size: 0.9rem;
  }

  .location-address {
    font-size: 0.8rem;
  }
}

/* Animation for modal appearance */
@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fixed.inset-0 {
  animation: slideUp 0.3s ease-out;
}
</style>
