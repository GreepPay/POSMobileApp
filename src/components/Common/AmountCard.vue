<template>
  <app-image-loader
    class="w-full h-fit rounded-[35px] flex flex-col relative justify-center items-center px-4 py-5 xs:!py-4 bg-[linear-gradient(359.13deg,#10BB76_25.37%,#008651_99.25%)]"
    :photoUrl="''"
  >
    <!-- Image bg -->
    <img
      src="/images/greep-transparent-logo.svg"
      class="h-full absolute w-full top-0 left-0 rounded-[35px] z-[1]"
    />

    <template v-if="!isWrapper">
      <div
        class="w-full flex flex-col !space-y-1 justify-center items-center z-[2] py-4"
      >
        <app-normal-text class="text-center !text-white">
          {{ label }}
        </app-normal-text>

        <app-header-text
          class="text-center !text-white !text-3xl !font-normal pt-1"
        >
          ₺
          {{
            !Number.isNaN(parseFloat(amount?.toString() || ""))
              ? Logic.Common.convertToMoney(amount, false, "", false)
              : "0"
          }}
        </app-header-text>
      </div>
    </template>
    <template v-else>
      <slot />
    </template>
  </app-image-loader>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppImageLoader,
  AppNormalText,
  AppHeaderText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  components: {
    AppImageLoader,
    AppNormalText,
    AppHeaderText,
  },
  props: {
    amount: {
      type: Number,
      required: false,
    },
    label: {
      type: String,
      required: false,
      default: "Amount",
    },
    isWrapper: {
      type: Boolean,
      default: false,
    },
  },
  name: "AuthSetupVerifyEmail",
  setup() {
    return {
      Logic,
    };
  },
});
</script>
