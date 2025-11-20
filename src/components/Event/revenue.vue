<template>
  <div class="w-full flex flex-col items-center justify-start pt-1 !pb-[140px]">
    <!-- Content -->
    <div class="w-full flex flex-col h-full px-4">
      <!-- Filter -->
      <!-- <div class="w-full flex flex-row items-center">
        <div class="w-1/2 flex flex-col">
          <app-text-field
            :has-title="false"
            type="date"
            placeholder="From"
            ref="from"
            name="from"
            v-model="filterFrom"
            custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-r-[0px] px-4 py-4 !bg-transparent"
            :input-style="`!text-sm`"
            :updateValue="filterFrom"
            :watchUpdates="true"
          >
            <template #inner-suffix>
              <app-icon name="calendar" custom-class="h-[22px]" />
            </template>
          </app-text-field>
        </div>
        <div class="w-1/2 flex flex-col">
          <app-text-field
            :has-title="false"
            type="date"
            placeholder="To"
            ref="to"
            name="to"
            v-model="filterTo"
            custom-class="!border-[1.5px] border-[#E0E2E4] !rounded-l-[0px] !border-l-[0px] px-4 py-4 !bg-transparent"
            :input-style="`!text-sm`"
            :updateValue="filterTo"
            :watchUpdates="true"
          >
            <template #inner-suffix>
              <app-icon name="calendar" custom-class="h-[22px]" />
            </template>
          </app-text-field>
        </div>
      </div> -->

      <div class="flex flex-col pb-2">
        <app-tabs
          :tabs="revenueTabs"
          v-model:activeTab="selectedTab"
          tabsClass="!w-full flex border !border-veryLightGray rounded-full"
          tabClass="!flex-1 text-center border-none !mr-0 py-3"
          customClass="!overflow-x-hidden"
          type="badge"
        />
      </div>
      <div
        v-if="false"
        class="w-full flex flex-col space-y-1 border-[#E0E2E4] border-[1.5px] px-4 py-4 rounded-[16px] mt-4"
      >
        <div class="w-full flex flex-row items-center justify-between">
          <app-select
            v-model="filterSetup.period"
            :options="monthFilterOption"
            is-wrapper
            @OnOptionSelected="
              (option) => {
                currentOptionName = option.value;
                if (option.extraInfo) {
                  filterFrom = option.extraInfo[0];
                  filterTo = option.extraInfo[1];
                } else {
                  filterFrom = '';
                  filterTo = '';
                }
              }
            "
          >
            <div
              class="flex flex-row space-x-[3px] items-center w-full justify-start"
            >
              <app-normal-text
                custom-class="!text-black !font-semibold !text-left !text-sm"
                >{{ currentOptionName }}</app-normal-text
              >
              <app-icon name="dropdown" custom-class="!h-[6px]" />
            </div>
          </app-select>

          <div>
            <app-loading class="!text-green" v-if="filterIsLoading" />
          </div>
        </div>

        <div class="w-full flex flex-row items-center space-x-3">
          <app-normal-text
            custom-class="!text-black !font-[500] !text-left !text-sm"
            >In | {{ currencySymbol }}
            {{
              Logic.Common.convertToMoney(30000, true, "", false)
            }}</app-normal-text
          >
        </div>
      </div>
    </div>

    <div class="w-full flex flex-col px-4 mt-2">
      <template v-if="!ticketSales?.length">
        <app-empty-state
          title="No sales available"
          description="No sales available"
        />
      </template>

      <template v-else>
        <template v-if="selectedTab == 'history'">
          <div
            v-for="(eventTicket, index) in ticketSales"
            :key="index"
            class="w-full flex flex-row items-center justify-between pt-4 pb-4 !border-b-[1.5px] !border-[#F0F3F6]"
          >
            <div class="flex flex-row items-center">
              <div class="w-[48px] mr-3">
                <div class="w-[48px]">
                  <app-icon :name="`ticket-in`" custom-class="!h-[48px]" />
                </div>
              </div>

              <div class="w-full flex flex-col">
                <app-normal-text
                  class="!text-left !text-black !font-[500] !text-sm mb-[3px]"
                >
                  {{ `${eventTicket?.name}` }}
                </app-normal-text>

                <div class="w-full flex flex-row items-center">
                  <app-normal-text class="!text-left !text-[#616161]">
                    {{ eventTicket.order_type }}
                  </app-normal-text>

                  <div
                    class="h-[4px] w-[4px] rounded-full mx-[6px]"
                    :style="`background-color: #616161 !important;`"
                  ></div>
                  <app-normal-text class="!text-left !text-[#616161]">
                    {{ eventTicket.date }}
                  </app-normal-text>
                </div>
              </div>
            </div>

            <div class="flex flex-col justify-start">
              <app-normal-text class="!text-right !font-[600] !text-sm">
                {{ `${eventTicket?.price}` }}
              </app-normal-text>
            </div>
          </div>
        </template>

        <template v-else-if="selectedTab == 'popularity'">
          <div
            v-for="(ticket, index) in popularTicket"
            class="flex flex-col"
            :key="index"
          >
            <div
              class="w-full flex flex-row items-center justify-between !border-[1.5px] mb-4 !border-[#F0F3F6] rounded-[16px] py-4 px-4 !pl-3"
            >
              <div class="flex flex-row items-center">
                <div
                  class="w-[50px] h-[55px] items-center justify-center flex flex-row"
                >
                  <svg
                    width="42"
                    height="56"
                    viewBox="0 0 42 56"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    v-if="!ticket.is_vote"
                  >
                    <path
                      d="M0 24.5C3.86599 24.5 7 22.1495 7 19.25C7 16.3505 3.86599 14 0 14V0H42V14C38.134 14 35 16.3505 35 19.25C35 22.1495 38.134 24.5 42 24.5V56H0V24.5Z"
                      :fill="ticket?.color"
                    />
                    <defs>
                      <linearGradient
                        id="paint0_linear_37864_44887"
                        x1="21"
                        y1="0"
                        x2="21"
                        y2="56"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stop-color="#009DE3" />
                        <stop offset="1" stop-color="#00619D" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <app-image-loader
                    v-else
                    :photoUrl="ticket.image_url || '/images/profile-image.svg'"
                    class="h-[45px] w-[45px] rounded-full"
                    can-show-full-image
                  >
                  </app-image-loader>
                </div>

                <div class="flex flex-col pl-1">
                  <app-normal-text
                    class="!font-semibold !text-left !text-[13px]"
                  >
                    {{ ticket?.name }}
                  </app-normal-text>
                  <app-normal-text
                    class="!text-[#616161] !text-left !pt-[4px] !text-[13px]"
                  >
                    {{ ticket?.price }}
                  </app-normal-text>
                </div>
              </div>

              <div class="flex flex-col justify-end">
                <app-normal-text
                  class="!font-semibold !text-right !text-[13px]"
                >
                  x<span class="!text-[15px]">{{ ticket?.sales }}</span>
                </app-normal-text>
                <app-normal-text
                  class="!text-[#616161] !text-right !pt-[4px] !text-[13px]"
                >
                  +
                  {{ ticket?.currency_symbol
                  }}{{
                    Logic.Common.convertToMoney(
                      ticket?.revenue,
                      true,
                      "",
                      false
                    )
                  }}
                </app-normal-text>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppNormalText,
  AppTextField,
  AppSelect,
  AppIcon,
  AppLoading,
  AppEmptyState,
  AppTabs,
  availableCurrencies,
  AppImageLoader,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { onMounted } from "vue";
