import { Logic } from "@greep/logic"
// import { availableCurrencies } from ".";

export const handleAuthResponse = (formData: any) => {
  // const defaultCountryCode = availableCurrencies.filter(
  //     (item) =>
  //         item.code == Logic.Auth.AuthUser?.profile?.default_currency
  // )[0];

  // localStorage.setItem(
  //     "default_country_code",
  //     defaultCountryCode?.country_code || ""
  // );

  const authUser = Logic.Auth.AuthUser

  if (authUser?.transaction_pin) {
    const authLoginData = {
      email: formData.email,
      password: formData.password || "",
      sso_id: formData.sso_id || "",
    }

    // Encrypt data
    const encryptedData = Logic.Common.encryptData(
      authLoginData,
      authUser.transaction_pin
    )

    localStorage.setItem("auth_encrypted_data", encryptedData)
    localStorage.setItem("auth_passcode", authUser.transaction_pin)
  }

  const auth_passcode = localStorage.getItem("auth_passcode") || ""

  // Check if passcode has been set
  if (!auth_passcode) {
    localStorage.setItem("auth_email", Logic.Auth.SignInForm?.email || "")
    localStorage.setItem("auth_pass", Logic.Auth.SignInForm?.password || "")
    Logic.Common.GoToRoute("/auth/set-passcode")
  } else {
    Logic.Common.GoToRoute("/")
  }
}
