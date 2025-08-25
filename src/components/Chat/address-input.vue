<template>
  <div class="w-full flex flex-col space-y-4">
    <!-- Address search input -->
    <div class="space-y-2">
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
      <!-- Use current location -->
      <button
        type="button"
        @click="useCurrentLocation"
        class="text-xs text-blue-600 hover:underline mt-1"
        :disabled="isLocating"
      >
        <span v-if="isLocating">📍 Detecting your location...</span>
        <span v-else>📍 Use my current location</span>
      </button>
    </div>

    <!-- Additional details input -->
    <div class="space-y-2">
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
    const geocoder = ref<any>();
    const isLocating = ref(false);

    const addressDetailsLength = computed(() => addressDetails.value.length);

    const handleAddressSearch = (searchValue: string) => {
      if (!searchValue || searchValue.length < 2) return;

      addressOptions.splice(0, addressOptions.length);

      Logic.Common.debounce(async () => {
        try {
          if (!autocompleteSuggestion.value || !searchValue) return;

          addressSearchIsLoading.value = true;
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
          }
        } catch (error) {
          console.error("Error searching addresses:", error);
        } finally {
          addressSearchIsLoading.value = false;
        }
      }, 500);
    };

    const useCurrentLocation = () => {
      if (!navigator.geolocation) {
        Logic.Common.showAlert({
          show: true,
          message: "Geolocation is not supported by your browser.",
          type: "error",
        });
        return;
      }

      isLocating.value = true;

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;

            if (!geocoder.value) {
              Logic.Common.showAlert({
                show: true,
                message: "Google Maps Geocoder not initialized.",
                type: "error",
              });
              return;
            }

            geocoder.value.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results: any, status: any) => {
                if (status === "OK" && results[0]) {
                  selectedAddress.value = results[0].formatted_address;
                } else {
                  Logic.Common.showAlert({
                    show: true,
                    message: "Unable to fetch address for current location.",
                    type: "error",
                  });
                }
              }
            );
          } catch (error) {
            console.error("Error fetching current location:", error);
          } finally {
            isLocating.value = false;
          }
        },
        (error) => {
          isLocating.value = false;
          Logic.Common.showAlert({
            show: true,
            message: "Unable to retrieve your location.",
            type: "error",
          });
        }
      );
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

      try {
        props.onAddressConfirm(fullAddress);
        selectedAddress.value = "";
        addressDetails.value = "";
        addressOptions.splice(0, addressOptions.length);
      } catch (error) {
        console.error("Error confirming address:", error);
      }
    };

    const cancelAddress = () => {
      selectedAddress.value = "";
      addressDetails.value = "";
      addressOptions.splice(0, addressOptions.length);
      try {
        props.onCancel();
      } catch (error) {
        console.error("Error cancelling address:", error);
      }
    };

    const initPlacesService = async () => {
      try {
        // @ts-expect-error Google Maps API
        const { AutocompleteSuggestion, AutocompleteSessionToken, Geocoder } =
          await google.maps.importLibrary("places");

        autocompleteSuggestion.value = AutocompleteSuggestion;
        sessionToken.value = new AutocompleteSessionToken();
        geocoder.value = new google.maps.Geocoder();
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
      isLocating,
      handleAddressSearch,
      confirmAddress,
      cancelAddress,
      useCurrentLocation,
    };
  },
});
</script>