import { useEffect } from 'react';
import MorseGame from '../../components/MorseGame';
import '../../styles.css';

const EmbedPage = () => {
  // Add meta tag for WebView compatibility and set page title
  useEffect(() => {
    // Set viewport for better mobile display
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(viewportMeta);

    // Set page title
    document.title = 'Morse Hero | Embed';

    return () => {
      // Remove viewport meta tag when component unmounts
      const metaTag = document.querySelector('meta[name="viewport"]');
      if (metaTag && metaTag.parentNode) {
        metaTag.parentNode.removeChild(metaTag);
      }
    };
  }, []);

  return (
    <div className="embed-container">
      <MorseGame embed={true} />
    </div>
  );
};

export default EmbedPage;
