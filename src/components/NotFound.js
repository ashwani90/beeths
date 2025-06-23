import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-9xl font-bold text-gray-800">404</h1>
      <p className="text-2xl font-medium text-gray-600 mt-4">
        Oops! The page you're looking for doesn't exist.
      </p>
      <p className="text-gray-500 mt-2">
        It might have been removed, renamed, or might never have existed.
      </p>
      <Link
        to="/"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-500 transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotFound;
