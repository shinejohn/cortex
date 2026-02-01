import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const BusinessProfilePage = () => {
  const { slug } = useParams();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Replace with your actual data fetching logic
    const fetchBusiness = async () => {
      try {
        // Mock data loading
        setTimeout(() => {
          setBusiness({
            id: '123',
            name: 'Sample Business',
            slug: slug,
            description: 'This is a sample business profile.'
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching business:', error);
        setLoading(false);
      }
    };
    fetchBusiness();
  }, [slug]);
  if (loading) {
    return <div>Loading business profile...</div>;
  }
  return (
    <div className="business-profile-container">
      <h1>Business Profile</h1>
      {business &&
      <div>
          <h2>{business.name}</h2>
          <p>{business.description}</p>
        </div>
      }
    </div>);

};
export default BusinessProfilePage;