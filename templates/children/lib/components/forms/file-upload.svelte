<!-- +page.svelte -->
<script lang="ts">
  import { Button } from "$lib/components/ui/button";
  import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "$lib/components/ui/card";
  import { Progress } from "$lib/components/ui/progress";
  import { Alert, AlertDescription } from "$lib/components/ui/alert";
  import { Upload, FileIcon, X, CheckCircle2, AlertCircle, Pencil, Trash2, ExternalLink } from "@lucide/svelte";
  import { onMount } from "svelte";
  
  interface UploadedFile {
    id: string;
    url: string;
    directUrl: string;
    filename: string;
    size: number;
    contentType: string;
    etag: string;
    uploadedAt: string;
  }

  let files: FileList | null = null;
  let uploading = false;
  let uploadProgress = 0;
  let uploadStatus: { type: 'success' | 'error' | null; message: string } = { type: null, message: '' };
  let dragActive = false;
  let selectedFile: File | null = null;
  let uploadedFiles: UploadedFile[] = [];
  let loading = false;
  let editingFileId: string | null = null;
  let deletingFileId: string | null = null;

  onMount(() => {
    loadUploadedFiles();
  });

  async function loadUploadedFiles() {
    loading = true;
    try {
      const response = await fetch('/api/files');
      if (response.ok) {
        const data = await response.json();
        uploadedFiles = data.files || [];
      }
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      loading = false;
    }
  }

  async function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!selectedFile) {
      uploadStatus = { type: 'error', message: 'Please select a file first' };
      return;
    }

    uploading = true;
    uploadProgress = 0;
    uploadStatus = { type: null, message: 'Uploading...' };

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (e: ProgressEvent) => {
        if (e.lengthComputable) {
          uploadProgress = Math.round((e.loaded / e.total) * 100);
        }
      });

      xhr.addEventListener('load', async () => {
        if (xhr.status === 200) {
          const result = JSON.parse(xhr.responseText);
          uploadStatus = { type: 'success', message: 'File uploaded successfully!' };
          selectedFile = null;
          files = null;
          uploadProgress = 0;
          
          // Add the new file to the list
          uploadedFiles = [...uploadedFiles, {
            ...result,
            uploadedAt: new Date().toISOString()
          }];
        } else {
          uploadStatus = { type: 'error', message: `Upload failed: ${xhr.statusText}` };
        }
        uploading = false;
      });

      xhr.addEventListener('error', () => {
        uploadStatus = { type: 'error', message: 'Upload failed: Network error' };
        uploading = false;
      });

      xhr.open('POST', '/api/files');
      xhr.send(formData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      uploadStatus = { type: 'error', message: `Upload failed: ${errorMessage}` };
      uploading = false;
    }
  }

  function handleFileSelect(e: Event) {
    const target = e.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      selectedFile = file;
      uploadStatus = { type: null, message: '' };
    }
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragActive = false;
    
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      selectedFile = file;
      uploadStatus = { type: null, message: '' };
    }
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragActive = true;
  }

  function handleDragLeave() {
    dragActive = false;
  }

  function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  function removeFile() {
    selectedFile = null;
    files = null;
    uploadStatus = { type: null, message: '' };
    uploadProgress = 0;
  }

  function startEdit(fileId: string) {
    editingFileId = fileId;
    const input = document.createElement('input');
    input.type = 'file';
    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const newFile = target.files?.[0];
      if (newFile) {
        await handleUpdate(fileId, newFile);
      }
    };
    input.click();
  }

  async function handleUpdate(fileId: string, newFile: File) {
    try {
      const formData = new FormData();
      formData.append('file', newFile);
      formData.append('id', fileId);

      const response = await fetch('/api/files', {
        method: 'PUT',
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        uploadedFiles = uploadedFiles.map(f => 
          f.id === fileId 
            ? { ...result, uploadedAt: f.uploadedAt } 
            : f
        );
        uploadStatus = { type: 'success', message: 'File updated successfully!' };
      } else {
        uploadStatus = { type: 'error', message: 'Failed to update file' };
      }
    } catch (error) {
      uploadStatus = { type: 'error', message: 'Error updating file' };
    } finally {
      editingFileId = null;
    }
  }

  async function handleDelete(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) {
      return;
    }

    deletingFileId = fileId;

    try {
      const response = await fetch('/api/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: fileId })
      });

      if (response.ok) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        uploadStatus = { type: 'success', message: 'File deleted successfully!' };
      } else {
        uploadStatus = { type: 'error', message: 'Failed to delete file' };
      }
    } catch (error) {
      uploadStatus = { type: 'error', message: 'Error deleting file' };
    } finally {
      deletingFileId = null;
    }
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
</script>

