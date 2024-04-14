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
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(1);

  function loadAudio(base64String: string) {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.src = "data:audio/mpeg;base64," + base64String;
    }
  }

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // currently, when this on;
  // when user presses space key when they enter a new lib name
  // if a song is being played, it stops playing. 
  // TODO: receive isInputVisible bool as a prop to this component

  // useEffect(() => {
  //   const handleKeyDown = (event: KeyboardEvent) => {
  //     if (event.key === " " && isPlaying) {
  //       togglePlayPause();
  //     }
  //   };
  //   window.addEventListener("keydown", handleKeyDown);
  //   return () => {
  //     window.removeEventListener("keydown", handleKeyDown);
  //   };
  // }, [isPlaying]); // Include isPlaying in the dependency array
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

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

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
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
        <input
          type="range"
          id="volumeControl"
          className="volume-control"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
      {!Number.isNaN(getDuration()) && (
        <div id="prog">
          { Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
          {/* <progress
            id="customProgressBar"
            value={currentTime}
            max={getDuration()}
          ></progress> */}
           <input
          type="range"
          id="progress-control"
          className="progress-control"
          min="0"
          max={getDuration()}
          step="1"
          value={currentTime}
          onChange={handleProgressChange}
          />
          {Math.floor(getDuration() / 60)}:{Math.floor(getDuration() % 60)}
        </div>
      )}
    </div>
  );
};

export default Player;
