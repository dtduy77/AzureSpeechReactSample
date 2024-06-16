import React, { useState, useEffect } from "react";
import { Container } from "reactstrap";
import { getTokenOrRefresh } from "./token_util";
import "./custom.css";
import { ResultReason } from "microsoft-cognitiveservices-speech-sdk";

const speechsdk = require("microsoft-cognitiveservices-speech-sdk");

export default function App() {
  const [displayText, setDisplayText] = useState(
    "INITIALIZED: ready to test speech..."
  );
  const [fullTranscription, setFullTranscription] = useState("");
  const [recognizer, setRecognizer] = useState(null);
  const [player, updatePlayer] = useState({ p: undefined, muted: false });

  useEffect(() => {
    return () => {
      if (recognizer) {
        recognizer.close();
      }
    };
  }, [recognizer]);

  async function sttFromMic() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    setDisplayText("Listening...");
    setRecognizer(recognizer);

    recognizer.recognizing = (s, e) => {
      if (e.result.reason === ResultReason.RecognizingSpeech) {
        setDisplayText(`Recognizing: ${e.result.text}`);
      }
    };

    recognizer.recognized = (s, e) => {
      if (e.result.reason === ResultReason.RecognizedSpeech) {
        setDisplayText(`Recognized: ${e.result.text}`);
        setFullTranscription(
          (prevTranscription) => prevTranscription + " " + e.result.text
        );
      } else if (e.result.reason === ResultReason.NoMatch) {
        setDisplayText("No match: Speech could not be recognized.");
      }
    };

    recognizer.canceled = (s, e) => {
      setDisplayText(`Canceled: ${e.reason} ${e.errorDetails}`);
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.sessionStarted = (s, e) => {
      setDisplayText("Session started.");
    };

    recognizer.sessionStopped = (s, e) => {
      setDisplayText("Session stopped.");
      recognizer.stopContinuousRecognitionAsync();
    };

    recognizer.startContinuousRecognitionAsync();
  }

  async function stopRecognition() {
    if (recognizer) {
      recognizer.stopContinuousRecognitionAsync(
        () => {
          setDisplayText("Recognition stopped.");
        },
        (err) => {
          setDisplayText(`Error stopping recognition: ${err}`);
        }
      );
    }
  }

  async function fileChange(event) {
    const audioFile = event.target.files[0];
    console.log(audioFile);
    const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

    setDisplayText(fileInfo);

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    speechConfig.speechRecognitionLanguage = "en-US";

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
    const recognizer = new speechsdk.SpeechRecognizer(
      speechConfig,
      audioConfig
    );

    recognizer.recognizeOnceAsync((result) => {
      let text;
      if (result.reason === ResultReason.RecognizedSpeech) {
        text = `RECOGNIZED: Text=${result.text}`;
      } else {
        text =
          "ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.";
      }

      setDisplayText(fileInfo + text);
    });
  }

  async function textToSpeech() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(
      tokenObj.authToken,
      tokenObj.region
    );
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    updatePlayer((p) => {
      p.p = myPlayer;
      return p;
    });
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(player.p);

    let synthesizer = new speechsdk.SpeechSynthesizer(
      speechConfig,
      audioConfig
    );

    const textToSpeak =
      "This is an example of speech synthesis for a long passage of text. Pressing the mute button should pause/resume the audio output.";
    setDisplayText(`speaking text: ${textToSpeak}...`);
    synthesizer.speakTextAsync(
      textToSpeak,
      (result) => {
        let text;
        if (
          result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted
        ) {
          text = `synthesis finished for "${textToSpeak}".\n`;
        } else if (result.reason === speechsdk.ResultReason.Canceled) {
          text = `synthesis failed. Error detail: ${result.errorDetails}.\n`;
        }
        synthesizer.close();
        synthesizer = undefined;
        setDisplayText(text);
      },
      function (err) {
        setDisplayText(`Error: ${err}.\n`);

        synthesizer.close();
        synthesizer = undefined;
      }
    );
  }

  return (
    <Container className="app-container">
      <h1 className="display-4 mb-3">Speech sample app</h1>
      <div className="row main-container">
        <div className="col-6">
          <i
            className="fas fa-microphone fa-lg mr-2"
            onClick={() => sttFromMic()}
          ></i>
          Convert speech to text from your mic.
          <div className="mt-2">
            <label htmlFor="audio-file">
              <i className="fas fa-file-audio fa-lg mr-2"></i>
            </label>
            <input
              type="file"
              id="audio-file"
              onChange={(e) => fileChange(e)}
              style={{ display: "none" }}
            />
            Convert speech to text from an audio file.
          </div>
          <div className="mt-2">
            <i
              className="fas fa-volume-up fa-lg mr-2"
              onClick={() => textToSpeech()}
            ></i>
            Convert text to speech.
          </div>
          <div className="mt-2">
            <i
              className="fas fa-stop fa-lg mr-2"
              onClick={() => stopRecognition()}
            ></i>
            Stop speech recognition.
          </div>
        </div>
        <div className="col-6 output-display rounded">
          <code>{displayText}</code>
          <div className="mt-3">
            <h5>Full Transcription:</h5>
            <code>{fullTranscription}</code>
          </div>
        </div>
      </div>
    </Container>
  );
}
