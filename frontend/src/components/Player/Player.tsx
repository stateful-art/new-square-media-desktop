import React, { useState, useEffect } from "react";

import { GetSong } from "../../../wailsjs/go/multimedia/Library";

interface PlayerProps {
  songName: string;
  filePath: string;
  libName: string;
}

const Player: React.FC<PlayerProps> = ({ songName, filePath, libName }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  function loadAudio(base64String: string) {
    const audioPlayer = document.getElementById(
      "audioPlayer"
    ) as HTMLAudioElement;
    audioPlayer.src = "data:audio/mpeg;base64," + base64String;
  }

  // Assuming GetSong(filePath) returns a Promise<string>

  useEffect(() => {
    const audioPlayer = document.getElementById(
      "audioPlayer"
    ) as HTMLAudioElement;

    GetSong(filePath)
      .then((base64String) => loadAudio(base64String))
      .catch((error) => console.error("Error fetching audio:", error));

    audioPlayer.play();
    setIsPlaying(true);

    return () => {
      audioPlayer.pause();
      setIsPlaying(false);
    };
  }, [filePath, libName]);

  const togglePlayPause = () => {
    const audioPlayer = document.getElementById(
      "audioPlayer"
    ) as HTMLAudioElement;
    if (audioPlayer.paused) {
      audioPlayer.play();
      setIsPlaying(true);
    } else {
      audioPlayer.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div id="player">
      <div id="songName">{songName}</div>
      <audio id="audioPlayer" controls autoPlay></audio>
      {/* <button onClick={togglePlayPause}>{isPlaying ? 'Pause' : 'Play'}</button> */}
      <div id="recentsButton">history</div>
      <div id="queueButton">queue</div>
    </div>
  );
};

export default Player;
