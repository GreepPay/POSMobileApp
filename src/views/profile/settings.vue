<template>
  <app-wrapper>
    <subpage-layout title="Login Settings">
      <div
        class="w-full flex flex-col !space-y-3 justify-start px-4 h-full pt-2"
      >
        <app-info-box>
          <app-normal-text custom-class="!leading-5">
            Create a new <span class="font-semibold">6-digit </span>passcode to
            ensure that only you can open this app.
          </app-normal-text>
        </app-info-box>

        <div class="w-full flex flex-col !space-y-4 justify-start h-full pt-4">
          <app-text-field
            :has-title="false"
            type="password"
            placeholder="Old Passcode"
            ref="oldPasscode"
            name="Old Passcode"
            use-floating-label
            v-model="formData.old_passcode"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>

          <app-text-field
            :has-title="false"
            type="password"
            placeholder="New Passcode"
            ref="newPasscode"
            name="New Passcode"
            use-floating-label
            v-model="formData.new_passcode"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>

          <app-text-field
            :has-title="false"
            type="password"
            placeholder="Confirm Passcode"
            ref="confirmPasscode"
            name="Confirm Passcode"
            use-floating-label
            v-model="formData.confirm_passcode"
            :rules="[FormValidations.RequiredRule]"
          >
          </app-text-field>

          <app-normal-text class="w-full !text-left !text-primary !font-[500]">
            Forgot Passcode?
          </app-normal-text>
        </div>
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button variant="secondary" :class="`!py-4`">Confirm</app-button>
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppButton,
  AppNormalText,
  AppTextField,
  AppInfoBox,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { availableCurrencies } from "../../composable";

export default defineComponent({
  name: "ProfileMainSettingsPage",
  components: {
    AppButton,
    AppNormalText,
    AppInfoBox,
    AppTextField,
  },
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive<{
      old_passcode: string;
      new_passcode: string;
      confirm_passcode: string;
    }>({
      old_passcode: "",
      new_passcode: "",
      confirm_passcode: "",
    });

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    return {
      Logic,
      continueToNext,
      FormValidations,
      formData,
      availableCurrencies,
    };
  },
});
</script>
