<template>
  <div class="w-full flex flex-col space-y-4">
    <!-- Address search input -->
    <div class="space-y-2">
      <!-- <label class="text-sm font-medium text-gray-700">Delivery Address</label> -->
      <app-select
        placeholder="Search for your address..."
        :hasTitle="false"
        v-model="selectedAddress"
        ref="addressSelect"
        @OnSearch="handleAddressSearch"
        :options="addressOptions"
        autoComplete
        :hasSearch="true"
        name="DeliveryAddress"
        usePermanentFloatingLabel
        searchMessage="Type to search for addresses"
        :searchIsLoading="addressSearchIsLoading"
      />
    </div>

    <!-- Additional details input -->
    <div class="space-y-2">
      <!-- <label class="text-sm font-medium text-gray-700">Address Details (Optional)</label> -->
      <app-text-field
        :has-title="false"
        type="text"
        placeholder="Add helpful details (apartment, floor, landmark, etc.)"
        ref="addressDetailsField"
        name="AddressDetails"
        v-model="addressDetails"
        usePermanentFloatingLabel
        is-textarea
        :max-character="500"
      />
      <div class="text-xs text-gray-500 text-right">{{ addressDetailsLength }}/500</div>
    </div>

    <!-- Address preview -->
    <div v-if="selectedAddress" class="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div class="text-sm font-medium text-blue-800 mb-1">Delivery Address:</div>
      <div class="text-sm text-blue-700">{{ selectedAddress }}</div>
      <div v-if="addressDetails" class="text-sm text-blue-600 mt-1">{{ addressDetails }}</div>
    </div>

    <!-- Quick address suggestions -->
    <div v-if="!selectedAddress" class="space-y-2">
      <div class="text-xs text-gray-500 font-medium">Quick suggestions:</div>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in quickSuggestions"
          :key="suggestion"
          @click="selectQuickAddress(suggestion)"
          class="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-gray-200 transition-colors"
        >
          {{ suggestion }}
        </button>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex space-x-3 pt-2">
      <button
        @click="confirmAddress"
        :disabled="isProcessing"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        <span v-if="isProcessing">Confirming...</span>
        <span v-else>✓ Continue</span>
      </button>
      
      <!-- <button
        @click="cancelAddress"
        :disabled="isProcessing"
        class="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        Cancel
      </button> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, computed, onMounted } from "vue";
import { AppSelect, AppTextField } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { SelectOption } from "@greep/ui-components/src/types";

export default defineComponent({
  name: "ChatAddressInput",
  components: {
    AppSelect,
    AppTextField,
  },
  props: {
    onAddressConfirm: {
      type: Function,
      required: true,
    },
    onCancel: {
      type: Function,
      required: true,
    },
    isProcessing: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const selectedAddress = ref("");
    const addressDetails = ref("");
    const addressSearchIsLoading = ref(false);
    const addressOptions = reactive<SelectOption[]>([]);

    const autocompleteSuggestion = ref<any>();
    const sessionToken = ref<any>();

    // Quick address suggestions for common areas
    const quickSuggestions = ref([
      "Lagos Island, Lagos State, Nigeria",
      "Ikeja, Lagos State, Nigeria", 
      "Victoria Island, Lagos State, Nigeria",
      "Lekki, Lagos State, Nigeria",
      "Surulere, Lagos State, Nigeria"
    ]);

    const addressDetailsLength = computed(() => {
      return addressDetails.value.length;
    });

    const selectQuickAddress = (address: string) => {
      selectedAddress.value = address;
      console.log("Quick address selected:", address);
    };

    const handleAddressSearch = (searchValue: string) => {
      if (!searchValue || searchValue.length < 2) return;
      
      // Clear previous options
      addressOptions.splice(0, addressOptions.length);
      
      Logic.Common.debounce(async () => {
        try {
          if (!autocompleteSuggestion.value || !searchValue) return;

          addressSearchIsLoading.value = true;
          console.log("Searching for addresses:", searchValue);

          const predictions = await autocompleteSuggestion.value.fetchAutocompleteSuggestions({
            input: searchValue,
            sessionToken: sessionToken.value,
          });

          if (predictions.suggestions) {
            predictions.suggestions.forEach((prediction: any) => {
              const currentPrediction = prediction.placePrediction;
              addressOptions.push({
                key: currentPrediction.text.text,
                value: currentPrediction.text.text,
              });
            });
            
            console.log("Found address suggestions:", addressOptions.length);
          }
        } catch (error) {
          console.error("Error searching addresses:", error);
        } finally {
          addressSearchIsLoading.value = false;
        }
      }, 500);
    };

    const confirmAddress = () => {
      if (!selectedAddress.value) {
        Logic.Common.showAlert({
          show: true,
          message: "Please select an address first.",
          type: "error",
        });
        return;
      }

      const fullAddress = addressDetails.value 
        ? `${selectedAddress.value}, ${addressDetails.value}`
        : selectedAddress.value;

      console.log("Confirming address:", fullAddress);
      
      // Call the parent function
      try {
        props.onAddressConfirm(fullAddress);
        
        // Reset inputs
        selectedAddress.value = "";
        addressDetails.value = "";
        addressOptions.splice(0, addressOptions.length);
      } catch (error) {
        console.error("Error confirming address:", error);
      }
    };

    const cancelAddress = () => {
      console.log("Address input cancelled");
      
      // Reset inputs
      selectedAddress.value = "";
      addressDetails.value = "";
      addressOptions.splice(0, addressOptions.length);
      
      // Call parent cancel function
      try {
        props.onCancel();
      } catch (error) {
        console.error("Error cancelling address:", error);
      }
    };

    // Alias cancelAddress as confirmAddress for the button
    const handleButtonClick = () => {
      if (selectedAddress.value) {
        confirmAddress();
      } else {
        // If no address selected, treat as cancel
        cancelAddress();
      }
    };

    const initPlacesService = async () => {
      try {
        // @ts-expect-error Google Maps API
        const { AutocompleteSuggestion, AutocompleteSessionToken } = await google.maps.importLibrary("places");

        autocompleteSuggestion.value = AutocompleteSuggestion;
        sessionToken.value = new AutocompleteSessionToken();
        
        console.log("Google Places service initialized");
      } catch (error) {
        console.error("Error initializing Google Places service:", error);
      }
    };

    onMounted(() => {
      initPlacesService();
    });

    return {
      selectedAddress,
      addressDetails,
      addressDetailsLength,
      addressSearchIsLoading,
      addressOptions,
      quickSuggestions,
      handleAddressSearch,
      selectQuickAddress,
      confirmAddress,
      cancelAddress,
      handleButtonClick,
    };
  },
});
</script>