import { SelectOption } from "@greep/ui-components/src/types";
import { ProductVariantInput, Ticket } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  components: {
    AppNormalText,
    AppTextField,
    AppSelect,
    AppIcon,
    AppLoading,
    AppEmptyState,
    AppTabs,
    AppImageLoader,
  },
  props: {
    eventTickets: {
      type: Array as () => Ticket[],
    },
  },
  name: "EventRevenue",
  setup() {
    const FormValidations = Logic.Form;

    const filterIsLoading = ref(false);
    const filterSetup = reactive({
      from: "",
      to: "",
      period: "",
    });
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );

    const currencySymbol = ref("$");

    const filterFrom = ref(filterSetup.from);
    const filterTo = ref(filterSetup.to);

    const currentOptionName = ref("All Time");

    const selectedTab = ref("popularity");

    const revenueTabs = reactive([
      {
        label: "Popularity",
        key: "popularity",
      },
      {
        label: "History",
        key: "history",
      },
    ]);

    const monthFilterOption = reactive<SelectOption[]>([]);

    const popularTicket = reactive<
      {
        name: string;
        color: string;
        price: string;
        image_url: string;
        is_vote: boolean;
        revenue: number;
        currency_symbol: string;
        sales: number;
      }[]
    >([]);

    const ticketSales = reactive<
      {
        name: string;
        date: string;
        order_type: string;
        price: string;
        real_date: string;
      }[]
    >([]);

    const setDefaultMonthOptions = () => {
      monthFilterOption.length = 0;
      monthFilterOption.push({
        value: "All Time",
        key: "all_time",
      });

      const currentDate = new Date();

      for (let i = 0; i < 10; i++) {
        const month = currentDate.getMonth();
        const year = currentDate.getFullYear();
        const monthName = currentDate.toLocaleString("default", {
          month: "long",
        });
        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const formattedFirstDay = firstDayOfMonth.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        const formattedLastDay = lastDayOfMonth.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });

        monthFilterOption.push({
          value: `${monthName}, ${year}`,
          key: `${monthName.toLowerCase()}_${year}`,
          extraInfo: [formattedFirstDay, formattedLastDay],
        });

        currentDate.setMonth(month - 1);
      }
    };

    const setTicketSales = () => {
      ticketSales.length = 0;
      popularTicket.length = 0;
      const productVariants: ProductVariantInput[] = JSON.parse(
        Logic.Commerce.SingleProduct?.variants || "[]"
      );

      const product = Logic.Commerce.SingleProduct;

      const allTickets = {} as any;

      const currencyInfo = availableCurrencies.find(
        (item) => item.code === CurrentGlobalExchangeRate?.value?.target
      );

      productVariants.forEach((variant) => {
        const currentCurrency = availableCurrencies.find(
          (item) => item.code === product?.currency
        );

        const is_vote_attribute = variant.attributes.find(
          (attr) => attr.key === "is_vote"
        );

        const image_url_attribute = variant.attributes.find(
          (attr) => attr.key === "image_url"
        );

        allTickets[variant.id] = {
          name: variant?.sku || "",
          color: variant.attributes[0].value,
          price: `${currentCurrency?.symbol}${Logic.Common.convertToMoney(
            variant.priceAdjustment,
            false,
            ""
          )}`,
          image_url:
            image_url_attribute && image_url_attribute.value
              ? image_url_attribute.value
              : "",
          is_vote:
            is_vote_attribute && is_vote_attribute.value === "yes"
              ? true
              : false,
          revenue: 0,
          currency_symbol: currencyInfo?.symbol || "$",
          sales: 0,
        };
      });

      const midRate = CurrentGlobalExchangeRate.value
        ? CurrentGlobalExchangeRate.value.mid
        : 1;

      const allTicketsItems = Logic.Commerce.SingleProduct?.tickets;

      Logic.Commerce.SingleProduct?.productSales?.forEach((sale) => {
        const extraData = JSON.parse(sale.extra_data || "{}");

        if (extraData?.variantId && allTickets[extraData.variantId]) {
          allTickets[extraData.variantId].revenue +=
            parseFloat(sale.amount.toString()) * midRate;
        }

        const currentTicket = allTickets[extraData.variantId];

        ticketSales.push({
          name: `${sale.user?.first_name} ${sale.user?.last_name}`,
          date: Logic.Common.timeFromNow(sale.created_at || ""),
          order_type: currentTicket?.is_vote ? "Vote" : "Ticket",
          price: `${currencyInfo?.symbol || ""}${Logic.Common.convertToMoney(
            sale.amount * midRate,
            true,
            "",
            false
          )}`,
          real_date: sale.created_at || "",
        });
      });

      // Update ticket sales count
      allTicketsItems?.forEach((ticketItem) => {
        if (allTickets[ticketItem.variantId || ""]) {
          allTickets[ticketItem.variantId || ""].sales += 1;
        }
      });

      Object.keys(allTickets).forEach((key) => {
        popularTicket.push(allTickets[key]);
      });

      //  Sort ticket sales by real date - descending
      ticketSales.sort((a, b) => {
        const dateA = new Date(a.real_date);
        const dateB = new Date(b.real_date);
        return dateB.getTime() - dateA.getTime();
      });

      // Order by sales - descending
      popularTicket.sort((a, b) => b.sales - a.sales);
    };

    const continueWithForm = () => {
      //
    };

    onMounted(() => {
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      setDefaultMonthOptions();
      setTicketSales();
    });

    return {
      FormValidations,
      Logic,
      continueWithForm,
      ticketSales,
      filterFrom,
      filterTo,
      filterSetup,
      currentOptionName,
      monthFilterOption,
      filterIsLoading,
      currencySymbol,
      revenueTabs,
      selectedTab,
      popularTicket,
    };
  },
});
</script>
