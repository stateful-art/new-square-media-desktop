import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause } from "@fortawesome/free-solid-svg-icons";
import { GetSong } from "../../../wailsjs/go/multimedia/Library";

interface PlayerProps {
  songName: string;
  filePath: string;
  libName: string;
}

const Player: React.FC<PlayerProps> = ({ songName, filePath }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  function loadAudio(base64String: string) {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.src = "data:audio/mpeg;base64," + base64String;
    }
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
  }, [isPlaying]); // Include isPlaying in the dependency array

  useEffect(() => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      GetSong(filePath)
        .then((base64String) => loadAudio(base64String))
        .catch((error) => console.error("Error fetching audio:", error));
      audioPlayer.play();
      setIsPlaying(true);
    }

    return () => {
      if (audioPlayer) {
        audioPlayer.pause();
        setIsPlaying(false);
      }
    };
  }, [filePath]);

  const togglePlayPause = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      if (audioPlayer.paused) {
        audioPlayer.play();
        setIsPlaying(true);
      } else {
        audioPlayer.pause();
        setIsPlaying(false);
      }
    }
  };

  const updateCurrentTime = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      setCurrentTime(audioPlayer.currentTime);
    }
  };

  const getDuration = () => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      return audioPlayer.duration;
    }
    return 0;
  };

  const getSongNameStyle = (): string => {
    return songName.length > 20 ? "scroll-text" : "";
  };

  return (
    <div id="player">
      <div id="songName" className={getSongNameStyle()}>
        {songName}
      </div>
      <div id="customAudioPlayer">
        <div className={"playPauseButton"} onClick={togglePlayPause}>
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="2x" />
        </div>
        <audio
          id="audioPlayer"
          ref={audioRef}
          autoPlay
          onTimeUpdate={updateCurrentTime}
        ></audio>
      </div>
      {!Number.isNaN(getDuration())&&
      <div id="prog">
        { Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
        <progress
          id="customProgressBar"
          value={currentTime}
          max={getDuration()}
        ></progress>
        {Math.floor(getDuration() / 60)}:{Math.floor(getDuration() % 60)}
      </div>
}


    </div>
  );
  
};

export default Player;
