import React, { useState, useCallback, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import {
  Search,
  File,
  FileText,
  Image,
  Video,
  X,
  Folder,
  Plus,
  Tag,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type FileItem = {
  name: string;
  size: number;
  type: string;
  folderId: string | null;
};

type FolderItem = {
  id: string;
  name: string;
};

export default function EnhancedDropboxClone() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([
    { id: "1", name: "Documents" },
    { id: "2", name: "Images" },
  ]);
  const [tags, setTags] = useState<string[]>(["work", "personal", "important"]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState("");

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles
        .filter((file) => {
          const isValidType = [
            "application/pdf",
            "text/plain",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "image/jpeg",
            "image/png",
            "image/gif",
            "video/mp4",
          ].includes(file.type);
          const isValidSize = file.type.startsWith("video/")
            ? file.size <= 10 * 1024 * 1024
            : file.size <= 5 * 1024 * 1024;
          return isValidType && isValidSize;
        })
        .map((file) => ({
          name: file.name,
          size: file.size,
          type: file.type,
          folderId: selectedFolder,
        }));
      setFiles((prev) => [...prev, ...newFiles]);
    },
    [selectedFolder]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const filteredFiles = useMemo(() => {
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedFolder === null || file.folderId === selectedFolder)
    );
  }, [files, searchTerm, selectedFolder]);

  const removeFile = (fileName: string) => {
    setFiles((prev) => prev.filter((file) => file.name !== fileName));
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return <Image className="w-6 h-6" />;
    if (fileType.startsWith("video/")) return <Video className="w-6 h-6" />;
    if (fileType === "application/pdf") return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      const newFolder: FolderItem = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
      };
      setFolders((prev) => [...prev, newFolder]);
      setNewFolderName("");
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Folders</h2>
          <ScrollArea className="h-[calc(100vh-250px)]">
            <ul className="space-y-2">
              <li>
                <Button
                  variant={selectedFolder === null ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => setSelectedFolder(null)}
                >
                  <Folder className="mr-2 h-4 w-4" />
                  All Files
                </Button>
              </li>
              {folders.map((folder) => (
                <li key={folder.id}>
                  <Button
                    variant={
                      selectedFolder === folder.id ? "secondary" : "ghost"
                    }
                    className="w-full justify-start"
                    onClick={() => setSelectedFolder(folder.id)}
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    {folder.name}
                  </Button>
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
        <div className="p-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  placeholder="Folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <Button onClick={handleCreateFolder}>Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <Separator />
        <div className="p-4 mt-auto">
          <h3 className="text-sm font-semibold mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-xs flex items-center"
              >
                <Tag className="w-3 h-3 mr-1" />
                {tag}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        <h1 className="text-2xl font-bold mb-6">Enhanced Dropbox Clone</h1>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search files..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
            isDragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
          <p className="text-sm text-gray-500 mt-2">
            Supported files: PDF, TXT, DOC, DOCX, Images (less than 5MB), Videos
            (less than 10MB)
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {selectedFolder === null
              ? "All Files"
              : `Files in ${
                  folders.find((f) => f.id === selectedFolder)?.name
                }`}
          </h2>
          <ul className="space-y-2">
            {filteredFiles.map((file) => (
              <li
                key={file.name}
                className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile(file.name)}
                  >
                    <X className="w-4 h-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
