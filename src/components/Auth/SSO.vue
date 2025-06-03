<template>
  <div class="w-full flex flex-col items-start justify-start space-y-2">
    <div
      class="w-full flex flex-row items-center justify-center space-x-2 border-[1.5px] border-[#E0E2E4] rounded-[999px] py-4"
    >
      <app-icon name="google" extension="png" custom-class="!h-[23px]" />
      <app-normal-text class="!font-[500] pt-[1px]">
        Continue with Google
      </app-normal-text>
    </div>

    <div
      class="w-full flex flex-row items-center justify-center space-x-2 border-[1.5px] border-[#E0E2E4] rounded-[999px] py-4"
    >
      <app-icon name="apple" extension="png" custom-class="!h-[23px]" />
      <app-normal-text class="!font-[500] pt-[2px]">
        Continue with Apple
      </app-normal-text>
    </div>

    <div class="flex flex-row items-center justify-between w-full pt-2">
      <div class="!border-[1.5px] border-[#F0F3F6] w-full"></div>
      <app-normal-text class="!text-[#999999] px-3"> or </app-normal-text>
      <div class="!border-[1.5px] border-[#F0F3F6] w-full"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AppNormalText, AppIcon } from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { getPlatforms } from "@ionic/vue";
import {
  SignInWithApple,
  SignInWithAppleResponse,
  SignInWithAppleOptions,
} from "@capacitor-community/apple-sign-in";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { computed } from "vue";
import { reactive } from "vue";

export default defineComponent({
  components: {
    AppNormalText,
    AppIcon,
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
  name: "AuthSSO",
  setup(props) {
    const formData = reactive({
      email: "",
      first_name: "",
      last_name: "",
    });

    const options: SignInWithAppleOptions = {
      clientId: "io.greep.pos.vendor",
      redirectURI: "https://greep.io",
      scopes: "email name",
      state: Logic.Common.makeid(10),
      nonce: "nonce",
    };

    const authenticateUser = (userId: string) => {
      if (props.fromAction == "signUp") {
        Logic.Auth.SignUpForm = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_sso: true,
          sso_id: userId,
        };

        Logic.Auth.SignUp(true, () => {
          //
        })?.then((data) => {
          if (data?.SignUp) {
            localStorage.setItem(`social_${userId}`, formData.email);
            if (!data?.SignUp.has_password) {
              Logic.Common.GoToRoute("/auth/signup/set-password", true);
            } else {
              if (!Logic.Auth.AuthUser?.phone) {
                Logic.Common.GoToRoute("/auth/signup/phone-number", true);
                return;
              }
              if (!Logic.Auth.AuthUser?.phone_verified_at) {
                Logic.Common.GoToRoute("/auth/signup/verify-phone", true);
              } else {
                Logic.Common.GoToRoute("/", true);
              }
            }
          }
        });
      } else {
        Logic.Auth.SignInForm = {
          email:
            formData.email || localStorage.getItem(`social_${userId}`) || "",
          sso_id: userId,
        };

        Logic.Auth.SignIn(true)?.then(async (data) => {
          if (data?.SignIn) {
            Logic.Auth.GetAuthUser();
            Logic.Common.hideLoader();
            if (!data?.SignIn.user.has_password) {
              Logic.Common.GoToRoute("/auth/signup/set-password", true);
              return;
            }

            // authMoveForward(data?.SignIn.user);
          }
        });
      }
    };

    const canUseApp = computed(() => {
      return getPlatforms()[0] != "android";
    });

    const authenticateGoogle = async () => {
      try {
        const result = await FirebaseAuthentication.signInWithGoogle();

        const fullName = result.user?.displayName?.split(" ") || [];

        formData.email = result.user?.email || "";
        formData.first_name = fullName?.[0] || "";
        formData.last_name = fullName?.length > 1 ? fullName[1] : "";

        authenticateUser(result.user?.uid || "");
      } catch (error) {
        console.log(error);
      }
    };

    const authenticateApple = () => {
      SignInWithApple.authorize(options)
        .then((result: SignInWithAppleResponse) => {
          // Handle user information
          // Validate token with server and create new session

          const response = result.response;

          formData.email = response.email || "";
          formData.first_name = response.givenName || "";
          formData.last_name = response.familyName || "";

          authenticateUser(response.user || "");
        })
        .catch((error: any) => {
          // Handle error
          console.log(error);
        });
    };

    return {
      canUseApp,
      getPlatforms,
      authenticateGoogle,
      authenticateApple,
    };
  },
});
</script>
