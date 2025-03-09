import { useEffect } from 'react';
import MorseGame from '../../components/MorseGame';
import '../../styles.css';

const EmbedPage = () => {
  // Add meta tag for WebView compatibility
  useEffect(() => {
    // Set viewport for better mobile display
    const viewportMeta = document.createElement('meta');
    viewportMeta.name = 'viewport';
    viewportMeta.content = 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no';
    document.head.appendChild(viewportMeta);
    
    // Set canonical URL
    const canonicalLink = document.createElement('link');
    canonicalLink.rel = 'canonical';
    canonicalLink.href = 'https://morsehero.com/embed';
    document.head.appendChild(canonicalLink);
    
    // Set page title
    document.title = 'Morse Hero | Embed';
    
    return () => {
      document.head.removeChild(viewportMeta);
      document.head.removeChild(canonicalLink);
    };
  }, []);

  return (
    <div className="embed-container">
      <MorseGame embed={true} />
    </div>
  );
};

export default EmbedPage;
