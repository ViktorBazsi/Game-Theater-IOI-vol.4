import { useContext } from "react";
import AuthContext from "../contexts/AuthContext";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useNavigate } from "react-router-dom";
import { userValidationSchemaForLogin } from "../schema/userValidationSchema";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Importáld a toast CSS-t

export default function LoginForm({ onRegisterClick, onSuccess }) {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const initialValues = { email: "", password: "" };

  const handleLogin = async (values) => {
    const result = await login(values);

    if (result.ok) {
      toast.success("Sikeres bejelentkezés!", {
        position: "top-right",
        autoClose: 3000,
      });
      onSuccess(); // 🔹 Sikeres bejelentkezés után bezárja a modalt
      navigate("/signedIn");
    } else {
      const errorMessage =
        result.message?.response?.data?.error || "Ismeretlen hiba";
      const statusCode = result.message?.response?.status || "N/A";

      toast.error(
        `Sikertelen bejelentkezés! ${statusCode} - ${errorMessage}`,
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
        Bejelentkezés
      </h2>
      <Formik
        initialValues={initialValues}
        validationSchema={userValidationSchemaForLogin}
        onSubmit={handleLogin}
      >
        <Form>
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
              Bejelentkezés
            </button>
          </div>
        </Form>
      </Formik>
      <div className="flex justify-center text-white">
        Nem vagy regisztrálva?
        <button
          onClick={onRegisterClick}
          className="text-white hover:underline pl-2 hover:scale-110 hover:text-purple-900 transition duration-700"
        >
          Regisztrálj
        </button>
      </div>
    </div>
  );
}
