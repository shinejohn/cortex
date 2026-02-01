import React from 'react';
import { useParams } from 'react-router-dom';
import { BusinessProfile } from '../../components/BusinessProfile';
const BusinessProfilePage = () => {
  const { slug } = useParams<{
    slug: string;
  }>();
  if (!slug) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Business Not Found
          </h1>
          <p className="text-gray-600">
            The business you're looking for doesn't exist.
          </p>
        </div>
      </div>);

  }
  return <BusinessProfile slug={slug} />;
};
export default BusinessProfilePage;