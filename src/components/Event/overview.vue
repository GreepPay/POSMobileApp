<template>
  <div class="w-full flex flex-col px-4 !pb-[140px]">
    <template v-for="(item, index) in eventOverview" :key="index">
      <div
        class="w-full flex flex-col border-[1.5px] border-[#F0F3F6] rounded-[12px] px-4 py-4 mb-4"
      >
        <app-normal-text class="!text-[#616161] !text-left">
          {{ item.title }}
        </app-normal-text>

        <app-normal-text
          class="!text-black !font-[500] !text-lg !text-left mt-2"
        >
          {{ item.content }}
        </app-normal-text>

        <div
          v-if="item.percentage_progress"
          class="w-full bg-[#E0E2E4] rounded-[99px] mt-2 h-[10px] relative"
        >
          <div
            :style="`width: ${item.percentage_progress}%;`"
            class="absolute left-0 top-0 !bg-[#17A068] rounded-[99px] h-full"
          ></div>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
  import { defineComponent, computed } from "vue"
  import { AppNormalText } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { Product } from "@greep/logic/src/gql/graphql"

  export default defineComponent({
    components: {
      AppNormalText,
    },
    props: {
      product: {
        type: Object as () => Product,
      },
    },
    name: "EventOverview",
    setup(props) {
      const FormValidations = Logic.Form

      const revenue = computed(() => props.product?.eventOveview?.revenue || 0)
      const ticketSold = computed(
        () => props.product?.eventOveview?.tickets_sold || 0
      )
      const ticketAvail = computed(
        () => props.product?.eventOveview?.tickets_left
      )
      const checksIn = computed(() => props.product?.eventOveview?.checkins)
      const attendeeCheckedIn = computed(
        () => ticketSold.value / ticketAvail.value || 0
      )

      const eventOverview = computed(() => [
        { title: "Revenue", content: revenue.value },
        { title: "Tickets Sold", content: revenue.value },
        { title: "Tickets Left", content: ticketSold.value },
        {
          title: "Attendees Checked In",
          content: checksIn.value,
          percentage_progress: attendeeCheckedIn.value,
        },
      ])

      return {
        FormValidations,
        Logic,
        eventOverview,
      }
    },
  })
</script>
