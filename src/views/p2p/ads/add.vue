<template>
  <app-wrapper>
    <subpage-layout
      :title="isEdit ? `Edit Exchange Ad` : `Create Exchange Ad`"
      :hasBottomButton="true"
    >
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col justify-start pt-1"
        v-if="showForms"
      >
        <!-- Info box -->
        <div class="w-full px-4 flex flex-col">
          <app-info-box>
            <app-normal-text custom-class="!leading-5">
              All Exchange ads on Greep Pay is against
              <span class="font-semibold">USDC.</span>
              <br />
              <br />
              That mean, you will get
              <span class="font-semibold">USDC.</span> for any currency you
              sell.
            </app-normal-text>
          </app-info-box>
        </div>
        <!-- Fields -->
        <div
          class="w-full flex flex-col pb-5 !border-b-[12px] !border-[#F0F3F6] pt-5 px-4"
          v-if="!isEdit"
        >
          <app-normal-text class="!text-left !font-semibold pb-2">
            Choose Currency to Sell
          </app-normal-text>
          <app-select
            :placeholder="'Select currency'"
            :hasTitle="false"
            :paddings="'py-4 !px-4'"
            :options="currencyOptions"
            name="Currency to sell"
            customClass=" !font-[500]"
            ref="SellCurrency"
            v-model="formData.sell_currency"
          >
          </app-select>
        </div>

        <div
          class="w-full flex flex-col pb-5 !border-b-[12px] !border-[#F0F3F6] pt-5 px-4"
        >
          <app-normal-text class="!text-left !font-semibold pb-2">
            Enter Your Rate Per USDC
          </app-normal-text>
          <app-text-field
            :has-title="false"
            type="tel"
            placeholder="0.00"
            ref="sellRate"
            name="Exchange Rate"
            v-model="formData.sell_rate"
            input-style="!text-sm !font-[500]"
            is-formatted
            :rules="[FormValidations.RequiredRule]"
          >
            <template #inner-suffix>
              <app-normal-text class="!font-[500] !text-right !text-sm">
                {{ currentSellCurrency?.symbol }}
              </app-normal-text>
            </template>
          </app-text-field>
        </div>

        <div
          class="w-full flex flex-col pb-5 !border-b-[12px] !border-[#F0F3F6] pt-5 px-4"
        >
          <app-normal-text class="!text-left !font-semibold pb-2">
            Minimum Sell Amount
          </app-normal-text>
          <app-text-field
            :has-title="false"
            type="tel"
            placeholder="0.00"
            ref="minSellAmount"
            name="Minimum Sell Amount"
            v-model="formData.min_sell"
            input-style="!text-sm !font-[500]"
            is-formatted
            :rules="[FormValidations.RequiredRule]"
          >
            <template #inner-suffix>
              <app-normal-text class="!font-[500] !text-right !text-sm">
                {{ currentSellCurrency?.symbol }}
              </app-normal-text>
            </template>
          </app-text-field>
        </div>

        <div
          class="w-full flex flex-col pb-5 !border-b-[12px] !border-[#F0F3F6] pt-5 px-4"
        >
          <app-normal-text class="!text-left !font-semibold pb-2">
            Maximum Sell Amount
          </app-normal-text>
          <app-text-field
            :has-title="false"
            type="tel"
            placeholder="0.00"
            ref="maxSellAmount"
            name="Maximum Sell Amount"
            v-model="formData.max_sell"
            input-style="!text-sm !font-[500]"
            is-formatted
            :rules="[FormValidations.RequiredRule]"
          >
            <template #inner-suffix>
              <app-normal-text class="!font-[500] !text-right !text-sm">
                {{ currentSellCurrency?.symbol }}
              </app-normal-text>
            </template>
          </app-text-field>
        </div>

        <div
          class="w-full flex flex-col !pb-[140px] !border-b-[12px] !border-[#F0F3F6] pt-5 px-4"
        >
          <app-normal-text class="!text-left !font-semibold pb-2">
            Choose Supported Payout Options
          </app-normal-text>
          <div class="w-full flex flex-col pt-[2px]">
            <div
              class="w-full flex flex-col !py-2"
              v-for="(item, index) in payoutOptions"
              :key="index"
            >
              <app-checkbox v-model="formData.payout_options[0][item.key]">
                <template #label>
                  <app-normal-text>
                    {{ item.value }}
                  </app-normal-text>
                </template>
              </app-checkbox>
            </div>
          </div>
        </div>
      </app-form-wrapper>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white bottom-0 left-0 pt-4 px-4 flex flex-col"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            @click="submitForm"
            variant="secondary"
            :class="`!py-4`"
            :loading="isLoading"
            >{{ isEdit ? "Update Ad" : " Create Ad" }}
          </app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppInfoBox,
  AppNormalText,
  AppSelect,
  AppFormWrapper,
  AppTextField,
  AppButton,
  AppCheckbox,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { SelectOption } from "@greep/logic/src/logic/types/common";
import { withdrawalAvailableCurrencies } from "../../../composable";
import { onMounted } from "vue";
import { onIonViewDidEnter, onIonViewWillEnter } from "@ionic/vue";
import { computed } from "vue";
import { getBottomPadding } from "../../../composable";
import { ref } from "vue";

