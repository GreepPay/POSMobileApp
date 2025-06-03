<template>
  <app-wrapper>
    <subpage-layout title="Edit Personal Info">
      <div class="w-full flex flex-col justify-start px-4 h-full pt-4">
        <auth-setup-account-info
          ref="accountInfoRef"
          hideEmail
          :authUser="AuthUser"
        />
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
import AuthSetupAccountInfo from "../../components/AuthSetup/account-info.vue";

export default defineComponent({
  name: "EditPersonalProfilePage",
  components: {
    AppButton,
    AuthSetupAccountInfo,
  },
  setup() {
    const accountInfoRef = ref();

    const loadingState = ref(false);

    const AuthUser = ref(Logic.Auth.AuthUser);

    const continueToNext = async () => {
      const formData = accountInfoRef.value?.continueWithForm();

      if (formData) {
        loadingState.value = true;
        Logic.User.UpdateProfileForm = {
          first_name: formData.firstName,
          last_name: formData.lastName,
          phone_number: formData.phoneNumber,
        };

        try {
          await Logic.User.UpdateProfile();
          await Logic.Auth.GetAuthUser();
          Logic.Common.showAlert({
            show: true,
            message: "Profile updated successfully",
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
      accountInfoRef,
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
