import React from "react";
import { Link } from "react-router-dom";

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-white font-serif py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center">
          <div className="bg-[url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif)] h-[400px] bg-center bg-no-repeat bg-contain">
            <h1 className="text-8xl font-bold pt-20">404</h1>
          </div>
          <div className="mt-[-50px]">
            <h3 className="text-2xl font-bold mb-2">Look like you're lost</h3>
            <p className="text-gray-600 mb-4">The page you are looking for is not available!</p>
            <Link to="/" className="inline-block px-6 py-2 text-white  bg-blue-500 hover:bg-blue-600 rounded-md transition duration-300">
              Go Back
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageNotFound;
