<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Content -->
    <div class="w-full flex flex-col h-full">
      <!-- Summary -->
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

      {{ details }}
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, computed } from "vue"
  import { AppNormalText } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { onMounted } from "vue"
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
    setup() {
      const FormValidations = Logic.Form

      const eventOverview = reactive<
        {
          title: string
          content: string
          percentage_progress?: number
        }[]
      >([
        {
          title: "Revenue",
          content: "₺ 48,500",
        },
        {
          title: "Tickets Sold",
          content: "96",
        },
        {
          title: "Tickets Left",
          content: "44",
        },
        {
          title: "Attendees Checked In",
          content: "50/96",
          percentage_progress: 60,
        },
      ])

      const details = computed(() => [
        { title: "Revenue", content: "₺ 48,500" },
        {
          title: "Tickets Sold",
          content: "96",
        },
        {
          title: "Tickets Left",
          content: "44",
        },
        {
          title: "Attendees Checked In",
          content: "50/96",
          percentage_progress: 60,
        },
      ])

      const continueWithForm = () => {
        //
      }

      onMounted(() => {
        //
      })

      return {
        FormValidations,
        Logic,
        continueWithForm,
        eventOverview,
        details,
      }
    },
  })
</script>
