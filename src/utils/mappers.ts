import { Category } from "@greep/logic/src/gql/graphql"
import { supportedCountries } from "../composable"

export const formatRichText = (text: string): string => {
  if (!text) return ""

  return text
    .replace(/\*\*(.*?)\*\*/g, "<em>$1</em>") // italics
    .replace(/__(.*?)__/g, "<strong>$1</strong>") // bold
    .replace(/~~(.*?)~~/g, "<del>$1</del>") // strikethrough
}

export const getCountryKeyValueList = () => {
  return supportedCountries.map((item) => ({
    key: item.isoCode,
    value: item.country,
  }))
}

export const getVerificationMethodsByIsoCode = (isoCode: string) => {
  const country = supportedCountries.find(
    (item) => item.isoCode.toUpperCase() === isoCode.toUpperCase()
  )
  return country ? country.idVerificationMethods : []
}
