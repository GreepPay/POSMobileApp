<template>
  <div class="flex flex-col gap-4 w-full">
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

    <!-- <app-button
      class="!w-full !py-3.5 font-semibold"
      variant="secondary"
      :outlined="true"
    >
      <div class="flex items-center justify-center space-x-2">
        <app-icon name="apple" />
        <app-normal-text class="!font-[500] pt-[2px]">
          Continue with Apple
        </app-normal-text>
      </div>
    </app-button> -->

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
  SignInWithApple,
  SignInWithAppleResponse,
  SignInWithAppleOptions,
} from "@capacitor-community/apple-sign-in";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithPopup,
} from "firebase/auth";
import { initializeApp } from "firebase/app";
import { handleAuthResponse } from "../../composable/auth";


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

    const options: SignInWithAppleOptions = {
      clientId: "io.greep.everything.vendor",
      redirectURI: "https://greep.io",
      scopes: "email name",
      state: Logic.Common.makeid(10),
      nonce: "nonce",
    };

    const authenticateUser = (userId: string) => {
      if (props.fromAction == "signUp") {
        // @ts-expect-error Extending Logic.Auth.SignUpPayload
        Logic.Auth.SignUpPayload = {
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          sso_id: userId,
        };

        localStorage.setItem(`social_${userId}`, formData.email);
        Logic.Common.GoToRoute("/auth/set-password");
      } else {
        Logic.Auth.SignInForm = {
          email:
            formData.email || localStorage.getItem(`social_${userId}`) || "",
          sso_id: userId,
        };
        Logic.Auth.SignIn(true)?.then(async (data) => {
          if (data) {
           
           await Logic.Auth.GetAuthUser();
           handleAuthResponse(Logic.Auth.SignInForm || {
              email: formData.email,
              sso_id: userId,
            });
          
          }
        });
      }
    };

    const canUseApp = computed(() => {
      return getPlatforms()[0] != "android";
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