<div class="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 py-8">
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Upload Card -->
    <Card class="w-full">
      <CardHeader>
        <CardTitle>File Upload</CardTitle>
        <CardDescription>Upload files to MinIO storage</CardDescription>
      </CardHeader>
      <CardContent>
        <form on:submit={handleSubmit} class="space-y-4">
          <div
            class="border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer relative {dragActive ? 'border-primary bg-primary/5 scale-[1.02]' : 'border-muted-foreground/25'} {selectedFile ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : 'hover:border-primary hover:bg-accent'}"
            on:drop={handleDrop}
            on:dragover={handleDragOver}
            on:dragleave={handleDragLeave}
            role="button"
            tabindex="0"
          >
            <input
              type="file"
              bind:files
              on:change={handleFileSelect}
              id="file-input"
              disabled={uploading}
              class="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            
            {#if selectedFile}
              <div class="flex items-center gap-3 text-left">
                <FileIcon class="w-10 h-10 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{selectedFile.name}</p>
                  <p class="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="flex-shrink-0 h-8 w-8"
                  onclick={removeFile}
                  disabled={uploading}
                >
                  <X class="h-4 w-4" />
                </Button>
              </div>
            {:else}
              <Upload class="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p class="text-sm text-foreground mb-2">
                <label for="file-input" class="font-semibold text-primary cursor-pointer hover:underline">
                  Choose a file
                </label>
                or drag and drop
              </p>
              <p class="text-xs text-muted-foreground">Any file type supported</p>
            {/if}
          </div>

          {#if uploadProgress > 0 && uploading}
            <div class="space-y-2">
              <div class="flex justify-between text-sm">
                <span class="text-muted-foreground">Uploading...</span>
                <span class="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} class="h-2" />
            </div>
          {/if}

          {#if uploadStatus.type}
            <Alert variant={uploadStatus.type === 'error' ? 'destructive' : 'default'}>
              {#if uploadStatus.type === 'success'}
                <CheckCircle2 class="h-4 w-4" />
              {:else}
                <AlertCircle class="h-4 w-4" />
              {/if}
              <AlertDescription>{uploadStatus.message}</AlertDescription>
            </Alert>
          {/if}

          <Button type="submit" class="w-full" disabled={!selectedFile || uploading}>
            {#if uploading}
              <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
            {:else}
              <Upload class="w-4 h-4 mr-2" />
              Upload File
            {/if}
          </Button>
        </form>
      </CardContent>
    </Card>

    <!-- Uploaded Files List -->
    <Card class="w-full">
      <CardHeader>
        <CardTitle>Uploaded Files</CardTitle>
        <CardDescription>Manage your uploaded files</CardDescription>
      </CardHeader>
      <CardContent>
        {#if loading}
          <div class="flex items-center justify-center py-8">
            <svg class="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        {:else if uploadedFiles.length === 0}
          <div class="text-center py-8 text-muted-foreground">
            <FileIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No files uploaded yet</p>
          </div>
        {:else}
          <div class="space-y-3">
            {#each uploadedFiles as file (file.id)}
              <div class="flex items-center gap-3 p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                <!-- <FileIcon class="w-10 h-10 text-primary flex-shrink-0" /> -->
                 <img class="size-10 object-cover" src={file.url} alt="{file.filename}"/>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm truncate">{file.filename}</p>
                  <p class="text-xs text-muted-foreground">
                    {formatFileSize(file.size)} • {file.contentType}
                  </p>
                  {#if file.uploadedAt}
                    <p class="text-xs text-muted-foreground">{formatDate(file.uploadedAt)}</p>
                  {/if}
                </div>
                <div class="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => window.open(file.url, '_blank')}
                    title="View file"
                  >
                    <ExternalLink class="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => startEdit(file.id)}
                    disabled={editingFileId === file.id}
                    title="Replace file"
                  >
                    {#if editingFileId === file.id}
                      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    {:else}
                      <Pencil class="h-4 w-4" />
                    {/if}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onclick={() => handleDelete(file.id)}
                    disabled={deletingFileId === file.id}
                    title="Delete file"
                    class="hover:text-destructive"
                  >
                    {#if deletingFileId === file.id}
                      <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    {:else}
                      <Trash2 class="h-4 w-4" />
                    {/if}
                  </Button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>
  </div>
</div>