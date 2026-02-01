import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const AuthorProfilePage = () => {
  const { authorId } = useParams();
  const [author, setAuthor] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Replace with your actual data fetching logic
    const fetchAuthor = async () => {
      try {
        // Mock data loading
        setTimeout(() => {
          setAuthor({
            id: authorId,
            name: 'Sample Author',
            bio: 'This is a sample author bio.'
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching author:', error);
        setLoading(false);
      }
    };
    fetchAuthor();
  }, [authorId]);
  if (loading) {
    return <div>Loading author profile...</div>;
  }
  return (
    <div className="author-profile-container">
      <h1>Author Profile</h1>
      {author &&
      <div>
          <h2>{author.name}</h2>
          <p>{author.bio}</p>
        </div>
      }
    </div>);

};
export default AuthorProfilePage;