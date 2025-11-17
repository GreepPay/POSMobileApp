<template>
  <app-wrapper>
    <subpage-layout title="Business Info" hasExtraTopContent>
      <template #extra-top-content>
        <span @click="Logic.Common.GoToRoute('/profile/edit-business')"
          ><app-icon name="edit" custom-class="!h-[22px]"
        /></span>
      </template>
      <div class="w-full flex flex-col justify-start px-4 h-full pt-4">
        <div class="w-full flex flex-row">
          <div
            :style="`background-image: url(${photoUrl});  background-size: cover;
      background-repeat: no-repeat;
      background-position: center;`"
            class="h-[90px] w-[90px] rounded-full flex flex-row items-center relative !border-[1.5px] border-gray-200"
          ></div>
        </div>
        <div class="w-full flex flex-col pt-5">
          <app-details :details="profileDetails" invertBoldness />
        </div>
        <div class="h-[100px] py-8"></div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import { AppDetails, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { reactive } from "vue";
import { watch } from "vue";
import { onIonViewWillEnter } from "@ionic/vue";
import { User } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "ProfileBusinessInfoPage",
  components: {
    AppDetails,
    AppIcon,
  },
  setup() {
    const AuthUser = ref<User>(Logic.Auth.AuthUser);

    const profileDetails = reactive<{ title: string; content: string }[]>([]);

    const photoUrl = ref("");

    const FormValidations = Logic.Form;

    const setPageDefault = () => {
      const business = Logic.Auth.GetDefaultBusiness();
      photoUrl.value = business?.logo || "/images/avatar.svg";
      profileDetails.length = 0;
      profileDetails.push({
        title: "Business Name",
        content: business?.business_name || "Nil",
      });
      profileDetails.push({
        title: "Business Category",
        content: business?.category || "Nil",
      });
      profileDetails.push({
        title: "Business Description",
        content: business?.description || "Nil",
      });
      profileDetails.push({
        title: "Business Location",
        content: `${business?.city || "Nil"}, ${business?.country || "Nil"}`,
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
      photoUrl,
    };
  },
});
</script>
