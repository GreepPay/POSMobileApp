<template>
  <div>
    <div
      class="bg-white px-4 pb-2 w-full flex flex-col !border-b-[10px] !border-[#F0F3F6]"
    >
      <div class="mt-1">
        <app-header-text customClass="!text-base mb-1">
          {{ businessDetails?.business_name }}
        </app-header-text>

        <div
          v-if="businessDetails?.business_type === 'vendor'"
          class="flex flex-row mb-1 justify-between w-full"
        >
          <div class="flex items-center flex-row mb-1">
            <app-normal-text
              customClass="!text-xs !font-medium !text-black capitalize pr-[2px]"
            >
              {{ businessDetails?.business_type }}
            </app-normal-text>
          </div>
        </div>

        <div v-else class="flex items-center gap-2 mb-2">
          <app-normal-text
            customClass="!text-xs !font-medium !text-black capitalize"
          >
            Event Host
          </app-normal-text>
        </div>

        <app-normal-text class="!text-left mb-1 !leading-5 !text-[#616161]">
          {{
            Logic.Common.TruncateText(
              businessDetails?.description || "",
              false,
              80
            ).truncated
          }}

          <template
            v-if="
              Logic.Common.TruncateText(
                businessDetails?.description || '',
                false,
                80
              ).readMore
            "
          >
            <span
              class="font-medium !text-black cursor-pointer"
              @click="showBusinessDetailsModal = true"
            >
              see more
            </span>
          </template>
        </app-normal-text>

        <div class="flex items-center gap-2 mb-2 pt-2">
          <app-normal-text customClass="!text-xs !font-medium !text-gray-500">
            {{ businessDetails.customers || "No" }}
            {{ businessDetails.customers > 1 ? "Customers" : "Customer " }}
          </app-normal-text>
        </div>
      </div>
    </div>

    <app-modal
      v-if="showBusinessDetailsModal"
      :close="() => (showBusinessDetailsModal = false)"
      title="Business Details"
      :hasTitle="true"
      contentClass="!p-0"
    >
      <div class="w-full flex items-center gap-1 px-4 py-3 border-b-divider">
        <app-avatar :src="businessDetails?.logo" class="!size-7 rounded-full" />
        <app-normal-text class="!block !text-black ml-1">
          <span class="font-semibold">
            {{ businessDetails?.business_name }}
          </span>
        </app-normal-text>
      </div>

      <!-- Description -->
      <div class="w-full flex flex-col p-4">
        <app-normal-text class="!text-sm !font-semibold !text-left">
          Description
        </app-normal-text>

        <div class="!max-h-[240px] overflow-y-auto no-scrollbar">
          <app-normal-text class="!text-left mb-1 !leading-5 !text-[#616161]">
            {{ businessDetails.description }}
          </app-normal-text>
        </div>
      </div>
    </app-modal>
  </div>
</template>

<script lang="ts">
import { ref, computed, reactive, onMounted, watch } from "vue";
import { defineComponent } from "vue";
import {
  AppIcon,
  AppNormalText,
  AppHeaderText,
  AppModal,
  AppAvatar,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { Business } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "BusinessBasicInfo",
  components: {
    AppIcon,
    AppNormalText,
    AppHeaderText,
    AppModal,
    AppAvatar,
  },
  props: {
    businessDetails: {
      type: Object as () => Business,
      required: true,
    },
  },
  setup(props) {
    const showBusinessDetailsModal = ref(false);
    const seeMoreDescription = ref(false);

    const truncatedDescription = computed(() =>
      Logic.Common.TruncateText(
        props.businessDetails?.description || "",
        seeMoreDescription.value,
        80
      )
    );

    return {
      Logic,
      seeMoreDescription,
      truncatedDescription,
      showBusinessDetailsModal,
    };
  },
});
</script>
