<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 pt-1"
  >
    <!-- Content -->
    <div class="w-full flex flex-col h-full">
      <!-- Filter -->
      <!-- <div class="w-full flex flex-row items-center px-4">
        <div
          v-for="(item, index) in filterTabs"
          :key="index"
          :class="`px-4 py-2 flex flex-row items-center rounded-[999px] border-[1.5px] justify-center mr-2 ${
            selectedTab == item.key
              ? '!bg-[#0A141E] !border-[#0A141E]'
              : '!border-[#E0E2E4]'
          }`"
          @click="selectedTab = item.key"
        >
          <app-normal-text
            :class="`${
              selectedTab == item.key
                ? '!font-[500] !text-white'
                : '  !text-[#999999]'
            }`"
          >
            {{ item.value }}
          </app-normal-text>
        </div>
      </div> -->

      <!-- Attendees -->
      <div class="w-full flex flex-col px-4 !pb-[140px] mt-6">
        <template v-if="!eventTickets.length">
          <app-empty-state
            title="No Attendees available"
            description="No Attendees available"
          />
        </template>

        <template v-else>
          <div
            v-for="(eventTicket, index) in eventTickets"
            :key="index"
            class="w-full flex flex-row items-center mb-4"
          >
            <div class="w-[48px] mr-3">
              <app-avatar
                :src="eventTicket?.user?.profile?.profile_picture"
                class="!w-[48px] !h-[48px] rounded-full"
              />
            </div>

            <div class="w-full flex flex-col">
              <app-normal-text class="!text-sm !font-[500] mb-[3px]">
                {{
                  `${eventTicket?.user?.first_name} ${eventTicket?.user?.last_name}`
                }}
              </app-normal-text>

              <app-normal-text class="!text-[#616161] !text-left">
                {{ eventTicket.ticketType }}
              </app-normal-text>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive } from "vue"
  import { AppNormalText, AppAvatar, AppEmptyState } from "@greep/ui-components"
  import { Logic } from "@greep/logic"
  import { onMounted } from "vue"
  import { ref } from "vue"
  import { Ticket } from "@greep/logic/src/gql/graphql"

  export default defineComponent({
    components: {
      AppNormalText,
      AppAvatar,
      AppEmptyState,
    },
    props: {
      eventTickets: {
        type: Array as () => Ticket[],
      },
    },
    name: "EventAttendees",
    setup() {
      const FormValidations = Logic.Form

      const selectedTab = ref("attendees")

      const filterTabs = reactive([
        { value: "Attendees", key: "attendees" },
        { value: "Checked In", key: "checked_in" },
      ])

      const attendees = reactive<
        {
          name: string
          photo_url: string
          ticket_type: string
          checked_in: boolean
        }[]
      >([
        {
          name: "Arlene McCoy",
          photo_url: "/images/temps/attendee-1.jpg",
          ticket_type: "Regular",
          checked_in: true,
        },
        {
          name: "Floyd Miles",
          photo_url: "/images/temps/attendee-2.jpg",
          ticket_type: "Regular",
          checked_in: false,
        },
        {
          name: "Ralph Edwards",
          photo_url: "/images/temps/attendee-3.jpg",
          ticket_type: "VIP",
          checked_in: true,
        },
        {
          name: "Jerome Bell",
          photo_url: "/images/temps/attendee-4.jpg",
          ticket_type: "Regular",
          checked_in: false,
        },
        {
          name: "Eleanor Pena",
          photo_url: "/images/temps/attendee-5.jpg",
          ticket_type: "Regular",
          checked_in: true,
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
        attendees,
        selectedTab,
        filterTabs,
      }
    },
  })
</script>
