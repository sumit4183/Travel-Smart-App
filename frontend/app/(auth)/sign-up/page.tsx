import React from 'react';

const SignUp = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-6">Sign Up</h1>
      <div className="space-y-4">
        <button className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 w-full">
          Sign up with Google
        </button>
        <button className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full">
          Sign up with Facebook
        </button>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="border p-2 rounded w-full"
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="border p-2 rounded w-full"
            required
          />
          <button type="submit" className="bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 w-full">
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
