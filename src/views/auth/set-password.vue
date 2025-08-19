<template>
  <app-wrapper>
    <subpage-layout title="Set a Password">
      <app-form-wrapper
        ref="formComponent"
        :parent-refs="parentRefs"
        class="w-full flex flex-col pt-2"
      >
        <app-normal-text  
          custom-class="!text-center !text-gray-600 !text-sm !mb-6"
        >
          Protect your account with a strong password.
        </app-normal-text>
        
        <div class="w-full flex flex-col space-y-4 pt-4 px-4">
          <app-text-field
            v-model="formData.password"
            :has-title="true"
            type="password"
            placeholder="Enter password"
            ref="passwordRef"
            name="Password"
            use-floating-label
            :rules="[FormValidations.RequiredRule]"
            custom-class="!border-gray-300 focus:!border-primary"
          />
          <app-text-field
            v-model="formData.confirm_password"
            :has-title="true"
            type="password"
            placeholder="Confirm password"
            ref="confirm_password"
            name="Confirm Password"
            use-floating-label
            :rules="[
              FormValidations.RequiredRule,
              FormValidations.handleConfirmPassword(
                formData.password,
                formData.confirm_password
              ),
            ]"
            custom-class="!border-gray-300 focus:!border-primary"
          />
        </div>
        
        <!-- Button -->
          <div class="w-full pt-5 px-4">
          <app-button
            variant="secondary"
            class="w-full py-4 "
            @click.prevent="handlePassword"
          >
            Continue
          </app-button>
        </div>
      </app-form-wrapper>
    </subpage-layout>
  </app-wrapper>
</template>


<script lang="ts">
import { defineComponent, reactive, ref } from "vue";
import {
  AppNormalText,
  AppFormWrapper,
  AppTextField,
  AppButton,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";

export default defineComponent({
  name: "NewPassWordpage",
  components: {
    AppNormalText,
    AppFormWrapper,
    AppTextField,
    AppButton,
  },
  setup() {
    const FormValidations = Logic.Form;
    const formComponent = ref<any>(null);
    const formData = reactive({
      password: "",
      confirm_password: "",
    });

    const handlePassword = async () => {
      const isValid = formComponent.value?.validate();

      if (isValid) {
         Logic.Auth.SignUpForm = {
            ...Logic.Auth.SignUpForm || {},
            password: formData.password,
         }

         Logic.Common.GoToRoute("/auth/pick-currency");
      }
    };

    return {
      FormValidations,
      Logic,
      formData,
      formComponent,
      handlePassword,
    };
  },
  data() {
    return {
      parentRefs: null,
    };
  },
  mounted() {
    const parentRefs: any = this.$refs;
    this.parentRefs = parentRefs;
  },
});
</script>