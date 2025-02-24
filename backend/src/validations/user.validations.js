import * as yup from "yup";

export const userValidationSchemaForRegister = yup.object({
  username: yup
    .string()
    .required("Név megadása kötelező")
    .min(3, "Legalább három karakterből álljon a név"),
  email: yup
    .string()
    .email("Érvényes email formátumot adj meg!")
    .required("email cím megadása kötelező"),
  password: yup
    .string()
    .min(6, "Legalább hat karakterből álljon a jelszó")
    .required("Jelszó megadása kötelező"),
});

export const userValidationSchemaForLoginEmail = yup.object({
  username: yup.string(),
  email: yup
    .string()
    .email("Érvényes email formátumot adj meg!")
    .required("email cím megadása kötelező"),
  password: yup.string().required("Jelsző megadása kötelező"),
});

export const userValidationSchemaForLoginName = yup.object({
  username: yup
    .string()
    .required("Név megadása kötelező")
    .min(3, "Legalább három karakterből álljon a név"),
  email: yup.string(),
  password: yup.string().required("Jelsző megadása kötelező"),
});
