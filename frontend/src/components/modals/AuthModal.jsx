import LoginForm from "../LoginForm";
import RegisterForm from "../RegisterForm";

export default function AuthModal({
  isOpen,
  onClose,
  modalType,
  showRegisterModal,
  showLoginModal,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center bg-white bg-opacity-5 p-6 rounded-lg shadow-lg text-black w-1/2 relative h-3/4">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white text-xl font-bold hover:scale-125 transition duration-700"
        >
          ×
        </button>
        {modalType === "login" ? (
          <LoginForm onRegisterClick={showRegisterModal} onSuccess={onClose} />
        ) : (
          <RegisterForm onLoginClick={showLoginModal} />
        )}
      </div>
    </div>
  );
}
