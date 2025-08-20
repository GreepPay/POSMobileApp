<template>
  <div
    class="w-full flex flex-col items-center justify-start h-full space-y-6 !mb-[130px]"
  >
    <!-- Form -->
    <div class="w-full flex flex-col h-full">
      <!-- Info box -->
      <app-info-box v-if="!authUser">
        <app-normal-text class="!leading-5">
          <span class="font-semibold">All types have finance tools</span>
          to track, request, spend, and withdraw money.
        </app-normal-text>
      </app-info-box>

      <div class="pt-5 flex flex-col w-full">
        <div
          v-for="(item, index) in businessTypes"
          :key="index"
          :class="`w-full flex flex-col px-3 py-3  ${
            item.key == selectedType
              ? 'border-primary !border-[1.5px]'
              : 'border-[#F0F3F6] !border-[1.5px]'
          }  rounded-[12px] mb-4`"
          @click="!item.soon ? (selectedType = item.key) : null"
        >
          <div class="w-full flex flex-row items-start justify-between pb-2">
            <app-icon
              :name="`tools/${item.icon}`"
              custom-class="!h-[48px] -ml-[3px]"
            />

            <app-icon
              v-if="!item.soon"
              :name="`${
                item.key == selectedType ? 'selected' : 'not-selected'
              }`"
              class="h-[22px]"
            />
            <span
              v-else
              class="px-3 !text-[11px] py-1 bg-primary rounded-[5px] !text-white"
              >Coming Soon</span
            >
          </div>

          <app-normal-text class="!font-semibold !text-left !text-sm pb-2">
            {{ item.title }}
          </app-normal-text>

          <app-normal-text
            class="!text-[#616161] !text-left !leading-5 w-[90%]"
          >
            {{ item.description }}
          </app-normal-text>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive } from "vue";
import { AppInfoBox, AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { User } from "@greep/logic/src/gql/graphql";
import { ref } from "vue";

export default defineComponent({
  components: {
    AppInfoBox,
    AppNormalText,
    AppIcon,
  },
  props: {
    authUser: {
      type: Object as () => User,
    },
  },
  name: "AuthSetupBusinessType",
  setup() {
    const FormValidations = Logic.Form;

    const selectedType = ref("basic");

    const businessTypes = reactive([
      {
        title: "Greep Payment",
        key: "basic",
        description:
          "Accept payment from your customer in their local currency",
        icon: "basic",
        soon: false,
      },
       {
        title: "Event Host",
        key: "event_host",
        description:
          "Create and promote events, sell tickets, scan entries, and track your earnings.",
        icon: "events",
        soon: false,
      },
      {
        title: "Exchanger",
        key: "exchanger",
        description:
          "Sell currency like USDC, in exchange for local cash or bank transfer.",
        icon: "exchanger",
        soon: true,
      },
      {
        title: "Vendor",
        key: "vendor",
        description:
          "Sell your products on the Greep online market, and reach buyers across country.",
        icon: "vendor",
        soon: true,
      },
      {
        title: "Delivery Rider",
        key: "delivery",
        description:
          "Get tasks to deliver items, and earn on your schedule — with a bike provided for you.",
        icon: "delivery",
        soon: true,
      },
    ]);

    const continueWithForm = () => {
      return selectedType.value;
    };

    return {
      FormValidations,
      Logic,
      continueWithForm,
      businessTypes,
      selectedType,
    };
  },
});
</script>
