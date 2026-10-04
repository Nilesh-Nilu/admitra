const { withAndroidManifest, withMainActivity } = require('@expo/config-plugins');

const withAndroidSecurity = (config) => {
  // Configure Android Manifest
  config = withAndroidManifest(config, async (config) => {
    const androidManifest = config.modResults;

    // Add permissions and features
    if (!androidManifest.manifest['uses-permission']) {
      androidManifest.manifest['uses-permission'] = [];
    }

    // Ensure we have internet permission but block recording permissions
    const hasInternetPermission = androidManifest.manifest['uses-permission'].some(
      permission => permission.$?.['android:name'] === 'android.permission.INTERNET'
    );

    if (!hasInternetPermission) {
      androidManifest.manifest['uses-permission'].push({
        $: { 'android:name': 'android.permission.INTERNET' }
      });
    }

    // Add application-level security settings
    const application = androidManifest.manifest.application?.[0];
    if (application) {
      // Set application to allow backup = false for security
      application.$['android:allowBackup'] = 'false';
      application.$['android:fullBackupContent'] = 'false';

      // targetSdk 36 enables predictive back, which bypasses RN's BackHandler/
      // navigation stack and closes the app. Opt out so back pops screens.
      application.$['android:enableOnBackInvokedCallback'] = 'false';
      
      // Add activities security
      if (application.activity) {
        for (const activity of application.activity) {
          if (activity.$?.['android:name']?.includes('.MainActivity')) {
            // Set window flags for security
            activity.$['android:excludeFromRecents'] = 'false';
            activity.$['android:windowSoftInputMode'] = 'adjustResize';
            
            // Add meta-data for FLAG_SECURE
            if (!activity['meta-data']) {
              activity['meta-data'] = [];
            }
            
            // Add security meta-data
            activity['meta-data'].push({
              $: {
                'android:name': 'android.app.lib_name',
                'android:value': 'expo'
              }
            });
          }
        }
      }
    }

    return config;
  });

  // Configure Main Activity for FLAG_SECURE
  config = withMainActivity(config, (config) => {
    const mainActivity = config.modResults;
    
    // Add imports for security
    if (!mainActivity.contents.includes('import android.view.WindowManager;')) {
      mainActivity.contents = mainActivity.contents.replace(
        'import android.os.Bundle;',
        'import android.os.Bundle;\nimport android.view.WindowManager;'
      );
    }

    // Add FLAG_SECURE in onCreate method
    const onCreatePattern = /protected void onCreate\(Bundle savedInstanceState\) \{[\s\S]*?super\.onCreate\(savedInstanceState\);/;
    const match = mainActivity.contents.match(onCreatePattern);
    
    if (match && !mainActivity.contents.includes('FLAG_SECURE')) {
      const replacement = match[0] + '\n        // Prevent screenshots and screen recording\n        getWindow().setFlags(WindowManager.LayoutParams.FLAG_SECURE, WindowManager.LayoutParams.FLAG_SECURE);';
      mainActivity.contents = mainActivity.contents.replace(match[0], replacement);
    }

    return config;
  });

  return config;
};

module.exports = withAndroidSecurity;
