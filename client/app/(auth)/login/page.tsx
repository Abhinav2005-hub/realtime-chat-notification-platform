export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow w-96">
                <h2 className="text-xl font-bold mb-4">Login</h2>

                <input 
                  type="email"
                  placeholder="Email"
                  className="w-full border p-2 mb-3 rounded"
                />

                <input 
                  type="password"
                  placeholder="Password"
                  className="w-full border p-2 mb-3 rounded"
                />

                <button className="w-full bg-blue-600 text-white py-2 rounded">
                    Login
                </button>
            </div>
        </div>
    )
}