<template>
  <app-wrapper>
    <subpage-layout title="Sign In">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4"
      >
        <!-- Form -->
        <app-form-wrapper
          ref="formComponent"
          :parent-refs="parentRefs"
          class="w-full flex flex-col space-y-3 pt-2"
        >
          <app-text-field
            :has-title="false"
            type="email"
            placeholder="Enter email address"
            ref="email"
            name="Email address"
            use-floating-label
            v-model="formData.email"
            :rules="[FormValidations.RequiredRule, FormValidations.EmailRule]"
          >
          </app-text-field>
        </app-form-wrapper>
      </div>

      <!-- Bottom section -->
      <div
        class="w-full flex flex-col px-4 fixed z-50 bottom-0 left-0 pt-4 bg-white"
        style="padding-bottom: calc(env(safe-area-inset-bottom) + 16px)"
      >
        <app-button
          variant="secondary"
          class="!py-4 col-span-4"
          @click="handleNext"
        >
          Next
        </app-button>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppFormWrapper, AppTextField, AppButton } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";

export default defineComponent({
  name: "LoginPage",
  components: {
    AppFormWrapper,
    AppTextField,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive({
      email: "",
    });

    const handleNext = () => {
      Logic.Common.GoToRoute("/auth/verify-email");
    };

    return {
      FormValidations,
      Logic,
      formData,
      handleNext,
    };
  },
  data() {
    return {
      parentRefs: [],
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>
