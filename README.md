# COMP7082-HealthCareApp
COMP 7082 Software Engineering Course Project

███╗   ███╗      ██████╗  █████╗ ████████╗██╗  ██╗
████╗ ████║      ██╔══██╗██╔══██╗╚══██╔══╝██║  ██║
██╔████╔██║█████╗██████╔╝███████║   ██║   ███████║
██║╚██╔╝██║╚════╝██╔═══╝ ██╔══██║   ██║   ██╔══██║
██║ ╚═╝ ██║      ██║     ██║  ██║   ██║   ██║  ██║
╚═╝     ╚═╝      ╚═╝     ╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝

DEV NOTES:

Had some fun here with `node` and `expo`, which is a nice wrapper for React Native. With about 3 commands I had a little server for the app running on my machine that I could connect to on my phone just by scanning a QR code. Seems to be really nice and have APIs for everything we'd need. All open source and we could sell an app using this stuff and not owe anyone anything. Works well on my Android and should run well on your iOS.

Everything in the repo is from the `node` and `expo` install, except for some small changes to App.tsx!

## Setup Instructions:

#### 1. Get Node + Expo Go

[Go here](https://nodejs.org/en/download/archive/v24.13.0) and get probably:

"node-<LTS-version>-x64.msi"

To make sure you have it downloaded you can enter into cmd prompt or powershell: 

```cmd prompt
node -v
npm -v
```

Once complete, go on your phone to your App store and download Expo Go.

#### 2. Clone the repo

Create a folder you want to use for the app on your local machine. Then navigate to that folder in the command prompt, I like to right-click an empty spot on the folder and go open in cmd prompt or whatever. From there enter:

```cmd prompt
 git clone https://github.com/LinxelLina/COMP7082-HealthCareApp.git
 cd COMP7082-HEALTHCAREAPP/mobile
```

 This was this simple for me because I recently configured git, but could vary for you!

#### 3. Install NPM and launch your Expo server!

From the same /mobile folder run

```cmd prompt
npm install
npx expo start
```

Make sure the server and your phone are on the same wifi, and scan the QR code generated in your cmd prompt with the Expo Go app from your phone. The app should load automatically with the word "M-Path" in green and in the middle.

It didn't work at first for me, only did when I ran.

```cmd prompt
npx expo start --tunnel
```


Ctrl + C should end the app on your cmd prompt.
