import React, { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faPause, faStepForward } from "@fortawesome/free-solid-svg-icons";
import { GetSong } from "../../../wailsjs/go/multimedia/Library";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";

interface PlayerProps {
  songName: string;
  filePath: string;
  libName: string;
  queue: Set<SongLibrary>; // Add queue as a prop
  setQueue: React.Dispatch<React.SetStateAction<Set<SongLibrary>>>; // Include setQueue in the props
}

const Player: React.FC<PlayerProps> = ({
  songName,
  filePath,
  queue,
  setQueue,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState<number>(1);
  const [isSongEnded, setIsSongEnded] = useState(false);
  const [currentSongName, setCurrentSongName] = useState('');

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

  // Add an event listener to the audio element to track when the song ends
  // useEffect(() => {
  //   const audioPlayer = audioRef.current;
  //   const handleAudioEnded = () => {
  //     setIsSongEnded(true);
  //   };

  //   if (audioPlayer) {
  //     audioPlayer.addEventListener("ended", handleAudioEnded);
  //     return () => {
  //       audioPlayer.removeEventListener("ended", handleAudioEnded);
  //     };
  //   }
  // }, [audioRef]);
  // Update the queue when the song ends
  // useEffect(() => {
  //   // Check if the queue is empty and if the current song has ended
  //   if (queue.size > 0 && isSongEnded) {
  //     // Get the first song in the queue
  //     const nextSong = Array.from(queue)[0];
  //     // Remove the first song from the queue
  //     const newQueue = new Set(queue);
  //     newQueue.delete(nextSong);
  //     // Set the new queue
  //     setQueue(newQueue);
  //     // Load and play the next song
  //     GetSong(nextSong.path)
  //       .then((base64String) => {
  //         loadAudio(base64String);
  //         audioRef.current?.play();
  //         setIsPlaying(true);
  //         setIsSongEnded(false); // Reset the song ended state
  //       })
  //       .catch((error) => console.error("Error fetching audio:", error));
  //   }
  // }, [queue, isSongEnded]); // Dependency on queue and isSongEnded


  
    // useEffect(() => {
    //   // Check if the queue is empty and if the current song has ended
    //   if (queue.size > 0 && isSongEnded) {
    //     // Get the first song in the queue
    //     const nextSong = Array.from(queue)[0];
    //     // Remove the first song from the queue
    //     const newQueue = new Set(queue);
    //     newQueue.delete(nextSong);
    //     // Set the new queue
    //     setQueue(newQueue);
    
    //     // Load and play the next song
    //     GetSong(nextSong.path)
    //       .then((base64String) => {
    //         loadAudio(base64String);
    //         audioRef.current?.play();
    //         setIsPlaying(true);
    //         setIsSongEnded(false); // Reset the song ended state
    //       })
    //       .catch((error) => console.error("Error fetching audio:", error));
    //   }
    // }, [queue, isSongEnded]); // Dependency on queue and isSongEnded
    

    useEffect(() => {
      // Check if the queue is empty and if the current song has ended
      if (queue.size > 0 && isSongEnded) {
        // Get the first song in the queue
        const nextSong = Array.from(queue)[0];
        // Check if the next song is different from the currently playing song
        if (nextSong.name !== songName) {
          // // Remove the first song from the queue
          // const newQueue = new Set(queue);
          // newQueue.delete(nextSong);
          // // Set the new queue
          // setQueue(newQueue);
    
          // // Load and play the next song
          GetSong(nextSong.path)
            .then((base64String) => {
              loadAudio(base64String);
              audioRef.current?.play();
              setIsPlaying(true);
              setIsSongEnded(false); // Reset the song ended state
            })
            .catch((error) => console.error("Error fetching audio:", error));
        } else {
          // If the next song is the same as the currently playing song, do nothing
          setIsSongEnded(true); // Reset the song ended state
        }
      }
    }, [isSongEnded, songName]); // Dependency on queue, isSongEnded, and songName

  useEffect(() => {
    const audioPlayer = audioRef.current;
    if (audioPlayer) {
      audioPlayer.addEventListener('ended', handleSongEnded);
      // Cleanup: Remove event listener when component unmounts
      return () => {
        audioPlayer.removeEventListener('ended', handleSongEnded);
      };
    }
  }, [audioRef]);
  
  const handleSongEnded = () => {
    setIsSongEnded(true);
  };




  useEffect(() => {
    // Check if the queue is empty and if the player is not playing
    if (queue.size == 0) {
      console.log("queue is empty @ player");
    }
    console.log("queue size @ player >> ", queue.size);
  }, [queue]); // Dependency on queue and isPlaying

  // useEffect(() => {
  //   const audioPlayer = audioRef.current;
  //   if (audioPlayer) {
  //     GetSong(filePath)
  //       .then((base64String) => loadAudio(base64String))
  //       .catch((error) => console.error("Error fetching audio:", error));
  //     audioPlayer.play();
  //     setIsPlaying(true);
  //   }

  //   return () => {
  //     if (audioPlayer) {
  //       audioPlayer.pause();
  //       setIsPlaying(false);
  //     }
  //   };
  // }, [filePath]);


  useEffect(() => {
    setCurrentSongName(songName);
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

  const playNextSong = () => {
    // Check if there are songs in the queue
    if (queue.size > 0) {
      // Get the first song in the queue
      const nextSong = Array.from(queue)[0];
      // Remove the first song from the queue
      // const newQueue = new Set(queue);
      // newQueue.delete(nextSong);
      // // Set the new queue
      // setQueue(newQueue);
      // Load and play the next song
      GetSong(nextSong.path)
        .then((base64String) => {
          loadAudio(base64String);
          audioRef.current?.play();
          setIsPlaying(true);
          setCurrentSongName(nextSong.name);

          queue.delete(nextSong)
        })
        .catch((error) => console.error("Error fetching audio:", error));
    }
  };

  return (
    <div id="player">
      {/* {!Number.isNaN(getDuration()) && ( */}
      <>
        <div id="songName">{currentSongName}</div>
        <FontAwesomeIcon
          className="playPauseButton"
          icon={isPlaying ? faPause : faPlay}
          onClick={togglePlayPause}
          size="2x"
        />

<FontAwesomeIcon
          className="controlButton"
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
        <div id="prog">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
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
      </>
      {/* )} */}
    </div>
  );
};

export default Player;
