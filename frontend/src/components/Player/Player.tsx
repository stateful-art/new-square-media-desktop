import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faStepForward,
  faListDots,
  faPlayCircle,
  faPauseCircle,
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
  const [isSongEnded, setIsSongEnded] = useState(false);
  const [currentSongName, setCurrentSongName] = useState("");
  const [nextSongIndex, setNextSongIndex] = useState(0);

  const [value, setValue] = useState<number>(0.5); // Initial slider value
  const [thumbPosition, setThumbPosition] = useState<number>(0); // Initial thumb position
  const [progressThumbPosition, setProgressThumbPosition] = useState<number>(0); // Initial thumb position
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0); // Initialize with -1

  useEffect(() => {
    // Find the index of the currently playing song in the queue
    const index = Array.from(queue).findIndex((song) => song.name === songName);
    setCurrentSongIndex(index);
  }, [songName, queue]); // Update when songName or queue changes

  useEffect(() => {
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

      // Find the index of the next song in the queue
      // const currentSong = Array.from(queue).findIndex(song => song.name === nextSong.name);

      // Check if the next song is different from the currently playing song
      setNextSongIndex(currentSongIndex + 1);

      GetSong(nextSong.path)
        .then((base64String) => {
          loadAudio(base64String);
          audioRef.current?.play();
          setSelectedSongName(nextSong.name);
          setIsPlaying(true);
          setCurrentSongName(nextSong.name);
          setIsSongEnded(false);
        })
        .catch((error) => console.error("Error fetching audio:", error));
    }
  }, [isSongEnded, queue]); // Dependency on isSongEnded and queue

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

  const handleProgressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(event.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const scroll = songName.length > 20 ? "scroll-text" : "";

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

  const findSongIndexInQueue = (songName: string) => {
    const songs = Array.from(queue);
    const index = songs.findIndex((song) => song.name === songName);
    return index;
  };

  return (
    <div id="player">
      <div id="songName" className={scroll}>{currentSongName.replace(/\.[^.]+$/, "")} </div>

      <FontAwesomeIcon
        className="playPauseButton"
        icon={isPlaying ? faPauseCircle : faPlayCircle}
        color="white"
        onClick={togglePlayPause}
        size="3x"
      />

      <FontAwesomeIcon
        className="next-song-button"
        icon={faStepForward}
        size="2x"
        color={
          findSongIndexInQueue(currentSongName) + 1 == queue.size
            ? "gray"
            : "white"
        }
        onClick={
          findSongIndexInQueue(currentSongName) + 1 == queue.size
            ? undefined
            : playNextSong
        }
      />

      <audio
        id="audioPlayer"
        ref={audioRef}
        autoPlay
        onTimeUpdate={updateCurrentTime}
      ></audio>

      <>
        {!Number.isNaN(currentTime) && !Number.isNaN(getDuration()) && (
          <>
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
          </>
        )}
        <input
          type="range"
          id="progress-control"
          className="progress-control"
          min="0"
          max={audioRef.current?.duration}
          step="1"
          value={currentTime}
          onChange={handleProgressChange}
        />
        {!Number.isNaN(getDuration()) && (
          <>
            {Math.floor(getDuration() / 60)}:{Math.floor(getDuration() % 60)}
          </>
        )}
      </>

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
