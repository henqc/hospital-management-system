export function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex flex-1 items-center justify-center px-4">
        <div className="text-center w-full max-w-4xl space-y-6 flex flex-col justify-center items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-900">
              Welcome to MedixCare
            </h1>
            <p className="text-gray-600 text-lg max-w-md mx-auto">
              A way for patients, doctors, and administrators to manage care
              with ease.
            </p>
          </div>
          <img
            src="/logo.png"
            alt="MedixCare Logo"
            className="mx-auto max-w-[200px] sm:max-w-[300px] mb-4"
          />
        </div>
      </main>
    </div>
  );
}
