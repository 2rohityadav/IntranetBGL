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

  const injectedJavaScript = `
    (function() {
      function removeHeader() {
        var header = document.getElementById('header-container');
        if (header) {
          header.remove();
          console.log("Header removed successfully!");
          return true;
        } else {
          console.log("Header not found, retrying...");
          return false;
        }
      }

      // Try immediately
      if (!removeHeader()) {
        // If not found, try again after a delay
        setTimeout(removeHeader, 2000);
      }

      // Listen for DOM changes
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          if (mutation.addedNodes.length) {
            removeHeader();
          }
        });
      });

      // Start observing
      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Return true to indicate the script ran
      true;
    })();
  `;

  const onLoadEnd = () => {
    // Re-inject the script after page load
    if (webViewRef.current) {
      webViewRef.current.injectJavaScript(injectedJavaScript);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{uri: INTRANET_URL}}
        injectedJavaScript={injectedJavaScript}
        onLoadEnd={onLoadEnd}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        style={styles.webview}
        onMessage={event => {
          console.log('WebView message:', event.nativeEvent.data);
        }}
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
    zIndex: 1,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
});

export default IntranetScreen;
