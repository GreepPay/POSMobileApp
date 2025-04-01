<template>
  <div class="w-full flex flex-col items-center justify-start h-full space-y-6">
    <!-- Form -->
    <app-form-wrapper
      ref="formComponent"
      :parent-refs="parentRefs"
      class="w-full flex flex-col space-y-[20px] h-full"
    >
      <!-- Info box -->
      <app-info-box>
        <app-normal-text custom-class="!leading-5">
          <span class="font-semibold">Set your account password.</span>
          Secure your account with a strong password.
        </app-normal-text>
      </app-info-box>

      <app-text-field
        :has-title="false"
        type="password"
        placeholder="Password"
        ref="password"
        name="Password"
        use-floating-label
        v-model="formData.password"
        :rules="[FormValidations.RequiredRule, FormValidations.PasswordRule]"
      >
      </app-text-field>

      <app-text-field
        :has-title="false"
        type="password"
        placeholder="Confirm Password"
        ref="confirmPassword"
        name="Confirm Password"
        use-floating-label
        v-model="formData.confirmPassword"
        :rules="[
          FormValidations.RequiredRule,
          FormValidations.handleConfirmPassword(
            formData.password,
            formData.confirmPassword
          ),
        ]"
      >
      </app-text-field>
    </app-form-wrapper>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppFormWrapper,
  AppTextField,
  AppInfoBox,
  AppNormalText,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  components: {
    AppFormWrapper,
    AppTextField,
    AppInfoBox,
    AppNormalText,
  },
  props: {},
  name: "AuthSetupAccountInfo",
  setup() {
    const FormValidations = Logic.Form;

    const formData = reactive({
      password: "",
      confirmPassword: "",
    });

    const formComponent = ref<any>(null);

    const continueWithForm = () => {
      const state = formComponent.value?.validate();
      if (state) {
        // Proceed with form submission
        return formData;
      } else {
        return;
      }
    };

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      continueWithForm,
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
