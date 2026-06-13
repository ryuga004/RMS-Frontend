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
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/30 p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          {/* Illustration SVG */}
          <svg
            viewBox="0 0 400 400"
            className="w-full h-auto mx-auto"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background circle */}
            <circle cx="200" cy="200" r="180" fill="#3B82F6" opacity="0.1" />
            <circle cx="200" cy="200" r="140" fill="#3B82F6" opacity="0.05" />

            {/* Building/House shape */}
            <path
              d="M 100 300 L 150 150 L 250 150 L 300 300 Z"
              fill="#3B82F6"
              opacity="0.8"
            />
            <rect x="115" y="170" width="35" height="40" fill="#FFFFFF" opacity="0.9" />
            <rect x="170" y="170" width="35" height="40" fill="#FFFFFF" opacity="0.9" />
            <rect x="225" y="170" width="35" height="40" fill="#FFFFFF" opacity="0.9" />
            <rect x="115" y="230" width="35" height="40" fill="#FFFFFF" opacity="0.9" />
            <rect x="170" y="230" width="35" height="40" fill="#FFFFFF" opacity="0.9" />
            <rect x="225" y="230" width="35" height="40" fill="#FFFFFF" opacity="0.9" />

            {/* Door */}
            <rect x="180" y="260" width="40" height="60" fill="#F3F4F6" opacity="0.9" />
            <circle cx="215" cy="290" r="3" fill="#3B82F6" />

            {/* Roof */}
            <polygon points="150,150 200,80 250,150" fill="#3B82F6" opacity="0.9" />

            {/* Windows on roof */}
            <circle cx="190" cy="110" r="6" fill="#FFFFFF" opacity="0.8" />
            <circle cx="210" cy="110" r="6" fill="#FFFFFF" opacity="0.8" />

            {/* Key icon - floating */}
            <g transform="translate(320, 100)">
              <circle cx="0" cy="0" r="18" fill="#3B82F6" opacity="0.7" />
              <circle cx="-4" cy="0" r="12" fill="none" stroke="#FFFFFF" strokeWidth="2" />
              <line x1="8" y1="0" x2="22" y2="0" stroke="#FFFFFF" strokeWidth="2" />
              <circle cx="24" cy="0" r="2" fill="#FFFFFF" />
            </g>

            {/* People silhouettes */}
            <g>
              {/* Person 1 */}
              <circle cx="80" cy="320" r="8" fill="#3B82F6" opacity="0.6" />
              <path d="M 75 335 L 85 335 L 85 350 L 75 350 Z" fill="#3B82F6" opacity="0.6" />

              {/* Person 2 */}
              <circle cx="320" cy="320" r="8" fill="#3B82F6" opacity="0.6" />
              <path d="M 315 335 L 325 335 L 325 350 L 315 350 Z" fill="#3B82F6" opacity="0.6" />
            </g>

            {/* Decorative elements */}
            <circle cx="60" cy="80" r="4" fill="#3B82F6" opacity="0.5" />
            <circle cx="340" cy="300" r="5" fill="#3B82F6" opacity="0.5" />
            <circle cx="50" cy="250" r="3" fill="#3B82F6" opacity="0.4" />
          </svg>

          <div className="space-y-4 pt-8">
            <h2 className="text-3xl font-bold text-foreground">{title}</h2>
            <p className="text-lg text-foreground/60">{description}</p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-8 sm:px-6 lg:px-12">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
