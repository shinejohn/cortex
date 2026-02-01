import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const EditorPage = () => {
  const { articleId } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Replace with your actual data fetching logic
    const fetchArticle = async () => {
      try {
        // Mock data loading
        setTimeout(() => {
          setArticle({
            id: articleId,
            title: 'Sample Article',
            content: 'This is a sample article content.'
          });
          setLoading(false);
        }, 500);
      } catch (error) {
        console.error('Error fetching article:', error);
        setLoading(false);
      }
    };
    fetchArticle();
  }, [articleId]);
  if (loading) {
    return <div>Loading editor...</div>;
  }
  return (
    <div className="editor-container">
      <h1>Article Editor</h1>
      <p>Editing article: {articleId}</p>
      {article &&
      <div>
          <h2>{article.title}</h2>
          <div>{article.content}</div>
        </div>
      }
    </div>);

};
export default EditorPage;