package com.example.aicodereviewplatform.project.storage;

import com.example.aicodereviewplatform.project.exception.ProjectProcessingException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class StorageService {

    private final Path rootLocation;

    public StorageService(@Value("${app.storage.location}") String storageLocation) {
        this.rootLocation = Paths.get(storageLocation);
    }

    public Path store(MultipartFile file, UUID projectId) {
        if (file.isEmpty()) {
            throw new ProjectProcessingException("Failed to store empty file.");
        }
        if (file.getOriginalFilename() == null || !file.getOriginalFilename().endsWith(".zip")) {
            throw new ProjectProcessingException("Only ZIP files are supported.");
        }

        Path destinationDir = rootLocation.resolve(projectId.toString());
        try {
            Files.createDirectories(destinationDir);
            Path destinationFile = destinationDir.resolve("archive.zip").normalize().toAbsolutePath();
            if (!destinationFile.getParent().equals(destinationDir.toAbsolutePath())) {
                throw new ProjectProcessingException("Cannot store file outside current directory.");
            }
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, destinationFile, StandardCopyOption.REPLACE_EXISTING);
            }
            return destinationFile;
        } catch (IOException e) {
            throw new ProjectProcessingException("Failed to store file.", e);
        }
    }

    public Path extract(Path zipFilePath, UUID projectId) {
        Path extractDir = rootLocation.resolve(projectId.toString()).resolve("project");
        try {
            Files.createDirectories(extractDir);
            try (ZipInputStream zis = new ZipInputStream(Files.newInputStream(zipFilePath))) {
                ZipEntry zipEntry = zis.getNextEntry();
                while (zipEntry != null) {
                    Path newPath = zipSlipProtect(zipEntry, extractDir);
                    if (zipEntry.isDirectory()) {
                        Files.createDirectories(newPath);
                    } else {
                        if (newPath.getParent() != null) {
                            if (Files.notExists(newPath.getParent())) {
                                Files.createDirectories(newPath.getParent());
                            }
                        }
                        Files.copy(zis, newPath, StandardCopyOption.REPLACE_EXISTING);
                    }
                    zipEntry = zis.getNextEntry();
                }
                zis.closeEntry();
            }
            return extractDir;
        } catch (IOException e) {
            throw new ProjectProcessingException("Failed to extract ZIP archive.", e);
        }
    }

    // Protection against Zip Slip vulnerability
    private Path zipSlipProtect(ZipEntry zipEntry, Path targetDir) throws IOException {
        Path targetDirResolved = targetDir.resolve(zipEntry.getName());
        Path normalizePath = targetDirResolved.normalize();
        if (!normalizePath.startsWith(targetDir)) {
            throw new IOException("Bad zip entry: " + zipEntry.getName());
        }
        return normalizePath;
    }
}