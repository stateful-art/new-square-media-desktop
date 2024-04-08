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

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " " && isPlaying) {
        togglePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []); // Empty dependency array ensures that this effect runs only once, similar to componentDidMount

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
  }, [filePath]);

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

  const getSongNameStyle = (): string => {
    return songName.length > 20 ? "scroll-text" : "";
  };
  return (
    <div id="player">
      <div id="songName" className={getSongNameStyle()}>{songName}</div>
      <audio id="audioPlayer" controls autoPlay></audio>
      {/* <div id="recentsButton">history</div>
      <div id="queueButton">queue</div> */}
    </div>
  );
};

export default Player;
