import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faStepForward,
  faListDots,
} from "@fortawesome/free-solid-svg-icons";
import { GetSong } from "../../../wailsjs/go/multimedia/Library";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";
import "./Player.css";

interface PlayerProps {
  songName: string;
  setSelectedSongName: React.Dispatch<React.SetStateAction<string>>;
  filePath: string;
  libName: string;
  isInputFieldFocused: boolean;

  queue: Set<SongLibrary>; // Add queue as a prop
  setQueue: React.Dispatch<React.SetStateAction<Set<SongLibrary>>>; // Include setQueue in the props
  setIsQueuePanelOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Player: React.FC<PlayerProps> = ({
  songName,
  setSelectedSongName,
  filePath,
  queue,
  isInputFieldFocused,
  setIsQueuePanelOpen,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>();
  const [isSongEnded, setIsSongEnded] = useState(false);
  const [currentSongName, setCurrentSongName] = useState("");
  const [nextSongIndex, setNextSongIndex] = useState(0);

  const [value, setValue] = useState<number>(0.5); // Initial slider value
  const [thumbPosition, setThumbPosition] = useState<number>(0); // Initial thumb position
  const [progressThumbPosition, setProgressThumbPosition] = useState<number>(0); // Initial thumb position

  useEffect(() => {
    console.log("value changed >>>", value);
    updateThumbPosition();
  }, [value]);

  useEffect(() => {
    updateProgressThumbPosition();
  }, [currentTime]);

  const updateThumbPosition = () => {
    const volumeControl = document.querySelector(
      ".volume-control"
    ) as HTMLInputElement;
    if (volumeControl) {
      const thumbWidth =
        ((value - parseFloat(volumeControl.min)) /
          (parseFloat(volumeControl.max) - parseFloat(volumeControl.min))) *
        volumeControl.offsetWidth;
      setThumbPosition(thumbWidth);
    }
  };

  const updateProgressThumbPosition = () => {
    const progressControl = document.querySelector(
      ".progress-control"
    ) as HTMLInputElement;
    if (progressControl) {
      const thumbWidth =
        ((currentTime - parseFloat(progressControl.min)) /
          (parseFloat(progressControl.max) - parseFloat(progressControl.min))) *
        progressControl.offsetWidth;
      setProgressThumbPosition(thumbWidth);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      // setVolume(newVolume);
      setValue(newVolume);
    }
    // };
  };

  function loadAudio(base64String: string) {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.src = "data:audio/mpeg;base64," + base64String;
    }
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Check if the space key is pressed, input field is not focused, and isPausable is true
      if (event.key === " " && !isInputFieldFocused) {
        togglePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPlaying, isInputFieldFocused]); // Include isInputFieldFocused in the dependency array

  useEffect(() => {
    // Check if the queue is empty and if the current song has ended
    if (queue.size > 0 && isSongEnded) {
      // Get the first song in the queue
      const nextSong = Array.from(queue)[nextSongIndex];
      // Check if the next song is different from the currently playing song
      // if (nextSong.name !== songName) {
      if (nextSongIndex + 1 < queue.size) {
        console.log("nextSongIndex", nextSongIndex);
        console.log("queue.size", queue.size);
        console.log("nextSongIndex + 1 < queue.size");
        setNextSongIndex(nextSongIndex + 1);
      } else {
        audioRef.current?.pause();
      }

      GetSong(nextSong.path)
        .then((base64String) => {
          loadAudio(base64String);
          audioRef.current?.play();
          setSelectedSongName(nextSong.name);
          setIsPlaying(true);

          console.log("checking if nextSongIndex + 1 < queue.size");

          setCurrentSongName(nextSong.name);
          setIsSongEnded(false);
        })
        .catch((error) => console.error("Error fetching audio:", error));
      // } else {
      //   // If the next song is the same as the currently playing song, do nothing
      //   setIsSongEnded(true); // Reset the song ended state
      // }
    }
  }, [isSongEnded, songName]); // Dependency on queue, isSongEnded, and songName

  useEffect(() => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.addEventListener("ended", handleSongEnded);
      // Cleanup: Remove event listener when component unmounts
      return () => {
        audioPlayer.removeEventListener("ended", handleSongEnded);
      };
    }
  }, [audioRef]);

  const handleSongEnded = () => {
    setIsSongEnded(true);
  };

  useEffect(() => {
    // Check if the queue is empty and if the player is not playing
    if (queue.size == 0) {
    }
  }, [queue]); // Dependency on queue and isPlaying

  useEffect(() => {
    setCurrentSongName(songName);
    //TODO::// emit event to update app title. 

  }, [songName]);

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
    setIsPlaying((prevState) => !prevState);

    if (isPlaying) {
      audioPlayer?.pause();
    } else {
      audioPlayer?.play();
    }
  };

  const toggleQueuePanel = () => {
    setIsQueuePanelOpen((prevState) => !prevState);
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

  const playNextSong = () => {
    // Check if there are songs in the queue
    if (queue.size > 0) {
      // Get the first song in the queue
      const nextSong = Array.from(queue)[nextSongIndex];

      if (nextSongIndex + 1 < queue.size) {
        setNextSongIndex(nextSongIndex + 1);
      } else {
        audioRef.current?.pause();
      }
      GetSong(nextSong.path)
        .then((base64String) => {
          loadAudio(base64String);
          audioRef.current?.play();
          setIsPlaying(true);
          setCurrentSongName(nextSong.name);
          setSelectedSongName(nextSong.name);
        })
        .catch((error) => console.error("Error fetching audio:", error));
    }
  };

  return (
    <div id="player">
      <div id="songName">{currentSongName.replace(/\.[^.]+$/, "")} </div>

      <FontAwesomeIcon
        className="playPauseButton"
        icon={isPlaying ? faPause : faPlay}
        onClick={togglePlayPause}
        size="2x"
      />

      <FontAwesomeIcon
        className="next-song-button"
        icon={faStepForward}
        size="2x"
        onClick={playNextSong}
      />
      <audio
        id="audioPlayer"
        ref={audioRef}
        autoPlay
        onTimeUpdate={updateCurrentTime}
      ></audio>

      {!Number.isNaN(getDuration()) && (
        <>
          {!Number.isNaN(getDuration()) && Math.floor(currentTime / 60)}:
          {Math.floor(currentTime % 60)}
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
          {!Number.isNaN(getDuration()) && Math.floor(getDuration() / 60)}:
          {Math.floor(getDuration() % 60)}
        </>
      )}

      <input
        type="range"
        className="volume-control"
        min="0"
        max="1"
        step="0.01"
        value={value}
        onChange={handleChange}
      />
      <div
        style={{ left: `${thumbPosition}px` }}
        onMouseDown={(e) => {
          e.preventDefault(); // Prevent default behavior
          const volumeControl = document.querySelector(
            ".volume-control"
          ) as HTMLInputElement;
          if (volumeControl) {
            const offsetX =
              e.clientX - volumeControl.getBoundingClientRect().left;
            const newValue =
              (offsetX / volumeControl.offsetWidth) *
              (parseFloat(volumeControl.max) - parseFloat(volumeControl.min));
            setValue(newValue);
            const handleMouseMove = (e: MouseEvent) => {
              const offsetX =
                e.clientX - volumeControl.getBoundingClientRect().left;
              const newValue =
                (offsetX / volumeControl.offsetWidth) *
                (parseFloat(volumeControl.max) - parseFloat(volumeControl.min));
              setValue(newValue);
            };
            const handleMouseUp = () => {
              document.removeEventListener("mousemove", handleMouseMove);
              document.removeEventListener("mouseup", handleMouseUp);
            };
            document.addEventListener("mousemove", handleMouseMove);
            document.addEventListener("mouseup", handleMouseUp);
          }
        }}
      />

      <div onClick={toggleQueuePanel} className="toggle-queue-btn">
        <FontAwesomeIcon icon={faListDots} size="2x" />
      </div>
    </div>
  );
};

export default Player;
