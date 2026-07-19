package com.example.aicodereviewplatform.analysis.ai;

import java.util.List;
import java.util.Set;

public record ProjectSummary(
    String projectName,
    String projectType,
    int totalFiles,
    int javaFiles,
    int packageCount,
    int classesCount,
    int interfacesCount,
    int enumsCount,
    int recordsCount,
    int methodsCount,
    int fieldsCount,
    int constructorsCount,
    Set<String> packagesDiscovered,
    double averageMethodsPerClass,
    List<TypeSummary> largestClasses,
    List<FileSummary> topNLargestFiles,
    List<TypeSummary> classesWithManyMethods,
    List<TypeSummary> classesWithoutMethods,
    List<String> generalObservations
) {}
