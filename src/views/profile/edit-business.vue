<template>
  <app-wrapper>
    <subpage-layout title="Edit Personal Info">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-4">
        <auth-setup-business-info ref="businessInfoRef" :authUser="AuthUser" />
      </div>

      <!-- Bottom button -->
      <div
        class="w-full fixed bg-white dark:bg-black bottom-0 left-0 pt-4 px-4"
        style="
          padding-bottom: calc(env(safe-area-inset-bottom) + 16px) !important;
        "
      >
        <div class="w-full flex flex-col">
          <app-button
            variant="secondary"
            :class="`!py-4`"
            @click="continueToNext"
            :loading="loadingState"
            >Save & Continue</app-button
          >
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppButton } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";
import AuthSetupBusinessInfo from "../../components/AuthSetup/business-info.vue";

export default defineComponent({
  name: "EditBusinessProfilePage",
  components: {
    AppButton,
    AuthSetupBusinessInfo,
  },
  setup() {
    const businessInfoRef = ref();

    const loadingState = ref(false);

    const AuthUser = ref(Logic.Auth.AuthUser);

    const continueToNext = async () => {
      const formData = businessInfoRef.value?.continueWithForm();

      if (formData) {
        loadingState.value = true;

        Logic.User.UpdateProfileForm = {
          business_category: formData.businessCategory,
          business_description: formData.businessDescription,
          business_name: formData.businessName,
          country: formData.country,
          state: formData.state,
          business_logo: formData.photo,
        };

        try {
          await Logic.User.UpdateProfile();
          await Logic.Auth.GetAuthUser();
          Logic.Common.showAlert({
            show: true,
            message: "Business profile updated successfully",
            type: "success",
          });
          loadingState.value = false;
          Logic.Common.goBack();
        } catch (error) {
          loadingState.value = false;
        }
      }
    };

    return {
      Logic,
      continueToNext,
      loadingState,
      businessInfoRef,
      AuthUser,
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
