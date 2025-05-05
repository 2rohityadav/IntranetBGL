import React, {useRef} from 'react';
import {View, StyleSheet, ActivityIndicator, Image} from 'react-native';
import {WebView} from 'react-native-webview';

// Import images
const natwestBanner = require('../assets/images/banner.png');

const IntranetScreen = () => {
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

      function removePublishDateDiv() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument) {
            const publishDateDiv = mainFrame.contentDocument.querySelector('#pageControl_publishDate');
            if (publishDateDiv) {
              publishDateDiv.remove();
              console.log('Publish date div removed successfully');
            }
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
      removePublishDateDiv();

      // Try again after a short delay to ensure everything is loaded
      setTimeout(() => {
        removeFooter();
        removeBreakingNewsOverlay();
        topNewsSidebar();
        removePublishDateDiv();
      }, 500);

      // MutationObserver for iframe content
      function observeIframeContent() {
        try {
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument && mainFrame.contentDocument.body) {
            const iframeObserver = new MutationObserver(() => {
              removeFooter();
              topNewsSidebar();
              removePublishDateDiv();
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
        removePublishDateDiv();
      });
      observer.observe(document, {
        childList: true,
        subtree: true
      });

      // Also try to observe iframe content immediately
      observeIframeContent();

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'debug', msg: 'Setup complete' }));
      true;
    })();
  `;

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
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#00204E" />
          </View>
        )}
      />
      <View style={[styles.headerOverlay, {height: HEADER_HEIGHT}]}>
        <Image
          source={natwestBanner}
          style={styles.bannerImage}
          resizeMode="cover"
        />
      </View>
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
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
