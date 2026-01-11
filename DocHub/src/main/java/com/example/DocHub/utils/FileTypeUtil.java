package com.example.DocHub.utils;

public class FileTypeUtil {

    public static String getFileType(String filename) {

        if (filename == null || filename.isBlank()) {
            return "OTHER";
        }

        // 1️⃣ Extract extension safely
        int lastDot = filename.lastIndexOf('.');
        if (lastDot == -1 || lastDot == filename.length() - 1) {
            return "OTHER";
        }

        String extension = filename.substring(lastDot + 1);

       
    
        if (extension == null) {
            return "OTHER";
        }

        return switch (extension.toLowerCase()) {

            // Images
            case "jpg", "jpeg", "png", "gif", "webp", "bmp", "svg" -> "IMAGE";

            // Videos
            case "mp4", "mkv", "avi", "mov", "webm", "flv" -> "VIDEO";

            // Audio
            case "mp3", "wav", "aac", "flac", "ogg" -> "AUDIO";

            // Documents
            case "pdf", "doc", "docx", "xls", "xlsx",
                 "ppt", "pptx", "txt", "csv" -> "DOCUMENT";

            // Archives
            case "zip", "rar", "7z", "tar", "gz" -> "ARCHIVE";

            // Code files
            case "java", "js", "ts", "py", "cpp", "c",
                 "html", "css", "json", "xml", "yaml", "yml" -> "CODE";

            default -> "OTHER";
        };
    }
}