export default defineComponent({
  name: "AddP2PAdPage",
  components: {
    AppNormalText,
    AppInfoBox,
    AppSelect,
    AppFormWrapper,
    AppTextField,
    AppButton,
    AppCheckbox,
  },
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "SingleExchangeAd",
        method: "GetExchangeAd",
        params: [],
        requireAuth: true,
        ignoreProperty: true,
        useRouteQuery: true,
        queries: ["uuid"],
        condition: {
          routeSearchItem: "fullPath",
          searchQuery: "uuid",
        },
      },
    ],
  },
  setup() {
    const isLoading = ref(false);
    const formComponent = ref();
    const showForms = ref(false);
    const currencyOptions = reactive<SelectOption[]>([]);
    const SingleExchangeAd = ref(Logic.Wallet.SingleExchangeAd);
    const payoutOptions = reactive<SelectOption[]>([
      {
        value: "Bank Transfer",
        key: "bank_transfer",
      },
      {
        value: "Cash Pickup",
        key: "cash_pickup",
      },
      {
        value: "Cash Delivery",
        key: "cash_delivery",
      },
    ]);

    const isEdit = ref(false);

    const FormValidations = Logic.Form;

    const formData = reactive({
      sell_currency: "",
      sell_rate: "",
      min_sell: "",
      max_sell: "",
      payout_options: [
        {
          bank_transfer: false,
          cash_pickup: false,
          cash_delivery: false,
        },
      ],
    });

    const currentSellCurrency = computed(() => {
      return withdrawalAvailableCurrencies?.find(
        (item) => item.code == formData.sell_currency
      );
    });

    const setCurrencyOptions = () => {
      currencyOptions.length = 0;
      withdrawalAvailableCurrencies?.forEach((item) => {
        if (item.allow_p2p) {
          currencyOptions.push({
            key: item.code,
            value: item.name,
          });
        }
      });
    };

    const submitForm = async () => {
      const state = formComponent.value.validate();
      if (state) {
        if (isLoading.value) {
          return;
        }

        isLoading.value = true;

        if (isEdit.value) {
          Logic.Wallet.UpdateExchangeAdForm = {
            exchange_ad_uuid: SingleExchangeAd.value?.uuid || "",
            max_amount: parseFloat(formData.max_sell.replaceAll(",", "")),
            min_amount: parseFloat(formData.min_sell.replaceAll(",", "")),
            rate: parseFloat(formData.sell_rate.replaceAll(",", "")),
            address_details: JSON.stringify([]),
            payout_banks: JSON.stringify(formData.payout_options),
            payout_address: JSON.stringify([]),
          };
        } else {
          Logic.Wallet.CreateExchangeAdForm = {
            business_id: Logic.Auth.GetDefaultBusiness().uuid,
            from_currency: formData.sell_currency,
            to_currency: "USDC",
            max_amount: parseFloat(formData.max_sell.replaceAll(",", "")),
            min_amount: parseFloat(formData.min_sell.replaceAll(",", "")),
            rate: parseFloat(formData.sell_rate.replaceAll(",", "")),
            address_details: JSON.stringify([]),
            payout_banks: JSON.stringify(formData.payout_options),
            payout_address: JSON.stringify([]),
          };
        }

        try {
          if (isEdit.value) {
            await Logic.Wallet.UpdateExchangeAd();
          } else {
            await Logic.Wallet.CreateExchangeAd();
          }
          await Logic.Wallet.GetExchangeAds(1, 10, "UPDATED_AT", "DESC", "");
          Logic.Common.showAlert({
            show: true,
            message: isEdit.value
              ? "P2P Ad updated successfully"
              : "P2P Ad created successfully",
            type: "success",
          });
          Logic.Common.goBack();
        } catch (error) {
          //
        } finally {
          isLoading.value = false;
        }
      }
    };

    const setDefaults = () => {
      showForms.value = false;
      if (Logic.Common.route?.query?.uuid?.toString()) {
        isEdit.value = true;
      } else {
        isEdit.value = false;
        showForms.value = true;
      }

      if (isEdit.value) {
        formData.sell_currency = SingleExchangeAd.value?.from_currency || "";
        formData.max_sell = SingleExchangeAd.value?.max_amount.toString() || "";
        formData.min_sell = SingleExchangeAd.value?.min_amount.toString() || "";
        formData.sell_rate = SingleExchangeAd.value?.rate.toString() || "";
        formData.payout_options = JSON.parse(
          SingleExchangeAd.value?.payout_banks || "[]"
        );
      } else {
        formData.sell_currency = "";
        formData.max_sell = "";
        formData.min_sell = "";
        formData.sell_rate = "";
        formData.payout_options = [
          {
            bank_transfer: false,
            cash_pickup: false,
            cash_delivery: false,
          },
        ];
      }

      setTimeout(() => {
        showForms.value = true;
      }, 100);
    };

    onIonViewWillEnter(() => {
      setDefaults();
    });

    onIonViewDidEnter(() => {
      setCurrencyOptions();
    });

    onMounted(() => {
      Logic.Wallet.watchProperty("SingleExchangeAd", SingleExchangeAd);
      setCurrencyOptions();
    });

    return {
      Logic,
      formData,
      currencyOptions,
      currentSellCurrency,
      FormValidations,
      payoutOptions,
      getBottomPadding,
      isLoading,
      formComponent,
      submitForm,
      isEdit,
      showForms,
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
