import Image from "next/image";
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  description: string;
}

export function AuthLayout({ children, title, description }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Side - Illustration */}
      <div
        className="hidden lg:flex lg:w-1/2 items-center justify-center relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/images/illustration.png')",
        }}
      >
      </div>
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
