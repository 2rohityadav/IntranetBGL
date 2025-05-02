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
          // Get the main iframe
          const mainFrame = document.getElementById('main');
          if (mainFrame && mainFrame.contentDocument) {
            // Access the iframe's document
            const footerContainer = mainFrame.contentDocument.getElementById('SiteFooterAppContainer');
            if (footerContainer) {
              footerContainer.remove();
            }
          }
        } catch (e) {
          console.error('Error removing footer:', e);
        }
      }

      // Initial removal attempt
      removeFooter();

      // Try to remove after a short delay to ensure iframe is loaded
      setTimeout(removeFooter, 1000);

      function sendScroll() {
        var scrollTop = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
        var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
        var clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
        var percent = (scrollTop + clientHeight) / scrollHeight;
        window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'scroll', percent: percent }));
      }
      window.addEventListener('scroll', sendScroll, true);

      // Create a MutationObserver to watch for iframe changes
      const observer = new MutationObserver((mutations) => {
        const mainFrame = document.getElementById('main');
        if (mainFrame) {
          try {
            // Try to access the iframe's document
            if (mainFrame.contentDocument) {
              // Create an observer for the iframe's content
              const iframeObserver = new MutationObserver(() => {
                removeFooter();
              });

              // Observe the iframe's document body
              iframeObserver.observe(mainFrame.contentDocument.body, {
                childList: true,
                subtree: true
              });
            }
          } catch (e) {
            console.error('Error setting up iframe observer:', e);
          }
        }
      });

      // Start observing the main document for the iframe
      observer.observe(document, {
        childList: true,
        subtree: true
      });

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
        onMessage={event => {
          console.log('WebView message:', event.nativeEvent.data);
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'scroll') {
              setShowFooter(data.percent >= 0.9);
            }
          } catch {}
        }}
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
  footerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF', // Purple background matching the banner
    zIndex: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    fontWeight: 'bold',
    color: '#333',
  },
});

export default IntranetScreen;
