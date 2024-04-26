import React, { useEffect, useState } from "react";
import "./QueuePanel.css";
import { SongLibrary } from "../MusicLibrary/MusicLibrary";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

interface QueuePanelProps {
  queue: Set<SongLibrary>;
  songName: string;
  setQueue: React.Dispatch<React.SetStateAction<Set<SongLibrary>>>;
  // handleRemoveFromQueue: React.Dispatch<React.SetStateAction<SongLibrary>>;
  handleRemoveFromQueue: (item: SongLibrary) => void; // Function that takes a SongLibrary item and returns void
  setSelectedSongName: React.Dispatch<React.SetStateAction<string>>;
  setSelectedFilePath: React.Dispatch<React.SetStateAction<string>>;
  isOpen: boolean;
}

const QueuePanel: React.FC<QueuePanelProps> = ({
  queue,
  songName,
  setQueue,
  handleRemoveFromQueue,
  setSelectedSongName,
  setSelectedFilePath,
  isOpen,
}) => {
  const [nowPlayingName, setNowPlayingName] = useState("");
  const [nowPlayingPath, setNowPlayingPath] = useState("");
  const [draggedItem, setDraggedItem] = useState<SongLibrary | null>(null);
  const [dragStarted, setDragStarted] = useState(false);
  const [dragEnded, setDragEnded] = useState(false);
  useEffect(() => {
    setNowPlayingName(songName);
  }, [songName]);

  const updateQueue = (newQueue: Set<SongLibrary>) => {
    setQueue(newQueue);
  };

  const playSong = (song: SongLibrary) => {
    setSelectedSongName(song.name);
    setSelectedFilePath(song.path);

    setNowPlayingName(song.name);
    setNowPlayingPath(song.path);
  };

  const handleDragStart = (
    e: React.DragEvent<HTMLLIElement>,
    song: SongLibrary
  ) => {
    setDragStarted(true);
    setDraggedItem(song);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent<HTMLLIElement>) => {
    e.preventDefault();
    setDragEnded(false);
    e.dataTransfer.dropEffect = "move";
  };

  //  const handleDrop = (e: React.DragEvent<HTMLLIElement>, song: SongLibrary) => {
  //     e.preventDefault();
  //     if (draggedItem && draggedItem !== song) {
  //       // Logic to reorder the queue goes here
  //       // This is a placeholder for the actual reordering logic
  //       console.log(`Moved ${draggedItem.name} to position of ${song.name}`);
  //       setDraggedItem(null); // Reset dragged item
  //     }
  //  };

  // const handleDrop = (e: React.DragEvent<HTMLLIElement>, song: SongLibrary) => {
  //   e.preventDefault();
  //   if (draggedItem && draggedItem !== song) {
  //      // Convert the Set to an array
  //      const queueArray = Array.from(queue);

  //      // Find the current and target positions
  //      const draggedIndex = queueArray.findIndex(item => item === draggedItem);
  //      const targetIndex = queueArray.findIndex(item => item === song);

  //      // Reorder the array
  //      const newQueue = [...queueArray];
  //      newQueue.splice(draggedIndex, 1); // Remove the dragged item
  //      newQueue.splice(targetIndex, 0, draggedItem); // Insert the dragged item at the target position

  //      // Update the queue in the parent component
  //     updateQueue(newQueue)

  //      setDraggedItem(null); // Reset dragged item
  //   }
  //  };

  const handleDrop = (e: React.DragEvent<HTMLLIElement>, song: SongLibrary) => {
    e.preventDefault();
    e.stopPropagation(); // Stop event propagation

    if (draggedItem && draggedItem !== song) {
      // Convert the Set to an array
      const queueArray = Array.from(queue);

      // Find the current and target positions
      const draggedIndex = queueArray.findIndex((item) => item === draggedItem);
      const targetIndex = queueArray.findIndex((item) => item === song);

      // Reorder the array
      const newQueue = [...queueArray];
      newQueue.splice(draggedIndex, 1); // Remove the dragged item
      newQueue.splice(targetIndex, 0, draggedItem); // Insert the dragged item at the target position

      // Convert the array back to a Set
      const newQueueSet = new Set(newQueue);

      // Update the queue in the parent component
      updateQueue(newQueueSet);

      setDraggedItem(null); // Reset dragged item
    }
  };

  // Remove file extension and limit to first 50 characters
  const formattedSongName = (songName: string) => {
    let nameWithoutExtension = songName.replace(/\.[^.]+$/, "");
    if (nameWithoutExtension.length < 50) {
      return nameWithoutExtension;
    } else {
      return nameWithoutExtension.substring(0, 50) + "...";
    }
  };

  return (
    <div id="queuePanel" className={isOpen ? "" : "hidden"}>
      {queue.size > 0 ? (
        <ul>
          {Array.from(queue).map((song) => (
            <li
              key={song.name}
              style={{ paddingTop: `${dragStarted ? "12px" : ""}` }}
              draggable
              onDragStart={(e) => handleDragStart(e, song)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, song)}
              onClick={() => playSong(song)}
            >
              <FontAwesomeIcon
                className={"remove-queue-btn"}
                icon={faMinus}
                size="xl"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event propagation
                  handleRemoveFromQueue(song);
                }}
              />

              <span
                style={{
                  color: `${nowPlayingName === song.name ? "red" : ""}`,
                }}
              >
                {formattedSongName(song.name)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ padding: "12px", textAlign: "center" }}>
          Queue is empty.
        </div>
      )}
    </div>
  );
};

export default QueuePanel;
