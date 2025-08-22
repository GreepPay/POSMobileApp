<template>
  <div class="w-full flex flex-col items-center justify-start pt-1 !pb-[140px]">
    <!-- Content -->
    <div class="w-full flex flex-col h-full px-4">
      <!-- Filter -->
      <div class="w-full flex flex-row items-center">
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
      </div>

      <div
        class="w-full flex flex-col space-y-1 border-[#E0E2E4] border-[1.5px] px-4 py-4 rounded-[16px] mt-4"
      >
        <div class="w-full flex flex-row items-center justify-between">
          <app-select
            v-model="filterSetup.period"
            :options="monthFilterOption"
            is-wrapper
            @OnOptionSelected="
              (option) => {
                currentOptionName = option.value
                if (option.extraInfo) {
                  filterFrom = option.extraInfo[0]
                  filterTo = option.extraInfo[1]
                } else {
                  filterFrom = ''
                  filterTo = ''
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
      <template v-if="!eventTickets.length">
        <app-empty-state
          title="No Revenue available"
          description="No Revenue available"
        />
      </template>

      <template v-else>
        <div
          v-for="(eventTicket, index) in eventTickets"
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
                {{
                  `${eventTicket?.user?.first_name} ${eventTicket?.user?.last_name}`
                }}
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
                  {{ eventTicket.createdAt }}
                </app-normal-text>
              </div>
            </div>
          </div>

          <div class="flex flex-col justify-start">
            <app-normal-text class="!text-right !font-[500] !text-sm">
              {{
                `${eventTicket?.sale?.currency} ${eventTicket?.sale?.totalAmount}`
              }}
            </app-normal-text>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref } from "vue"
  import {
    AppNormalText,
    AppTextField,
    AppSelect,
    AppIcon,
    AppLoading,
    AppEmptyState,
  } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { onMounted } from "vue"
  import { SelectOption } from "@greep/ui-components/src/types"
  import { Ticket } from "@greep/logic/src/gql/graphql"

  export default defineComponent({
    components: {
      AppNormalText,
      AppTextField,
      AppSelect,
      AppIcon,
      AppLoading,
      AppEmptyState,
    },
    props: {
      eventTickets: {
        type: Array as () => Ticket[],
      },
    },
    name: "EventRevenue",
    setup() {
      const FormValidations = Logic.Form

      const filterIsLoading = ref(false)
      const filterSetup = reactive({
        from: "",
        to: "",
        period: "",
      })

      const currencySymbol = ref("$")

      const filterFrom = ref(filterSetup.from)
      const filterTo = ref(filterSetup.to)

      const currentOptionName = ref("All Time")

      const monthFilterOption = reactive<SelectOption[]>([])

      const orders = reactive<
        {
          name: string
          date: string
          order_type: string
          price: string
        }[]
      >([
        {
          name: "Arlene McCoy",
          date: "Today",
          price: "₺450.00",
          order_type: "Ticker",
        },
        {
          name: "Floyd Miles",
          date: "Today",
          price: "₺450.00",
          order_type: "Ticker",
        },
        {
          name: "Ralph Edwards",
          date: "Today",
          price: "₺450.00",
          order_type: "Ticker",
        },
        {
          name: "Jerome Bell",
          date: "Today",
          price: "₺450.00",
          order_type: "Ticker",
        },
        {
          name: "Eleanor Pena",
          date: "Today",
          price: "₺450.00",
          order_type: "Ticker",
        },
      ])

      const setDefaultMonthOptions = () => {
        monthFilterOption.length = 0
        monthFilterOption.push({
          value: "All Time",
          key: "all_time",
        })

        const currentDate = new Date()

        for (let i = 0; i < 10; i++) {
          const month = currentDate.getMonth()
          const year = currentDate.getFullYear()
          const monthName = currentDate.toLocaleString("default", {
            month: "long",
          })
          const firstDayOfMonth = new Date(year, month, 1)
          const lastDayOfMonth = new Date(year, month + 1, 0)

          const formattedFirstDay = firstDayOfMonth.toLocaleDateString(
            "en-US",
            {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
            }
          )

          const formattedLastDay = lastDayOfMonth.toLocaleDateString("en-US", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })

          monthFilterOption.push({
            value: `${monthName}, ${year}`,
            key: `${monthName.toLowerCase()}_${year}`,
            extraInfo: [formattedFirstDay, formattedLastDay],
          })

          currentDate.setMonth(month - 1)
        }
      }

      const continueWithForm = () => {
        //
      }

      onMounted(() => {
        setDefaultMonthOptions()
      })

      return {
        FormValidations,
        Logic,
        continueWithForm,
        orders,
        filterFrom,
        filterTo,
        filterSetup,
        currentOptionName,
        monthFilterOption,
        filterIsLoading,
        currencySymbol,
      }
    },
  })
</script>
