<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col h-full"
      v-if="!hideContent"
    >
      <!-- Ticket currency -->
      <div class="w-full flex flex-col mt-3">
        <app-select
          v-model="formData.currency"
          :options="currencyOptions"
          :has-title="false"
          use-permanent-floating-label
          name="Ticket Currency"
          placeholder="Choose currency"
        >
        </app-select>
      </div>

      <div class="w-full flex flex-col mt-5">
        <app-checkbox v-model="formData.unlimited_tickets" variant="switch">
          <template #label>
            <app-normal-text
              :class="`!font-[500] !text-sm -ml-2 ${
                formData.unlimited_tickets ? '' : '!text-gray-500'
              }`"
            >
              {{
                formData.unlimited_tickets
                  ? "Unlimited tickets available"
                  : "Limited tickets available"
              }}
            </app-normal-text>
          </template>
        </app-checkbox>

        <div
          class="w-full flex flex-col pb-6 pt-3"
          v-if="!formData.unlimited_tickets"
        >
          <div
            class="grid grid-cols-12 items-center relative border-[1.5px] border-[#E0E2E4] rounded-[12px] mt-3 -mb-[20px]"
          >
            <app-normal-text
              :class="`absolute left-4 !top-[-20%] px-1 py-[2px] bg-white !text-[#616161] !font-[500] z-10`"
            >
              Tickets Available
            </app-normal-text>

            <div class="col-span-8 flex flex-row px-4 !text-left py-4 relative">
              <app-content-editable
                v-model="formData.ticket_quantities"
                :default-value="formData.ticket_quantities.toString()"
                class="!font-[500] !text-sm !text-black !min-w-[70px]"
                placeholder="Custom"
                type="number"
                :listenForUpdate="true"
              />
            </div>
            <div
              class="col-span-2 flex flex-row items-center justify-center !text-left py-4 !border-l-[1.5px] !border-r-[1.5px] !border-[#E0E2E4]"
            >
              <div
                @click="
                  formData.ticket_quantities > 0
                    ? formData.ticket_quantities--
                    : null
                "
                :class="`w-[24px] h-[24px] flex items-center justify-center ${
                  formData.ticket_quantities == 0 ? 'opacity-30' : ''
                }`"
              >
                <app-icon name="minus" custom-class="!h-[12px] !w-[16px]" />
              </div>
            </div>

            <div
              class="col-span-2 flex flex-row items-center justify-center px-2 !text-left py-4"
            >
              <div
                @click="formData.ticket_quantities++"
                class="w-[24px] h-[24px] flex items-center justify-center"
              >
                <app-icon name="plus" custom-class="!h-[24px]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full flex flex-col mt-2">
        <!-- All tickets -->
        <div class="w-full flex flex-col mb-4">
          <div
            v-for="(item, index) in allTickets"
            :key="index"
            class="w-full flex flex-row items-center justify-center relative mt-4"
          >
            <div class="w-[75%] h-[135px] -mr-[2%] relative">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 256 146"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <mask
                  id="path-1-outside-1_29687_39616"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="256"
                  height="146"
                  fill="black"
                >
                  <rect fill="white" width="256" height="146" />
                  <path
                    d="M244.003 1C244.129 7.17686 248.922 12.2066 255 12.708V131.791C248.84 132.299 244 137.459 244 143.75C244 144.061 244.012 144.369 244.035 144.674L244.06 145H1V1H244.003Z"
                  />
                </mask>
                <path
                  d="M244.003 1C244.129 7.17686 248.922 12.2066 255 12.708V131.791C248.84 132.299 244 137.459 244 143.75C244 144.061 244.012 144.369 244.035 144.674L244.06 145H1V1H244.003Z"
                  :fill="`${item.color}`"
                  fill-opacity="0.2"
                />
                <path
                  d="M244.003 1L245.003 0.979567L244.983 0H244.003V1ZM255 12.708H256V11.7871L255.082 11.7114L255 12.708ZM255 131.791L255.082 132.788L256 132.712V131.791H255ZM244.035 144.674L245.032 144.599L245.032 144.598L244.035 144.674ZM244.06 145V146H245.137L245.057 144.925L244.06 145ZM1 145H0V146H1V145ZM1 1V0H0V1H1ZM244.003 1L243.003 1.02043C243.14 7.71302 248.333 13.1613 254.918 13.7046L255 12.708L255.082 11.7114C249.512 11.2518 245.118 6.6407 245.003 0.979567L244.003 1ZM255 12.708H254V131.791H255H256V12.708H255ZM255 131.791L254.918 130.794C248.244 131.345 243 136.935 243 143.75H244H245C245 137.984 249.437 133.253 255.082 132.788L255 131.791ZM244 143.75H243C243 144.086 243.013 144.42 243.038 144.75L244.035 144.674L245.032 144.598C245.011 144.318 245 144.035 245 143.75H244ZM244.035 144.674L243.038 144.748L243.062 145.075L244.06 145L245.057 144.925L245.032 144.599L244.035 144.674ZM244.06 145V144H1V145V146H244.06V145ZM1 145H2V1H1H0V145H1ZM1 1V2H244.003V1V0H1V1Z"
                  :fill="`${item.color}`"
                  fill-opacity="0.2"
                  mask="url(#path-1-outside-1_29687_39616)"
                />
              </svg>
              <div
                class="absolute w-full h-full top-0 left-0 flex flex-col px-4 py-4 !pl-3"
              >
                <div class="w-full flex flex-col mb-3">
                  <app-text-field
                    :has-title="false"
                    type="text"
                    placeholder="Name"
                    :ref="`tickerName${index}`"
                    custom-class="!py-3 !border-white"
                    name="Name"
                    v-model="item.name"
                    :rules="[]"
                  >
                    <template #inner-suffix>
                      <app-icon name="trash" @click="removeTicket(index)" />
                    </template>
                  </app-text-field>
                </div>

                <app-text-field
                  :has-title="false"
                  type="number"
                  placeholder="Price"
                  :ref="`tickePrice${1}`"
                  custom-class="!py-3 !border-white"
                  name="Price"
                  v-model="item.price"
                  :rules="[]"
                >
                  <template #inner-suffix>
                    <app-normal-text class="!font-[500] !text-right !text-sm">
                      {{ currentSellCurrency?.symbol }}
                    </app-normal-text>
                  </template>
                </app-text-field>
              </div>
            </div>
            <div class="w-[25%] h-[135px]">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 91 146"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="path-1-outside-1_29687_39675"
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width="91"
                  height="146"
                  fill="black"
                >
                  <rect fill="white" width="91" height="146" />
                  <path
                    d="M90 145H13.959L13.9648 144.924C13.988 144.619 14 144.311 14 144C14 137.709 9.15953 132.549 3 132.041V131.235H1V122.765H3V113.235H1V104.765H3V95.2354H1V86.7646H3V77.2354H1V68.7646H3V59.2354H1V50.7646H3V41.2354H1V32.7646H3V23.2354H1V14.7646H3V12.9688L3.16504 12.9629L3.84766 12.8584C9.59762 11.9704 14 6.99853 14 1H90V145Z"
                  />
                </mask>
                <path
                  d="M90 145H13.959L13.9648 144.924C13.988 144.619 14 144.311 14 144C14 137.709 9.15953 132.549 3 132.041V131.235H1V122.765H3V113.235H1V104.765H3V95.2354H1V86.7646H3V77.2354H1V68.7646H3V59.2354H1V50.7646H3V41.2354H1V32.7646H3V23.2354H1V14.7646H3V12.9688L3.16504 12.9629L3.84766 12.8584C9.59762 11.9704 14 6.99853 14 1H90V145Z"
                  :fill="`${item.color}`"
                />
                <path
                  d="M90 145V146H91V145H90ZM13.959 145L12.9619 144.923L12.8791 146H13.959V145ZM13.9648 144.924L14.9619 145.001L14.962 145L13.9648 144.924ZM3 132.041H2V132.962L2.91778 133.038L3 132.041ZM3 131.235H4V130.235H3V131.235ZM1 131.235H0V132.235H1V131.235ZM1 122.765V121.765H0V122.765H1ZM3 122.765V123.765H4V122.765H3ZM3 113.235H4V112.235H3V113.235ZM1 113.235H0V114.235H1V113.235ZM1 104.765V103.765H0V104.765H1ZM3 104.765V105.765H4V104.765H3ZM3 95.2354H4V94.2354H3V95.2354ZM1 95.2354H0V96.2354H1V95.2354ZM1 86.7646V85.7646H0V86.7646H1ZM3 86.7646V87.7646H4V86.7646H3ZM3 77.2354H4V76.2354H3V77.2354ZM1 77.2354H0V78.2354H1V77.2354ZM1 68.7646V67.7646H0V68.7646H1ZM3 68.7646V69.7646H4V68.7646H3ZM3 59.2354H4V58.2354H3V59.2354ZM1 59.2354H0V60.2354H1V59.2354ZM1 50.7646V49.7646H0V50.7646H1ZM3 50.7646V51.7646H4V50.7646H3ZM3 41.2354H4V40.2354H3V41.2354ZM1 41.2354H0V42.2354H1V41.2354ZM1 32.7646V31.7646H0V32.7646H1ZM3 32.7646V33.7646H4V32.7646H3ZM3 23.2354H4V22.2354H3V23.2354ZM1 23.2354H0V24.2354H1V23.2354ZM1 14.7646V13.7646H0V14.7646H1ZM3 14.7646V15.7646H4V14.7646H3ZM3 12.9688L2.96452 11.9694L2 12.0036V12.9688H3ZM3.16504 12.9629L3.20052 13.9623L3.25875 13.9602L3.31635 13.9514L3.16504 12.9629ZM3.84766 12.8584L3.99897 13.8469L4.00029 13.8467L3.84766 12.8584ZM14 1V0H13V1H14ZM90 1H91V0H90V1ZM90 145V144H13.959V145V146H90V145ZM13.959 145L14.956 145.077L14.9619 145.001L13.9648 144.924L12.9678 144.847L12.9619 144.923L13.959 145ZM13.9648 144.924L14.962 145C14.9871 144.67 15 144.336 15 144H14H13C13 144.285 12.989 144.568 12.9677 144.848L13.9648 144.924ZM14 144H15C15 137.185 9.75609 131.595 3.08222 131.044L3 132.041L2.91778 133.038C8.56297 133.503 13 138.234 13 144H14ZM3 132.041H4V131.235H3H2V132.041H3ZM3 131.235V130.235H1V131.235V132.235H3V131.235ZM1 131.235H2V122.765H1H0V131.235H1ZM1 122.765V123.765H3V122.765V121.765H1V122.765ZM3 122.765H4V113.235H3H2V122.765H3ZM3 113.235V112.235H1V113.235V114.235H3V113.235ZM1 113.235H2V104.765H1H0V113.235H1ZM1 104.765V105.765H3V104.765V103.765H1V104.765ZM3 104.765H4V95.2354H3H2V104.765H3ZM3 95.2354V94.2354H1V95.2354V96.2354H3V95.2354ZM1 95.2354H2V86.7646H1H0V95.2354H1ZM1 86.7646V87.7646H3V86.7646V85.7646H1V86.7646ZM3 86.7646H4V77.2354H3H2V86.7646H3ZM3 77.2354V76.2354H1V77.2354V78.2354H3V77.2354ZM1 77.2354H2V68.7646H1H0V77.2354H1ZM1 68.7646V69.7646H3V68.7646V67.7646H1V68.7646ZM3 68.7646H4V59.2354H3H2V68.7646H3ZM3 59.2354V58.2354H1V59.2354V60.2354H3V59.2354ZM1 59.2354H2V50.7646H1H0V59.2354H1ZM1 50.7646V51.7646H3V50.7646V49.7646H1V50.7646ZM3 50.7646H4V41.2354H3H2V50.7646H3ZM3 41.2354V40.2354H1V41.2354V42.2354H3V41.2354ZM1 41.2354H2V32.7646H1H0V41.2354H1ZM1 32.7646V33.7646H3V32.7646V31.7646H1V32.7646ZM3 32.7646H4V23.2354H3H2V32.7646H3ZM3 23.2354V22.2354H1V23.2354V24.2354H3V23.2354ZM1 23.2354H2V14.7646H1H0V23.2354H1ZM1 14.7646V15.7646H3V14.7646V13.7646H1V14.7646ZM3 14.7646H4V12.9688H3H2V14.7646H3ZM3 12.9688L3.03548 13.9681L3.20052 13.9623L3.16504 12.9629L3.12956 11.9635L2.96452 11.9694L3 12.9688ZM3.16504 12.9629L3.31635 13.9514L3.99897 13.8469L3.84766 12.8584L3.69634 11.8699L3.01373 11.9744L3.16504 12.9629ZM3.84766 12.8584L4.00029 13.8467C10.2304 12.8845 15 7.4993 15 1H14H13C13 6.49775 8.96479 11.0563 3.69503 11.8701L3.84766 12.8584ZM14 1V2H90V1V0H14V1ZM90 1H89V145H90H91V1H90Z"
                  :fill="`${item.color}`"
                  mask="url(#path-1-outside-1_29687_39675)"
                />
              </svg>
            </div>
          </div>
        </div>

        <div
          @click="addNewTicket"
          class="w-full px-4 flex flex-row space-x-1 items-center border-[1.5px] border-primary py-3 rounded-[12px]"
        >
          <app-icon name="add-green" custom-class="!h-[24px]" />
          <app-normal-text class="!text-primary !font-[500]">
            Add Ticket
          </app-normal-text>
        </div>
      </div>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppFormWrapper,
  AppNormalText,
  AppIcon,
  AppTextField,
  AppCheckbox,
  AppSelect,
  AppContentEditable,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { SelectOption } from "@greep/logic/src/logic/types/common";
import { onMounted } from "vue";
import { availableCurrencies } from "../../../composable";
import { computed } from "vue";
import { Product, ProductVariantInput } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppNormalText,
    AppIcon,
    AppTextField,
    AppCheckbox,
    AppSelect,
    AppContentEditable,
  },
  props: {
    product: {
      type: Object as () => Product,
    },
  },
  name: "ProductSetupProductVariants",
  setup(props) {
    const FormValidations = Logic.Form;
    const hideContent = ref(false);

    const colorsToPickFrom = reactive([
      "#009de3",
      "#00a0b4",
      "#8e3be0",
      "#ff7d00",
      "#2ecc71",
      "#3498db",
      "#9b59b6",
      "#f39c12",
      "#e74c3c",
      "#95a5a6",
      "#16a085",
      "#27ae60",
      "#2980b9",
      "#8e44ad",
    ]);

    const formData = reactive<{
      ticket_quantities: number;
      unlimited_tickets: boolean;
      currency: string;
      tickets: {
        name: string;
        price: string;
        color: string;
      }[];
    }>({
      ticket_quantities: 0,
      unlimited_tickets: true,
      currency: "USD",
      tickets: [],
    });

    const allTickets = reactive<
      {
        name: string;
        price: string;
        color: string;
      }[]
    >([]);

    const currencyOptions = reactive<SelectOption[]>([]);

    const showVariantModal = ref(false);

    const formComponent = ref<any>(null);

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state && allTickets.length > 0) {
        formData.ticket_quantities = parseInt(
          formData.ticket_quantities.toString().replaceAll(/,/g, "")
        );
        formData.tickets = allTickets;
        // Proceed with form submission
        return formData;
      } else {
        return;
      }
    };

    const currentSellCurrency = computed(() => {
      return availableCurrencies?.find(
        (item) => item.code == formData.currency
      );
    });

    const addNewTicket = () => {
      const randomColor =
        colorsToPickFrom[Math.floor(Math.random() * colorsToPickFrom.length)];

      allTickets.push({
        name: "",
        price: "",
        color: randomColor,
      });
    };

    const setDefault = () => {
      hideContent.value = true;

      if (props.product) {
        formData.ticket_quantities = props.product.inventoryCount || 0;
        formData.currency = props.product.currency || "USD";
        formData.unlimited_tickets =
          (props.product.inventoryCount || 0) == 100000000;

        const productVariants: ProductVariantInput[] = JSON.parse(
          props.product.variants
        );

        const defaultTickets: {
          name: string;
          price: string;
          color: string;
        }[] = [];

        if (productVariants.length > 0) {
          productVariants.forEach((variant) => {
            defaultTickets.push({
              name: variant.sku,
              price: variant.priceAdjustment.toString(),
              color: variant.attributes[0].value,
            });
          });
        }

        allTickets.length = 0;
        allTickets.push(...defaultTickets);
        formData.tickets = defaultTickets;
      }

      setTimeout(() => {
        hideContent.value = false;
      }, 100);
    };

    const removeTicket = (index: number) => {
      allTickets.splice(index, 1);
    };

    onMounted(() => {
      availableCurrencies.forEach((item) => {
        currencyOptions.push({
          key: item.code,
          value: item.name,
        });
      });
      setDefault();
    });

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
      showVariantModal,
      removeTicket,
      addNewTicket,
      currencyOptions,
      colorsToPickFrom,
      currentSellCurrency,
      allTickets,
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
