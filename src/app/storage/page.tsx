"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/api/supabase-client";
import { Button } from "@/app/components/ui/button";
import { Card } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";
import { AlertTriangle, Upload, FileText } from "lucide-react";

const bucketName = "uploads";

export default function StoragePage() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStorageFiles();
  }, []);

  async function fetchStorageFiles() {
    const { data, error } = await supabase.storage.from(bucketName).list("", {
      limit: 50,
      offset: 0,
    });

    if (error) {
      setMessage(`Unable to fetch files: ${error.message}`);
      return;
    }

    setFiles(data.map((item) => item.name));
    setMessage(null);
  }

  async function handleUpload() {
    if (!selectedFile) {
      setMessage("Please choose a file before uploading.");
      return;
    }

    setUploading(true);
    setMessage(null);
    const filePath = `public/${selectedFile.name}`;
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(filePath, selectedFile, { upsert: true });

    setUploading(false);

    if (error) {
      setMessage(`Upload failed: ${error.message}`);
      return;
    }

    setMessage(`Uploaded ${selectedFile.name}.`);
    setSelectedFile(null);
    fetchStorageFiles();
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Supabase Storage</h1>
        <p className="text-muted-foreground max-w-2xl">
          Upload files to your Supabase storage bucket and list stored objects. Make sure a bucket named
          <span className="font-semibold"> uploads</span> exists in your Supabase project.
        </p>
      </div>

      <Card className="p-6 rounded-3xl border border-border bg-white shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] items-end">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-foreground">Choose file</label>
            <Input
              type="file"
              onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            />
            {selectedFile && (
              <div className="text-sm text-foreground/70">Selected: {selectedFile.name}</div>
            )}
          </div>

          <Button
            className="inline-flex items-center gap-2"
            disabled={uploading || !selectedFile}
            onClick={handleUpload}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-warning/20 bg-warning/5 p-4 text-sm text-warning">
            <AlertTriangle className="inline mr-2 w-4 h-4 align-text-bottom" />
            {message}
          </div>
        )}
      </Card>

      <Card className="p-6 rounded-3xl border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">Stored files</h2>
            <p className="text-sm text-muted-foreground">Files in the <span className="font-medium">uploads</span> bucket</p>
          </div>
          <Button variant="outline" onClick={fetchStorageFiles} className="inline-flex items-center gap-2">
            <FileText className="w-4 h-4" /> Refresh
          </Button>
        </div>

        {files.length === 0 ? (
          <div className="text-sm text-muted-foreground">No files found yet.</div>
        ) : (
          <ul className="space-y-2">
            {files.map((name) => (
              <li key={name} className="rounded-2xl border border-border p-3 text-sm text-foreground">
                {name}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
