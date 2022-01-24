# tabler-app

## DEV Environment

1. Configure aws default credentials
1. `yarn install` (once, should be kept same version)
1. `yarn run config` (fetches configuration information from Amazon)
    - Creates `config/aws.json`
    - Creates `app.json`
1. `yarn dev`
    - `i` (to launch iOS simulator and install appp)
    - `a` (to launch Android simulator and install app)

If you want to use the locaal

## Manually install iOS Simulator
1. Check https://expo.io/--/api/v2/versions
1. download `curl https://expo.io/--/api/v2/versions | jq '.sdkVersions | ."40.0.0" | .iosClientUrl'` where `40.0.0` is the desired SDK
1. Extract tgz
1. `open -a simulator`
1. `xcrun simctl install booted /path/to/tgz` 

## Android Emulator

1. Download https://developer.android.com/studio#downloads
1. Extract ZIP to a local path e.g. `~/Android`
1. Update packages (`tools/bin`)
1. Update profile

```bash
export ANDROID_HOME=~/Android
export ANDROID_SDK_ROOT=$ANDROID_HOME

export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

5. Udate packages

```bash
sdkmanager "emulator"
sdkmanager "system-images;android-30;google_apis_playstore;x86_64"
sdkmanager "platforms;android-30"
sdkmanager "platform-tools"
```

6. Create image named *expo*

```bash
avdmanager create avd -n expo -k "system-images;android-30;google_apis_playstore;x86_64" --device pixel

for f in ~/.android/avd/*.avd/config.ini; do echo 'hw.keyboard=yes' >> "$f"; done

# avdmanager delete avd -n expo
```

7. Run the image

```bash
emulator -avd expo
```
