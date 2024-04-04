// src/components/FolderDialogModal/FolderDialogModal.tsx
import React, { useState } from 'react';

interface FolderDialogModalProps {
 onFolderSelect: (folderPath: string) => void;
}

const FolderDialogModal: React.FunctionComponent<FolderDialogModalProps> = ({ onFolderSelect }) => {
 const [isDragging, setIsDragging] = useState(false);

 const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default to allow drop
 };

 const handleDragEnter = () => {
    setIsDragging(true);
 };

 const handleDragLeave = () => {
    setIsDragging(false);
 };

 const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault(); // Prevent default to allow drop
    setIsDragging(false);

    // Assuming the dropped item is a folder, get the path
    // Note: This is a simplified example. Getting the folder path from a drag event is complex and might not be directly possible due to security restrictions.
    // You might need to use a different approach or library to handle folder selection.
    console.log('Folder dropped');
    // onFolderSelect('path/to/dropped/folder'); // Uncomment and use this line to pass the folder path to the parent component
    const filePath = event.dataTransfer.files[0]; // This might need adjustment based on how you're handling the dropped files 

};

 return (
    <div id="modal" onClick={() => {}}>
      <div
        id="modal-content"
        onClick={(e) => e.stopPropagation()}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{ backgroundColor: isDragging ? 'lightgreen' : 'white' }}
      >
        <p>Drag and drop a folder here</p>
      </div>
    </div>
 );
};

export default FolderDialogModal;
