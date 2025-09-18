<template>
  <app-wrapper>
    <subpage-layout title="Transaction Details">
      <div
        class="w-full flex flex-col items-center justify-start px-4 h-full"
        id="transactionReceiptContent"
      >
        <AmountCard
          :amount="pageSetup.amount"
          :label="pageSetup.title"
          :currencySymbol="currencySymbol"
        />

        <!-- GRP token -->
        <div
          v-if="pageSetup.has_grp"
          class="w-full flex flex-row items-center justify-between px-3 py-3 border-[1.5px] rounded-[18px] border-light-gray-one mt-4"
        >
          <app-normal-text class="!text-gray-two !text-left">
            GRP Token Earned
          </app-normal-text>

          <div class="flex flex-row space-x-1 items-center justify-end">
            <app-normal-text
              class="!text-black !text-right font-semibold !text-sm"
            >
              {{ Logic.Common.convertToMoney(pageSetup.grp_amount, true, "") }}
            </app-normal-text>
            <app-icon name="grp-token" class="!h-[24px]" />
          </div>
        </div>

        <!-- Transaction details -->
        <div
          class="w-full flex flex-col space-y-2 px-4 border-[1px] border-light-gray-one rounded-[18px] py-4 mt-4"
        >
          <div
            :class="`w-full flex flex-row items-center justify-between pb-2 pt-2 ${
              index < transactionDetails.length - 1
                ? 'border-b-[1.5px] border-light-gray-one'
                : ''
            }  `"
            v-for="(item, index) in transactionDetails"
            :key="index"
          >
            <app-normal-text class="!text-gray-two !text-left">
              {{ item.title }}
            </app-normal-text>

            <app-normal-text
              class="!text-black !text-right !text-sm font-[500]"
            >
              {{ item.value }}
            </app-normal-text>
          </div>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        :style="`
          ${getBottomPadding}
        `"
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            outlined
            class="!py-4"
            @click="downloadReceipt('image', 'transactionReceiptContent')"
            >Share Receipt</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
  import { defineComponent } from "vue"
  import { AppButton, AppIcon, AppNormalText } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { reactive } from "vue"
  import AmountCard from "@/components/Common/AmountCard.vue"
  import { ref } from "vue"
  import { onMounted } from "vue"
  import {
    getPointTransaction,
    getTransaction,
  } from "../../composable/financials"
  import { availableCurrencies, getBottomPadding } from "../../composable"
  import { onIonViewWillEnter } from "@ionic/vue"
  import { watch } from "vue"
  import { capitalize } from "vue"
  import { downloadReceipt } from "../../composable/common"

  export default defineComponent({
    name: "PaymentIdPage",
    components: {
      AppButton,
      AppIcon,
      AppNormalText,
      AmountCard,
    },
    middlewares: {
      fetchRules: [
        {
          domain: "Wallet",
          property: "SingleTransaction",
          method: "GetSingleTransaction",
          params: [],
          requireAuth: true,
          ignoreProperty: true,
          useRouteId: true,
          condition: {
            routeSearchItem: "fullPath",
            searchQuery: "normal",
          },
        },
        {
          domain: "Wallet",
          property: "SinglePointTransaction",
          method: "GetSinglePointTransaction",
          params: [],
          requireAuth: true,
          ignoreProperty: true,
          useRouteId: true,
          condition: {
            routeSearchItem: "fullPath",
            searchQuery: "point",
          },
        },
      ],
    },
    setup() {
      const SingleTransaction = ref(Logic.Wallet.SingleTransaction)
      const SinglePointTransaction = ref(Logic.Wallet.SinglePointTransaction)

      const transactionGroup = ref<"normal" | "point">("normal")

      const selectedCurrency = ref(
        Logic.Auth.AuthUser?.businesses[0]?.default_currency
      )

      const pageSetup = reactive({
        amount: 0,
        title: "Amount Received",
        has_grp: false,
        grp_amount: 0,
      })

      const transactionDetails = reactive<
        {
          title: string
          value: string
        }[]
      >([
        {
          title: "Sender",
          value: "Raymond Akinola",
        },
        {
          title: "Bank",
          value: "GTBank (201***6671)",
        },
        {
          title: "Type",
          value: "Transfer",
        },
        {
          title: "Amount",
          value: "₦33,000 ($22)",
        },
        {
          title: "Time",
          value: "13:55 - Feb 20, 2025",
        },
      ])

      const currencySymbol = ref(
        availableCurrencies.find(
          (currency) => currency.code === selectedCurrency.value
        )?.symbol
      )

      const setupPageContent = () => {
        // Set group from query params

        transactionGroup.value =
          Logic.Common.route?.query?.group?.toString() as "normal" | "point"

        if (transactionGroup.value === "point") {
          pageSetup.amount = SinglePointTransaction.value?.amount || 0
          pageSetup.has_grp = false

          if (SinglePointTransaction.value) {
            const transactionType =
              SinglePointTransaction.value?.dr_or_cr == "credit"
                ? "Reward"
                : "Redemption"

            const transactionInfo = getPointTransaction(
              SinglePointTransaction.value,
              currencySymbol.value || ""
            )

            transactionDetails.push({
              title: "Summary",
              value: SinglePointTransaction.value?.description || "",
            })
            transactionDetails.push({
              title: "Type",
              value: transactionType,
            })
            transactionDetails.push({
              title: "Status",
              value: SinglePointTransaction.value?.status || "Pending",
            })
            transactionDetails.push({
              title: "Reference",
              value: SinglePointTransaction.value?.reference || "",
            })
            transactionDetails.push({
              title: "Amount",
              value: `${
                transactionInfo.currencySymbol
              } ${Logic.Common.convertToMoney(
                transactionInfo.amount,
                true,
                ""
              )} (${transactionInfo.subAmount})`,
            })
            transactionDetails.push({
              title: "Time",
              value: Logic.Common.fomartDate(
                SingleTransaction.value?.created_at,
                "HH:mm - MMM DD, YYYY"
              ),
            })
          }
        } else {
          pageSetup.amount = SingleTransaction.value?.amount || 0
          pageSetup.has_grp = true
          pageSetup.grp_amount =
            SingleTransaction.value?.point_transaction?.amount || 0

          const transactionType =
            SingleTransaction.value?.dr_or_cr == "credit"
              ? "Payment"
              : "Withdrawal"

          transactionDetails.length = 0

          if (SingleTransaction.value) {
            const transactionInfo = getTransaction(
              SingleTransaction.value,
              selectedCurrency.value,
              currencySymbol.value || ""
            )

            transactionDetails.push({
              title: "Summary",
              value: SingleTransaction.value?.description || "",
            })
            transactionDetails.push({
              title: "Type",
              value: transactionType,
            })
            transactionDetails.push({
              title: "Status",
              value: capitalize(SingleTransaction.value?.status || "Pending"),
            })
            transactionDetails.push({
              title: "Reference",
              value: SingleTransaction.value?.reference || "",
            })
            transactionDetails.push({
              title: "Amount",
              value: `${
                transactionInfo.currencySymbol
              } ${Logic.Common.convertToMoney(
                transactionInfo.amount,
                true,
                ""
              )} (${transactionInfo.subAmount})`,
            })
            transactionDetails.push({
              title: "Time",
              value: Logic.Common.fomartDate(
                SingleTransaction.value?.created_at,
                "HH:mm - MMM DD, YYYY"
              ),
            })
          }

          if (SingleTransaction.value?.dr_or_cr == "credit") {
            pageSetup.title = "Amount Received"
          } else {
            pageSetup.title = "Amount Sent"
          }
        }
      }

      watch(
        [SingleTransaction, SinglePointTransaction, transactionGroup],
        () => {
          setupPageContent()
        }
      )

      onIonViewWillEnter(() => {
        setupPageContent()
      })

      onMounted(() => {
        Logic.Wallet.watchProperty("SingleTransaction", SingleTransaction)
        Logic.Wallet.watchProperty(
          "SinglePointTransaction",
          SinglePointTransaction
        )
        setupPageContent()
      })

      return {
        Logic,
        transactionDetails,
        pageSetup,
        currencySymbol,
        getBottomPadding,
        downloadReceipt,
      }
    },
  })
</script>
