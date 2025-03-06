import { Formik, Field, Form, ErrorMessage } from "formik";
import { userValidationSchemaForRegister } from "../schema/userValidationSchema";
import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importáld a toast CSS-t

export default function RegisterForm({ onLoginClick }) {
  const { register } = useContext(AuthContext);
  const initialValues = { username: "", email: "", password: "" };

  const handleRegister = async (values) => {
    const result = await register(values); // 🔹 Előbb küldd el a regisztrációt!

    if (result.ok) {
      toast.success("Sikeres regisztráció! Jelentkezz be!", {
        position: "top-right",
        autoClose: 3000,
      });
      onLoginClick(); // 🔹 Csak sikeres regisztráció után váltson modal-t
    } else {
      const errorMessage =
        result.message?.response?.data?.error || "Ismeretlen hiba";
      const statusCode = result.message?.response?.status || "N/A";

      toast.error(
        `Sikertelen regisztráció! ${statusCode} - ${errorMessage}`,
        {
          position: "top-right",
          autoClose: 4000,
        }
      );
    }
  };

  return (
    <div className="w-full mx-auto my-40 bg-white p-5 rounded-md bg-opacity-35">
      <h2 className="font-bold text-xk text-white text-xl mb-6">
        Regisztráció
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={userValidationSchemaForRegister}
        onSubmit={handleRegister}
      >
        <Form>
          <div className="mb-4">
            <Field
              type="text"
              name="username"
              placeholder="Név"
              className="w-full border p-2 rounded my-1 text-gray-800"
            />
            <ErrorMessage
              name="username"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>
          <div className="mb-4">
            <Field
              type="email"
              name="email"
              placeholder="Email cím"
              className="w-full border p-2 rounded my-1 text-gray-800"
            />
            <ErrorMessage
              name="email"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>
          <div className="mb-4">
            <Field
              type="password"
              name="password"
              placeholder="Jelszó"
              className="w-full border p-2 rounded my-1 text-gray-800"
            />
            <ErrorMessage
              name="password"
              component="div"
              className="text-red-500 text-sm"
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="border-2 bg-purple-950 bg-opacity-25 my-5 py-5 px-4 w-3/4 rounded-md text-white text-lg font-bold transform transition duration-700 hover:scale-110 hover:bg-purple-950 hover:bg-opacity-55"
            >
              Regisztráció
            </button>
          </div>
        </Form>
      </Formik>
      <div className="flex justify-center text-white">
        Már van fiókod?
        <button
          onClick={onLoginClick}
          className="text-white hover:underline pl-2 hover:scale-110 hover:text-purple-900 transition duration-700"
        >
          Bejelentkezés
        </button>
      </div>
    </div>
  );
}
