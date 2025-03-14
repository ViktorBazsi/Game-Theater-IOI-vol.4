export default function CollectiveAnswersModal({
  title,
  children,
  isOpen,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 p-6 rounded-lg shadow-lg text-white max-w-lg w-full"
        onClick={(e) => e.stopPropagation()} // Megakadályozza a háttérre kattintáskor a bezárást
      >
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <div>{children}</div>
        <button
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
          onClick={onClose}
        >
          Bezárás
        </button>
      </div>
    </div>
  );
}
