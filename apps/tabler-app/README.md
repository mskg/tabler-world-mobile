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
sdkmanager "system-images;android-29;default;x86_64"
sdkmanager "platforms;android-29"
sdkmanager "platform-tools"
```

6. Create image named *expo*

```bash
avdmanager create avd -n expo -k "system-images;android-29;default;x86_64" -g "default" --device pixel

for f in ~/.android/avd/*.avd/config.ini; do echo 'hw.keyboard=yes' >> "$f"; done

# avdmanager delete avd -n expo
```

7. Run the image

```bash
emulator -avd expo
```
