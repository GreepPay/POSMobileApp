<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
      v-if="!hideContent"
    >
      <div class="w-full flex flex-col">
        <!-- Stock -->
        <div class="w-full flex flex-col pb-6 pt-2">
          <div
            class="grid grid-cols-12 items-center relative border-[1.5px] border-[#E0E2E4] rounded-[12px]"
          >
            <app-normal-text
              :class="`absolute left-4 !top-[-20%] px-1 py-[2px] bg-white !text-[#616161] !font-[500] z-10`"
            >
              Stock
            </app-normal-text>

            <div class="col-span-8 flex flex-row px-4 !text-left py-4 relative">
              <app-content-editable
                v-model="formData.stock"
                :default-value="formData.stock.toString()"
                class="!font-[500] !text-sm !text-black !min-w-[70px] !w-full"
                placeholder="Custom"
                type="tel"
                :listenForUpdate="true"
              />
            </div>
            <div
              class="col-span-2 flex flex-row items-center justify-center !text-left py-4 !border-l-[1.5px] !border-r-[1.5px] !border-[#E0E2E4]"
            >
              <div
                @click="formData.stock > 0 ? formData.stock-- : null"
                :class="`w-[24px] h-[24px] flex items-center justify-center ${
                  formData.stock == 0 ? 'opacity-30' : ''
                }`"
              >
                <app-icon name="minus" custom-class="!h-[12px] !w-[16px]" />
              </div>
            </div>

            <div
              class="col-span-2 flex flex-row items-center justify-center px-2 !text-left py-4"
            >
              <div
                @click="formData.stock++"
                class="w-[24px] h-[24px] flex items-center justify-center"
              >
                <app-icon name="plus" custom-class="!h-[24px]" />
              </div>
            </div>
          </div>
        </div>

        <!-- Price -->
        <div class="w-full flex flex-col pb-4">
          <app-text-field
            :has-title="false"
            type="numeric"
            placeholder="0"
            ref="productPrice"
            name="Price"
            v-model="formData.price"
            usePermanentFloatingLabel
            input-style="!font-[500] !text-sm"
            is-formatted
            :rules="[FormValidations.RequiredRule]"
          >
            <template #inner-prefix>
              <app-normal-text class="!text-left">
                {{ selectedCurrency?.symbol }}
              </app-normal-text>
            </template>

            <template #inner-suffix>
              <app-select
                is-wrapper
                v-model="selectedCurrencyCode"
                :options="currencyOptions"
                :defaultSize="'!w-[25px]'"
                auto-complete
              >
                <app-image-loader
                  :photo-url="`/images/icons/flags/${
                    selectedCurrency?.use_country_code
                      ? selectedCurrency?.country_code?.toLocaleLowerCase()
                      : selectedCurrency?.code?.toLocaleLowerCase()
                  }.${selectedCurrency?.icon_extension || 'svg'}`"
                  class="h-[25px] w-[25px] rounded-full"
                />
              </app-select>
            </template>
          </app-text-field>
        </div>
      </div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, watch } from "vue";
import {
  AppFormWrapper,
  AppIcon,
  AppContentEditable,
  AppNormalText,
  AppTextField,
  AppSelect,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { SelectOption } from "@greep/logic/src/logic/types/common";
import { onMounted } from "vue";
import { availableCurrencies } from "../../composable";
import { computed } from "vue";
import { BaseProductSummary } from "../../composable/shop";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppIcon,
    AppContentEditable,
    AppNormalText,
    AppTextField,
    AppSelect,
    AppImageLoader,
  },
  props: {
    data: {
      type: Object as () => BaseProductSummary,
    },
  },
  name: "ProductSetupProductInventory",
  setup(props) {
    const FormValidations = Logic.Form;

    const formData = reactive({
      stock: 0,
      price: "0",
      currency: "USD",
    });

    const hideContent = ref(false);

    const currencySymbol = ref("$");
    const selectedCurrencyCode = ref("USD_US");

    const currencyOptions = reactive<SelectOption[]>([]);

    const formComponent = ref<any>(null);

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        formData.currency = selectedCurrencyCode.value?.split("_")[0];

        formData.price = formData.price
          ? formData.price.toString().replace(/,/g, "")
          : "0";
        // Proceed with form submission
        return formData;
      } else {
        return;
      }
    };

    const selectedCurrency = computed(() => {
      return availableCurrencies.find(
        (item) => item.code == selectedCurrencyCode.value?.split("_")[0]
      );
    });

    const setFromProductData = () => {
      if (props.data) {
        hideContent.value = true;
        formData.stock = props.data.stock;
        formData.price = props.data.price;
        formData.currency = props.data.currency;

        const currencyInfo = availableCurrencies.find(
          (currency) => currency.code === props.data?.currency
        );

        if (currencyInfo) {
          currencySymbol.value = currencyInfo.symbol;
        }

        selectedCurrencyCode.value =
          props.data.currency + "_" + currencyInfo?.country_code;

        setTimeout(() => {
          hideContent.value = false;
        }, 200);
      } else {
        const currencyFromDefault =
          Logic.Auth.GetDefaultBusiness()?.default_currency || "USD";

        const currencyInfo = availableCurrencies.find(
          (currency) => currency.code === currencyFromDefault
        );
        if (currencyInfo) {
          selectedCurrencyCode.value =
            currencyInfo.code + "_" + currencyInfo.country_code;
        }
      }
    };

    watch(
      () => props.data,
      () => {
        setFromProductData();
      }
    );

    onMounted(() => {
      currencyOptions.length = 0;
      availableCurrencies.forEach((item) => {
        if (!item.is_crypto) {
          currencyOptions.push({
            key: item.code + "_" + item.country_code,
            value: item.name,
          });
        }
      });

      setFromProductData();
    });

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
      currencySymbol,
      selectedCurrencyCode,
      currencyOptions,
      selectedCurrency,
      hideContent,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
