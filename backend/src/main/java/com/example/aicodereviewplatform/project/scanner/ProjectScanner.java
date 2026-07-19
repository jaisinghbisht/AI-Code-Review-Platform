package com.example.aicodereviewplatform.project.scanner;

import com.example.aicodereviewplatform.project.exception.ProjectProcessingException;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
public class ProjectScanner {

    private static final Set<String> IGNORED_DIRECTORIES = Set.of(
            "target", "build", ".idea", ".gradle", "node_modules", "bin", "out"
    );

    public List<Path> findJavaFiles(Path rootDir) {
        List<Path> javaFiles = new ArrayList<>();
        try {
            Files.walkFileTree(rootDir, new SimpleFileVisitor<Path>() {
                @Override
                public FileVisitResult preVisitDirectory(Path dir, BasicFileAttributes attrs) {
                    if (IGNORED_DIRECTORIES.contains(dir.getFileName().toString())) {
                        return FileVisitResult.SKIP_SUBTREE;
                    }
                    return FileVisitResult.CONTINUE;
                }

                @Override
                public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) {
                    if (file.toString().endsWith(".java")) {
                        javaFiles.add(file);
                    }
                    return FileVisitResult.CONTINUE;
                }
            });
        } catch (IOException e) {
            throw new ProjectProcessingException("Failed to scan project directory.", e);
        }
        return javaFiles;
    }

    public boolean isSpringBootProject(Path rootDir) {
        Path pomFile = rootDir.resolve("pom.xml");
        Path gradleFile = rootDir.resolve("build.gradle");
        
        try {
            if (Files.exists(pomFile)) {
                String content = Files.readString(pomFile);
                return content.contains("spring-boot");
            } else if (Files.exists(gradleFile)) {
                 String content = Files.readString(gradleFile);
                 return content.contains("spring-boot");
            }
        } catch (IOException e) {
            // Ignore and return false
        }
        return false;
    }

    public boolean isMavenProject(Path rootDir) {
        return Files.exists(rootDir.resolve("pom.xml"));
    }

    public boolean isGradleProject(Path rootDir) {
        return Files.exists(rootDir.resolve("build.gradle")) || Files.exists(rootDir.resolve("build.gradle.kts"));
    }
}
