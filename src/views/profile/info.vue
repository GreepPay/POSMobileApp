<template>
  <app-wrapper>
    <subpage-layout title="Personal Info" hasExtraTopContent>
      <template #extra-top-content>
        <span @click="Logic.Common.GoToRoute('/profile/edit-profile')"
          ><app-icon name="edit" custom-class="!h-[22px]"
        /></span>
      </template>
      <div class="w-full flex flex-col space-y-5 justify-start px-4 h-full">
        <div class="w-full flex flex-col pt-3">
          <app-details :details="profileDetails" />
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";
import { AppDetails, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { onMounted } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { watch } from "vue";

export default defineComponent({
  name: "ProfileSettingsPage",
  components: {
    AppDetails,
    AppIcon,
  },
  setup() {
    const AuthUser = ref(Logic.Auth.AuthUser);

    const profileDetails = reactive<{ title: string; content: string }[]>([]);

    const FormValidations = Logic.Form;

    const setPageDefault = () => {
      profileDetails.length = 0;
      profileDetails.push({
        title: "First & Last Name",
        content: `${AuthUser.value?.first_name} ${AuthUser.value?.last_name}`,
      });
      profileDetails.push({
        title: "Phone Number",
        content: AuthUser.value?.phone?.replace("-", " ") || "Nil",
      });
      profileDetails.push({
        title: "Email Address",
        content: AuthUser.value?.email || "Nil",
      });
    };

    const continueToNext = () => {
      //   modalIsOpen.value = true;
    };

    watch(AuthUser, () => {
      setPageDefault();
    });

    onIonViewWillEnter(() => {
      setPageDefault();
    });

    onMounted(() => {
      Logic.Auth.watchProperty("AuthUser", AuthUser);
      setPageDefault();
    });

    return {
      Logic,
      continueToNext,
      FormValidations,
      profileDetails,
      AuthUser,
    };
  },
});
</script>
