<template>
  <app-wrapper mobilePadding="!pt-0">
    <default-page-layout
      :title="Logic.Auth.GetDefaultBusiness()?.business_name"
      :photoUrl="
        Logic.Auth.GetDefaultBusiness()?.logo || '/images/profile-image.svg'
      "
      icon="drop"
      :title-click-action="
        () => Logic.Common.GoToRoute('/auth/switch-business')
      "
    >
      <app-refresher
        class="w-full flex flex-col items-center justify-start"
        :onRefresh="onAppRefresherRefresh"
        ref="appRefreshComp"
      >
        <!-- Balance card section -->
        <div class="w-full flex flex-col space-y-2 pt-2">
          <div class="w-full flex flex-col px-4">
            <app-image-loader
              class="w-full h-fit rounded-[16px] flex flex-col overflow-x-hidden overflow-y-hidden justify-center items-center px-4 py-5 !bg-[linear-gradient(269.64deg,_#0D965E_0.31%,_#00683F_89.75%)] relative"
              photo-url=""
            >
              <img
                class="absolute top-0 left-0 w-full"
                src="/images/greep-transparent-logo.svg"
              />

              <div
                class="w-full flex flex-col space-y-[2px] justify-center items-center pt-2 z-10"
              >
                <app-normal-text class="text-center !text-[#E0E2E4]">
                  Total Balance
                </app-normal-text>

                <app-header-text
                  class="text-center !text-white !text-[27px] !font-normal pb-2"
                >
                  {{ currencySymbol
                  }}{{
                    Logic.Common.convertToMoney(
                      (currentWalletBalance || 0) *
                        (CurrentGlobalExchangeRate?.mid || 1),
                      true,
                      "",
                      false
                    )
                  }}
                </app-header-text>
              </div>
            </app-image-loader>
          </div>

          <!-- Quick Actions -->
          <div
            class="w-full grid grid-cols-12 items-center px-4 pt-3 pb-5 !border-b-[11px] !border-[#F0F3F6]"
          >
            <div
              v-for="(item, index) in quickActions"
              :key="index"
              class="col-span-3 flex flex-col space-y-1 items-center justify-center relative"
              @click="Logic.Common.GoToRoute(item.route_path)"
            >
              <app-icon :name="item.icon" custom-class="!h-[56px]" />

              <app-normal-text class="!text-[#616161] !text-center !font-[500]">
                {{ item.name }}
              </app-normal-text>

              <span
                v-if="item.soon"
                class="px-3 py-[3px] bg-primary rounded-full !text-[10px] !text-white absolute top-[-20%] right-0"
                >Soon</span
              >
            </div>
          </div>
        </div>

        <!-- Switch Tab -->
        <!-- <div class="w-full flex flex-col px-4">
          <app-tabs
            :tabs="homeTab"
            v-model:activeTab="activeTab"
            tabsClass="!w-full flex border-[1.5px] !border-veryLightGray rounded-full"
            tabClass="!flex-1 text-center border-none !mr-0 py-3"
            customClass="!overflow-x-hidden"
            type="badge"
          />
        </div> -->

        <!-- Orders Section -->
        <div
          v-if="recentOrders.length > 0 && businessHasOrder"
          class="w-full px-4 !border-b-[11px] !border-[#F0F3F6] mt-4"
        >
          <div class="w-full flex justify-between items-center">
            <app-normal-text class="font-semibold !text-gray-800 !text-sm">
              Recent {{ orderLabel }}
            </app-normal-text>

            <app-normal-text
              class="text-primary"
              @click="Logic.Common.GoToRoute('/orders')"
            >
              See all
            </app-normal-text>
          </div>
          <app-list-wrapper
            :items="recentOrders"
            title=""
            emptyTitle="No Orders"
            actionText=""
            content-class="!px-0"
          >
            <div
              v-for="(order, index) in recentOrders"
              :key="order.uuid || index"
              class="w-full cursor-pointer"
              @click="goToOrder(order.data)"
            >
              <app-commerce-order-card
                :order="order"
                class="min-w-[80vw]"
                is-mini
              />
            </div>
          </app-list-wrapper>
        </div>

        <div
          class="w-full flex justify-between items-center px-4 z-20 pt-[20px]"
        >
          <app-normal-text class="font-semibold !text-gray-800 !text-sm">
            Transactions
          </app-normal-text>

          <app-normal-text
            class="text-primary"
            @click="Logic.Common.GoToRoute('/transactions')"
          >
            See all
          </app-normal-text>
        </div>

        <!-- Transactions -->
        <div
          class="w-full flex flex-col h-fit bg-white relative px-4 space-y-[5px] min-h-[70vh]"
          id="home_transactions"
        >
          <template v-if="activeTab == 'latest'">
            <div v-if="!recentTransactions.length" class="py-4 !pt-2 z-10">
              <app-empty-state
                title="No transactions"
                description="Collect Payments, Make Withdrawals, and Redeem the GRP Tokens you’ve earned."
              />
            </div>
            <template v-else>
              <app-transaction
                class="z-[10]"
                v-for="transaction in recentTransactions"
                :key="transaction.id"
                :data="transaction"
                @click="
                  Logic.Common.GoToRoute(
                    '/transactions/' +
                      transaction.id +
                      `?group=${transaction.transaction_group}`
                  )
                "
              />

              <div class="w-full flex flex-col pt-3">
                <app-button
                  @click="Logic.Common.GoToRoute('/transactions')"
                  variant="primary"
                  outlined
                  class="py-3 !font-[500] !border-[#F0F3F6]"
                >
                  See all
                </app-button>
              </div>
            </template>
          </template>

          <template v-if="activeTab == 'tools'">
            <div class="w-full grid grid-cols-12 gap-4">
              <div
                v-for="(item, index) in tools"
                :key="index"
                class="col-span-6 flex flex-col z-10 px-3 py-3 border-[1.5px] border-[#F0F3F6] rounded-[12px]"
              >
                <app-icon :name="item.icon" custom-class="23px" />

                <div class="w-full flex flex-col pt-1">
                  <app-normal-text class="!font-semibold !text-sm !text-left">
                    {{ item.name }}
                  </app-normal-text>
                  <app-normal-text class="!text-[#616161] pt-[2px] !text-left">
                    {{ item.sub_title }}
                  </app-normal-text>
                </div>
              </div>
            </div>
          </template>

          <!-- Spacer -->
          <div class="h-[90px] py-4"></div>
        </div>
      </app-refresher>
    </default-page-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, reactive, watch } from "vue";
