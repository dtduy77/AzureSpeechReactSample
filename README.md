# React Speech Service Sample App

This sample shows how to integrate the Azure Speech service into a sample React application. It demonstrates design patterns for authentication token exchange and management, as well as capturing audio from a microphone or file for speech-to-text conversions.

## Prerequisites

1. Ensure you have an Azure account and Speech service subscription. If you don't have an account and subscription, [try the Speech service for free](https://docs.microsoft.com/azure/cognitive-services/speech-service/overview#try-the-speech-service-for-free).
2. Install [Node.js](https://nodejs.org/en/download/).

## How to Run the App

1. Clone this repo, then navigate to the project root directory.
2. Run `npm install` to install dependencies.
3. Add your Azure Speech key and region to the `.env` file, replacing the placeholder text.
4. To run the Express server and React app together, run `npm run dev`.

## Change Recognition Language

To change the source recognition language, modify the locale strings in `App.js` at lines **32** and **66**, which set the recognition language property on the `SpeechConfig` object.

```javascript
speechConfig.speechRecognitionLanguage = "en-US";
```
