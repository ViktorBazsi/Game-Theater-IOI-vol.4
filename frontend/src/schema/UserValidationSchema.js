import * as yup from "yup";

export const userValidationSchemaForRegister = yup.object({
  username: yup
    .string()
    .required("Név megadása kötelező")
    .min(2, "Legalább két betűs név kell"),
  email: yup
    .string()
    .email("Valós emailt adj meg!")
    .required("Email megadása kötelező"),
  password: yup
    .string()
    .min(6, "A jelszónak minimum 6 karakternek kell lennie")
    .required("Jelszó megadása kötelező!"),
});

export const userValidationSchemaForLogin = yup.object({
  username: yup.string().min(2, "Legalább két betűs név kell"),
  email: yup
    .string()
    .email("Valós emailt adj meg!")
    .required("Email megadása kötelező"),
  password: yup
    .string()
    .min(6, "A jelszónak minimum 6 karakternek kell lennie")
    .required("Jelszó megadása kötelező!"),
});

export const userValidationSchemaForQuestion = yup.object({
  number: yup
    .number()
    .required("A kérdés száma kötelező")
    .positive("A számnak pozitívnak kell lennie")
    .integer("A számnak egész számnak kell lennie"),
  question: yup.string().required("A kérdés szövege kötelező"),
});