import {
  AppImageLoader,
  AppNormalText,
  AppHeaderText,
  AppTransaction,
  AppIcon,
  AppEmptyState,
  DefaultPageLayout,
  // AppTabs,
  AppButton,
  AppRefresher,
  AppListWrapper,
  AppCommerceOrderCard,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";
import { onMounted } from "vue";
import {
  getPlatforms,
  onIonViewDidEnter,
  onIonViewDidLeave,
  onIonViewWillEnter,
} from "@ionic/vue";
import { Order, User } from "@greep/logic/src/gql/graphql";
import { computed } from "vue";
import { availableCurrencies } from "../composable";
import {
  getTransaction,
  getPointTransaction,
  TransactionType,
} from "../composable/financials";
import { getOrderDetails, goToOrder } from "../composable/commerce";

export default defineComponent({
  name: "IndexPage",
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
    AppTransaction,
    AppEmptyState,
    AppIcon,
    DefaultPageLayout,
    // AppTabs,
    AppButton,
    AppRefresher,
    AppListWrapper,
    AppCommerceOrderCard,
  },
  layout: "Dashboard",
  middlewares: {
    fetchRules: [
      {
        domain: "Wallet",
        property: "ManyTransactions",
        method: "GetTransactions",
        params: [1, 5],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "ManyPointTransactions",
        method: "GetPointTransactions",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Wallet",
        property: "CurrentGlobalExchangeRate",
        method: "GetGlobalExchangeRate",
        params: [],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
      {
        domain: "Commerce",
        property: "ManyOrders",
        method: "GetOrders",
        params: [1, 10],
        requireAuth: true,
        ignoreProperty: false,
        silentUpdate: true,
      },
    ],
  },
  setup() {
    const defaultCurrency = ref(
      Logic.Auth.GetDefaultBusiness()?.default_currency || "USD"
    );
    const selectedCurrency = ref(
      Logic.Auth.GetDefaultBusiness()?.default_currency || "USD"
    );

    const appRefreshComp = ref<any>(null);

    const selectedCountry = ref("");

    const currencySymbol = computed(
      () =>
        availableCurrencies.find(
          (currency) => currency.code === selectedCurrency.value
        )?.symbol
    );

    const ManyTransactions = ref(Logic.Wallet.ManyTransactions);
    const ManyPointTransactions = ref(Logic.Wallet.ManyPointTransactions);
    const CurrentGlobalExchangeRate = ref(
      Logic.Wallet.CurrentGlobalExchangeRate
    );
    const AuthUser = ref<User>(Logic.Auth.AuthUser);
    const ManyOrders = ref(Logic.Commerce.ManyOrders);

    const currentWalletBalance = ref(0);

    const orderLabel = computed(() => {
      let businessType = Logic.Auth.GetDefaultBusiness()?.business_type;
      if (businessType === "event_host") {
        return "Sales";
      }
      return "Orders";
    });

    const businessHasOrder = computed(() => {
      let businessType = Logic.Auth.GetDefaultBusiness()?.business_type;
      return (
        businessType === "vendor" ||
        businessType === "event_host" ||
        businessType === "exchanger" ||
        businessType === "delivery"
      );
    });

    const recentTransactions = reactive<
      {
        id: string | number;
        title: string;
        amount: number;
        type: TransactionType;
        transactionType: "credit" | "debit";
        date: string;
        currencySymbol: string;
        subAmount: string;
        transaction_group: string;
        real_date: string;
      }[]
    >([]);

    const recentOrders = reactive<
      {
        uuid: string;
        title: string;
        label: string;
        status: string;
        icon: string;
        statusColor: string;
        price: string;
        itemCount: string;
        data: Order;
      }[]
    >([]);

    const activeTab = ref("latest");

    const homeTab = reactive([
      {
        key: "latest",
        label: "Latest",
      },
      {
        key: "tools",
        label: "Tools",
      },
    ]);

    const tools = reactive([
      {
        icon: "tools/pos",
        name: "POS Hardware",
        sub_title: "Get & manage",
        route_path: "#",
      },
      {
        icon: "tools/vendor",
        name: "Vendor",
        sub_title: "Sell products",
        route_path: "#",
      },
      {
        icon: "tools/exchanger",
        name: "Exchanger",
        sub_title: "Sell currency",
        route_path: "#",
      },
      {
        icon: "tools/events",
        name: "Host Events",
        sub_title: "Sell tickets",
        route_path: "#",
      },
      {
        icon: "tools/delivery",
        name: "Item Delivery",
        sub_title: "Ride to earn",
        route_path: "#",
      },
    ]);

    const quickActions = reactive([
      {
        icon: "quick-actions/request",
        route_path: "/request/method",
        name: "Request",
        soon: false,
      },
      {
        icon: "quick-actions/send",
        route_path: "/send/pay",
        name: "Send",
        soon: false,
      },
      {
        icon: "quick-actions/withdraw",
        route_path: "/withdraw",
        name: "Withdraw",
        soon: false,
      },
      {
        icon: "quick-actions/graph",
        route_path: "#",
        name: "Insights",
        soon: true,
      },
    ]);

    const setPageDefaults = () => {
      defaultCurrency.value =
        Logic.Auth.GetDefaultBusiness()?.default_currency || "USD";
      selectedCurrency.value = defaultCurrency.value;

      setCurrentWalletBalance();
    };

    const currentPlatform = computed(() => {
      return getPlatforms()[0];
    });

    const setCurrentWalletBalance = () => {
      // let midRate = CurrentGlobalExchangeRate.value?.mid || 0;

      // if (selectedCurrency.value == 'USD') {
      //   midRate = 1;
      // }
      currentWalletBalance.value =
        Logic.Auth.GetDefaultBusiness()?.wallet?.total_balance;
    };

    const setTransactionData = () => {
      recentTransactions.length = 0;

      // Normal transactions
      ManyTransactions.value?.data?.forEach((data) => {
        const transaction = getTransaction(
          data,
          selectedCurrency.value,
          currencySymbol.value || ""
        );
        recentTransactions.push(transaction);
      });

      // Point transactions
      ManyPointTransactions.value?.data?.forEach((data) => {
        const pointTransaction = getPointTransaction(
          data,
          currencySymbol.value || ""
        );
        recentTransactions.push(pointTransaction);
      });

      // Sort transactions desc by date
      recentTransactions.sort(
        (a, b) =>
          new Date(b.real_date).getTime() - new Date(a.real_date).getTime()
      );
    };

    const onAppRefresherRefresh = async () => {
      Logic.Common.showLoader({
        show: true,
        loading: true,
      });

      // Run non-blocking fetches

      Logic.Wallet.GetTransactions(1, 5, "CREATED_AT");
      Logic.Wallet.GetPointTransactions(1, 5, "CREATED_AT");
      return await Promise.all([Logic.Auth.GetAuthUser()])
        .then(() => {
          Logic.Common.hideLoader();
        })
        .catch(() => {
          Logic.Common.hideLoader();
        });
    };

    onIonViewDidEnter(() => {
      setPageDefaults();
      setTransactionData();
      setTimeout(() => {
        Logic.Auth.GetAuthUser();
      }, 500);
      setCurrentWalletBalance();
    });

    onIonViewWillEnter(() => {
      //  Logic.Auth.GetCurrentAppVersion()?.then((version) => {
      //    checkAppVersion(version || '1.0');
      // });
    });

    watch(
      [
        ManyPointTransactions,
        ManyTransactions,
        currencySymbol,
        CurrentGlobalExchangeRate,
      ],
      () => {
        setTransactionData();
        setCurrentWalletBalance();
      }
    );

    watch(AuthUser, () => {
      setCurrentWalletBalance();
    });

    onIonViewWillEnter(() => {
      appRefreshComp.value?.registerListeners();
    });

    onIonViewDidLeave(async () => {
      appRefreshComp.value?.removeListeners();
    });

    const setOrderData = () => {
      recentOrders.length = 0;
      const orders = ManyOrders.value?.data || [];
      if (Array.isArray(orders)) {
        orders.forEach((order) => {
          const details = getOrderDetails(order);
          recentOrders.push(details);
        });
      }
    };

    watch(ManyOrders, () => {
      setOrderData();
    });

    onMounted(() => {
      // Register reactive data
      Logic.Wallet.watchProperty("ManyTransactions", ManyTransactions);
      Logic.Wallet.watchProperty(
        "ManyPointTransactions",
        ManyPointTransactions
      );
      Logic.Wallet.watchProperty(
        "CurrentGlobalExchangeRate",
        CurrentGlobalExchangeRate
      );
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      Logic.Commerce.watchProperty("ManyOrders", ManyOrders);
      setPageDefaults();
      setTransactionData();
      setOrderData();
      setCurrentWalletBalance();

      // Update notification token
      Logic.Notification.addListeners().then(() => {
        Logic.Notification.registerNotifications().then(() => {
          // registration completed
        });
      });
    });

    return {
      recentTransactions,
      recentOrders,
      Logic,
      defaultCurrency,
      selectedCurrency,
      currencySymbol,
      AuthUser,
      CurrentGlobalExchangeRate,
      currentPlatform,
      availableCurrencies,
      quickActions,
      homeTab,
      activeTab,
      tools,
      currentWalletBalance,
      selectedCountry,
      businessHasOrder,
      appRefreshComp,
      orderLabel,
      onAppRefresherRefresh,
      goToOrder,
    };
  },
});
</script>

<style scoped>
#home_transactions:before {
  content: "";
  position: absolute;
  top: -40px;
  left: 0;
  height: 40px;
  width: 40px;
  border-bottom-left-radius: 50%;
  background-color: transparent;
  box-shadow: 0 20px 0 0 #ffffff;
  z-index: 1;
}

#home_transactions:after {
  content: "";
  position: absolute;
  top: -40px;
  right: 0;
  height: 40px;
  width: 40px;
  border-bottom-right-radius: 50%;
  background-color: transparent;
  box-shadow: 0 20px 0 0 #ffffff;
  z-index: 1;
}
</style>
