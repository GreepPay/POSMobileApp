<template>
  <div class="flex flex-col gap-4 w-full">
    <app-button
      v-if="canUseApp"
      class="!w-full !py-3.5 font-semibold"
      variant="secondary"
      :outlined="true"
      @click="authenticateApple"
    >
      <div class="flex items-center justify-center space-x-2">
        <app-icon name="apple" />
        <app-normal-text class="!font-[500] pt-[2px]">
          Continue with Apple
        </app-normal-text>
      </div>
    </app-button>

    <app-button
      class="!w-full !py-3.5 font-semibold"
      variant="secondary"
      :outlined="true"
      @click="authenticateGoogle"
    >
      <div class="flex items-center justify-center space-x-2">
        <app-icon name="google" />
        <app-normal-text class="!font-[500] pt-[2px]">
          Continue with Google
        </app-normal-text>
      </div>
    </app-button>

    <div class="flex flex-row items-center justify-between w-full pt-2">
      <div class="!border-[1.5px] border-[#F0F3F6] w-full"></div>
      <app-normal-text class="!text-[#999999] px-3"> or </app-normal-text>
      <div class="!border-[1.5px] border-[#F0F3F6] w-full"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, reactive, onMounted } from "vue";
import { AppButton, AppIcon, AppNormalText } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { getPlatforms, isPlatform } from "@ionic/vue";
import {
  FirebaseAuthentication,
  FirebaseAuthenticationPlugin,
} from "@capacitor-firebase/authentication";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { handleAuthResponse } from "../../composable/auth";
import { MutationSignInArgs } from "@greep/logic/src/gql/graphql";

export default defineComponent({
  name: "AuthSSO",
  components: {
    AppButton,
    AppIcon,
    AppNormalText,
  },
  props: {
    fromAction: {
      type: String,
      default: "signUp",
    },
    isRelative: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const formData = reactive({
      email: "",
      first_name: "",
      last_name: "",
    });

    const authenticateUser = async (userId: string) => {
      if (props.fromAction == "signUp") {
        const password = Logic.Common.makeid(12);
        // @ts-expect-error Extending Logic.Auth.SignUpPayload
        Logic.Auth.SignUpPayload = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          sso_id: userId,
          password,
        };

        localStorage.setItem("auth_pass", password);

        localStorage.setItem(`social_${userId}`, formData.email);

        Logic.Common.showLoader({
          show: true,
          loading: true,
        });

        await Logic.Auth.SignUp(true, () => {});

        const formSignIn: MutationSignInArgs = {
          email:
            localStorage.getItem("auth_email") || Logic.Auth.SignUpForm?.email,
          password,
        };

        Logic.Auth.SignInForm = formSignIn;
        await Logic.Auth.SignIn(true);

        Logic.Common.hideLoader();

        Logic.Common.GoToRoute("/auth/setup-account");
      } else {
        Logic.Auth.SignInForm = {
          email:
            formData.email || localStorage.getItem(`social_${userId}`) || "",
          sso_id: userId,
        };
        Logic.Auth.SignIn(true)?.then(async (data) => {
          if (data) {
            await Logic.Auth.GetAuthUser();
            handleAuthResponse(
              Logic.Auth.SignInForm || {
                email: formData.email,
                sso_id: userId,
              }
            );
          }
        });
      }
    };

    const canUseApp = computed(() => {
      return (
        getPlatforms()[0] != "android" && isPlatform("mobileweb") === false
      );
    });

    const authenticateGoogle = async () => {
      try {
        const isMobileWeb = isPlatform("mobileweb");

        if (!isMobileWeb) {
          const result = await FirebaseAuthentication.signInWithGoogle();

          const fullName = result.user?.displayName?.split(" ") || [];

          formData.email = result.user?.email || "";
          formData.first_name = fullName?.[0] || "";
          formData.last_name = fullName?.length > 1 ? fullName[1] : "";

          authenticateUser(result.user?.uid || "");
        } else {
          const provider = new GoogleAuthProvider();
          provider.addScope("profile");
          provider.addScope("email");
          const auth = getAuth();
          signInWithPopup(auth, provider)
            .then((result) => {
              if (result) {
                const fullName = result.user?.displayName?.split(" ") || [];

                formData.email = result.user?.email || "";
                formData.first_name = fullName?.[0] || "";
                formData.last_name = fullName?.length > 1 ? fullName[1] : "";

                authenticateUser(result.user?.uid || "");
              }
            })
            .catch((error) => {
              const errorMessage = error.message;
              Logic.Common.showAlert({
                show: true,
                message: errorMessage,
                type: "error",
              });
            });
        }
      } catch (error) {
        console.log(error);
      }
    };

    const authenticateApple = async () => {
      try {
        const result = await FirebaseAuthentication?.signInWithApple();

        const fullName = result?.user?.displayName?.split(" ") || [];
        formData.email = result?.user?.email || "";
        formData.first_name = fullName[0] || "";
        formData.last_name = fullName.length > 1 ? fullName[1] : "";

        localStorage.setItem("acc_email", formData.email);

        authenticateUser(result?.user?.uid || "");
      } catch (error) {
        console.log(error);
        // Logic.Common.showAlert({
        //   show: true,
        //   message: JSON.stringify(error),
        //   type: "error",
        // });
      }
    };

    onMounted(() => {
      const isMobileWeb = isPlatform("mobileweb");
      if (isMobileWeb) {
        const firebaseConfig = {
          apiKey: "AIzaSyDikEK_sPaMCfOQ2fkj0LXeOL_z41F062Q",
          authDomain: "greep-merchant.firebaseapp.com",
        };
        initializeApp(firebaseConfig);
      }
    });

    return {
      canUseApp,
      getPlatforms,
      authenticateGoogle,
      authenticateApple,
    };
  },
});
</script>
