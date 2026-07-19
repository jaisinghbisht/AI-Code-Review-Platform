package com.example.aicodereviewplatform.analysis.parser;

import com.example.aicodereviewplatform.analysis.model.FileAnalysis;
import com.example.aicodereviewplatform.analysis.model.MethodDefinition;
import com.example.aicodereviewplatform.analysis.model.TypeDefinition;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Modifier;
import com.github.javaparser.ast.body.ClassOrInterfaceDeclaration;
import com.github.javaparser.ast.body.EnumDeclaration;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.RecordDeclaration;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FileParser {

    public FileAnalysis parse(Path javaFile) {
        try {
            String content = Files.readString(javaFile);
            CompilationUnit cu = StaticJavaParser.parse(content);

            FileAnalysis fileAnalysis = FileAnalysis.builder()
                    .id(UUID.randomUUID())
                    .filePath(javaFile.toString())
                    .packageName(cu.getPackageDeclaration().map(pd -> pd.getName().asString()).orElse(null))
                    .lineCount((int) content.lines().count())
                    .build();

            cu.getTypes().forEach(type -> {
                TypeDefinition typeDef = TypeDefinition.builder()
                        .id(UUID.randomUUID())
                        .typeName(type.getNameAsString())
                        .lineCount(type.getRange().map(r -> r.getLineCount()).orElse(0))
                        .build();

                if (type.isClassOrInterfaceDeclaration()) {
                    ClassOrInterfaceDeclaration cid = type.asClassOrInterfaceDeclaration();
                    typeDef.setType(cid.isInterface() ? "INTERFACE" : "CLASS");
                    typeDef.setSuperclassName(cid.getExtendedTypes().stream().findFirst().map(Object::toString).orElse(null));
                } else if (type.isEnumDeclaration()) {
                    typeDef.setType("ENUM");
                } else if (type.isRecordDeclaration()) {
                    typeDef.setType("RECORD");
                }

                type.getMethods().forEach(method -> {
                    MethodDefinition methodDef = MethodDefinition.builder()
                            .id(UUID.randomUUID())
                            .methodName(method.getNameAsString())
                            .returnType(method.getType().asString())
                            .visibility(method.getAccessSpecifier().asString())
                            .isStatic(method.isStatic())
                            .isFinal(method.isFinal())
                            .isAbstract(method.isAbstract())
                            .lineCount(method.getRange().map(r -> r.getLineCount()).orElse(0))
                            .parameters(method.getParameters().stream().map(Object::toString).collect(Collectors.toList()))
                            .annotations(method.getAnnotations().stream().map(Object::toString).collect(Collectors.toList()))
                            .exceptions(method.getThrownExceptions().stream().map(Object::toString).collect(Collectors.toList()))
                            .build();
                    typeDef.addMethodDefinition(methodDef);
                });
                
                typeDef.setMethodCount(type.getMethods().size());
                typeDef.setFieldCount(type.getFields().size());
                typeDef.setConstructorCount(type.getConstructors().size());

                fileAnalysis.addTypeDefinition(typeDef);
            });

            return fileAnalysis;

        } catch (IOException e) {
            log.error("Failed to read file: {}", javaFile, e);
            return null;
        } catch (Exception e) {
            log.error("Failed to parse file: {}", javaFile, e);
            return null; // Malformed file, return null to skip it
        }
    }
}
