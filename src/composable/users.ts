import { Beneficiary, User, Business } from "@greep/logic/src/gql/graphql";
import { MappedBeneficiary } from "./types";

const mapToBeneficiaries = (
  raw: Beneficiary[] | User[] | Business[],
  type: "beneficiary" | "user" | "business"
): MappedBeneficiary[] => {
  if (!raw || raw.length === 0) return [];

  if (type === "beneficiary") {
    return (raw as Beneficiary[]).map((beneficiary) => {
      const user = beneficiary.beneficiary;
      return {
        id: user?.uuid || "",
        image: user?.profile?.profile_picture || "/images/profile-image.svg",
        name:
          `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() ||
          "Unknown",
        description: "Beneficiary",
        currency:
          user?.profile?.default_currency === "USDC"
            ? "USD"
            : user?.profile?.default_currency || "USD",
        isBeneficiary: true,
        wallet_uuid: user?.wallet?.uuid,
      };
    });
  }

  if (type === "user") {
    return (raw as User[]).map((user) => ({
      id: user.uuid || "",
      image: user.profile?.profile_picture || "/images/profile-image.svg",
      name: `${user.first_name} ${user.last_name}`.trim(),
      description: "Personal",
      currency:
        user.profile?.default_currency === "USDC"
          ? "USD"
          : user.profile?.default_currency || "USD",
      isBeneficiary: false,
      wallet_uuid: user?.wallet?.uuid,
    }));
  }

  if (type === "business") {
    return (raw as Business[]).map((business) => ({
      id: business.user?.uuid || "",
      image: business.logo || "/images/profile-image.svg",
      name: business.business_name || "Unknown Business",
      description: "Business",
      currency:
        business.default_currency === "USDC"
          ? "USD"
          : business.default_currency || "USD",
      isBeneficiary: false,
      wallet_uuid: business?.wallet?.uuid || "",
    }));
  }

  return [];
};

export { mapToBeneficiaries };
