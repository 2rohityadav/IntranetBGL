import React, {useRef, useState} from 'react';
import {View, StyleSheet, Image} from 'react-native';
import {WebView} from 'react-native-webview';
import Spinner from '../components/Spinner';

// Import images
const natwestBanner = require('../assets/images/banner.png');

const IntranetScreen = () => {
  const [isLoading, setIsLoading] = useState(true);
  const INTRANET_URL =
    'https://intranet.natwestgrouppeople.com/Content/Page/Index/e3c5c097-ce2b-45af-86ad-5a1c8997787b?forceApprovalStatus=False&reviewComplete=False';
  const webViewRef = useRef<WebView>(null);
  const HEADER_HEIGHT = 100; // Adjust this based on the banner height

  const injectedScrollJS = `
    (function() {
      function removeFooter() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument) {
            const footerContainer = mainFrame.contentDocument.getElementById('SiteFooterAppContainer');
            if (footerContainer) {
              footerContainer.remove();
            }
          }
        } catch (e) {
          // Silently ignore errors
        }
      }

      function removeBreakingNewsOverlay() {
        const breakingNews = document.querySelector('.o-breaking-news.qa-breaking-news');
        if (breakingNews) {
          breakingNews.remove();
          console.log('Breaking news element removed successfully');
        }
      }

      function handleAuthorLinks() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument) {
            const authorLinks = mainFrame.contentDocument.querySelectorAll('a[data-automated-id="author-name"]');
            authorLinks.forEach(link => {
              link.href = '#';
              console.log('Author link href modified successfully');
            });
          }
        } catch (e) {
          // Silently ignore errors
        }
      }

      function topNewsSidebar() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument) {
            const newsSidebars = mainFrame.contentDocument.querySelectorAll('#news-sidebar');
            newsSidebars.forEach(newsSidebar => {
              const listButton = newsSidebar.querySelector('#pageControl_listbutton[data-pagecontroltitle="menu"]');
              if (listButton) {
                newsSidebar.remove();
                console.log('news-sidebar with menu listbutton removed successfully');
              }
            });
          }
        } catch (e) {
          // Silently ignore errors
        }
      }

      // Initial removal attempts
      removeFooter();
      removeBreakingNewsOverlay();
      topNewsSidebar();
      handleAuthorLinks();

      // Try again after a short delay to ensure everything is loaded
      setTimeout(() => {
        removeFooter();
        removeBreakingNewsOverlay();
        topNewsSidebar();
        handleAuthorLinks();
        
        // Notify React Native that cleanup is complete
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'cleanupComplete' }));
      }, 500);

      // MutationObserver for iframe content
      function observeIframeContent() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument && mainFrame.contentDocument.body) {
            const iframeObserver = new MutationObserver(() => {
              removeFooter();
              topNewsSidebar();
              handleAuthorLinks();
            });
            iframeObserver.observe(mainFrame.contentDocument.body, {
              childList: true,
              subtree: true
            });
          }
        } catch (e) {
          // Silently ignore errors
        }
      }

      // MutationObserver for main document to detect iframe and breaking news
      const observer = new MutationObserver(() => {
        observeIframeContent();
        removeBreakingNewsOverlay();
        topNewsSidebar();
        handleAuthorLinks();
      });
      observer.observe(document, {
        childList: true,
        subtree: true
      });

      // Also try to observe iframe content immediately
      observeIframeContent();
    })();
  `;

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'cleanupComplete') {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: INTRANET_URL}}
        injectedJavaScript={injectedScrollJS}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={styles.webview}
        onMessage={handleMessage}
      />
      <View style={[styles.headerOverlay, {height: HEADER_HEIGHT}]}>
        <Image
          source={natwestBanner}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
      <Spinner visible={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#5E2590', // Purple background matching the banner
    zIndex: 2,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default IntranetScreen;
