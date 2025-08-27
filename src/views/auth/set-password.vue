<template>
  <app-wrapper>
    <subpage-layout title="Set a Passcode">
      <div
        class="w-full flex flex-col items-center justify-start h-full space-y-6 px-4"
      >
        <div class="w-full flex flex-col pt-2 justify-center items-center">
          <app-info-box>
            <app-normal-text custom-class="!leading-5">
              Prevent
              <span class="font-semibold"> unauthorized access </span> to your
              POS app! Set a access passcode
            </app-normal-text>
          </app-info-box>
          <div
            :class="`w-full flex flex-col space-y-2 items-center pt-4 ${
              pinStage == 'confirm' ? 'opacity-40' : ''
            }`"
          >
            <app-normal-text custom-class="!text-center">
              Enter Passcode
            </app-normal-text>

            <!-- OTP input -->
            <app-otp-input
              :otp-value="pinValue"
              type="password"
              :number-of-input="6"
              :should-reset-o-t-p="true"
              :sizeStyle="'!w-[40px] !h-[45px] xs:!w-[30px] xs:!h-[35px] !rounded-[5px]'"
              @change-o-t-p="() => {}"
              @update:filled="otpIsFilled"
              :isDisabled="true"
            />
          </div>

          <div
            :class="`w-full flex flex-col space-y-2 items-center pt-6 ${
              pinStage == 'pin' ? 'opacity-40' : ''
            }`"
          >
            <app-normal-text custom-class="!text-center">
              Confirm Passcode
            </app-normal-text>

            <!-- OTP input -->
            <app-otp-input
              :otp-value="confirmPinValue"
              type="password"
              :number-of-input="6"
              :sizeStyle="'!w-[40px] !h-[45px] xs:!w-[30px] xs:!h-[35px] !rounded-[5px]'"
              :should-reset-o-t-p="true"
              @change-o-t-p="() => {}"
              @update:filled="otpIsFilledConfirm"
              :isDisabled="true"
            />
          </div>
        </div>

        <div class="w-full flex flex-col">
          <app-keyboard
            :hasFingerPrint="false"
            @update:model-value="handleKeyBoardPressed"
            v-model="keyboardValue"
          />
        </div>
      </div>
    </subpage-layout>
  </app-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import {
  AppNormalText,
  AppInfoBox,
  AppOtpInput,
  AppKeyboard,
} from "@greep/ui-components";
import { Logic } from "@greep/logic";
import { ref } from "vue";

export default defineComponent({
  name: "SetPasscodePage",
  components: {
    AppNormalText,
    AppInfoBox,
    AppOtpInput,
    AppKeyboard,
  },
  setup() {
    const FormValidations = Logic.Form;

    const itIsPinUpdate = ref(false);

    const pinValue = ref("");
    const confirmPinValue = ref("");

    const keyboardValue = ref("");

    const pinStage = ref("pin");

    const handleKeyBoardPressed = (value: any) => {
      if (pinStage.value == "pin") {
        pinValue.value = value;
      } else {
        confirmPinValue.value = value;
      }
    };

    const otpIsFilled = () => {
      if (pinStage.value == "pin") {
        keyboardValue.value = "";
        pinStage.value = "confirm";
      }
    };

    const otpIsFilledConfirm = async () => {
      if (confirmPinValue.value) {
        if (confirmPinValue.value == pinValue.value) {
          const authLoginData = {
            email: localStorage.getItem("auth_email"),
            password: localStorage.getItem("auth_pass"),
          };

          if (localStorage.getItem("auth_email")) {
            // Encrypt data
            const encryptedData = Logic.Common.encryptData(
              authLoginData,
              pinValue.value
            );

            Logic.User.UpdateProfileForm = {
              auth_passcode: pinValue.value,
            };

            Logic.Common.showLoader({
              show: true,
              loading: true,
            });

            await Logic.User.UpdateProfile();

            Logic.Common.hideLoader();

            // Save encrypted data to local storage
            localStorage.setItem("auth_encrypted_data", encryptedData);
            localStorage.setItem("auth_passcode", pinValue.value);

            // Clear auth data from local storage
            localStorage.removeItem("auth_email");
            localStorage.removeItem("auth_pass");

            Logic.Common.GoToRoute("/");
          }
        } else {
          Logic.Common.showAlert({
            show: true,
            message: "Transaction pin do not match. Try again",
            type: "error",
          });
          keyboardValue.value = "";
          pinStage.value = "pin";
          pinValue.value = "";
          confirmPinValue.value = "";
        }
      }
    };

    const handleNext = () => {
      Logic.Common.GoToRoute("/auth/welcome");
    };

    return {
      FormValidations,
      Logic,
      handleNext,
      otpIsFilledConfirm,
      handleKeyBoardPressed,
      otpIsFilled,
      itIsPinUpdate,
      pinStage,
      keyboardValue,
      pinValue,
      confirmPinValue,
    };
  },
});
</script>