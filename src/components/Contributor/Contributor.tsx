import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { api } from '@/utils/api';

interface ContributorsThanksProps {
  className?: string;
}

export default function ContributorsThanks({ className = '' }: ContributorsThanksProps) {
  const { data: contributors, isLoading, error } = api.contributors.getAll.useQuery();

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center p-8 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-center p-4 ${className}`}>
        Failed to load contributors
      </div>
    );
  }

  if (!contributors || contributors.length === 0) {
    return (
      <div className={`text-gray-500 text-center p-4 ${className}`}>
        No contributors to display
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Thank You to Our Contributors! 🎉
      </h2>
      <p className="text-gray-600 text-center mb-6">
        We appreciate everyone who has contributed to making this project better.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {contributors.map((contributor) => (
          <Link
            key={contributor.id}
            href={contributor.githubUrl || `https://github.com/${contributor.githubLogin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group"
          >
            <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 hover:shadow-md">
              <div className="relative w-16 h-16 mb-3">
                <Image
                  src={contributor.imgUrl || '/favicon.ico'}
                  alt={`${contributor.name || contributor.githubLogin}'s avatar`}
                  fill
                  className="rounded-full object-cover group-hover:scale-105 transition-transform duration-200"
                  sizes="64px"
                />
              </div>
              
              <h3 className="font-semibold text-gray-800 text-center text-sm mb-1">
                {contributor.name || contributor.githubLogin}
              </h3>
              
              <p className="text-gray-500 text-xs">
                @{contributor.githubLogin}
              </p>
            </div>
          </Link>
        ))}
      </div>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Want to contribute? Check out our{' '}
          <Link href="https://github.com/softwaredeveloperscollective/sdc-v3" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            contribution guidelines
          </Link>
        </p>
      </div>
    </div>
  );
}