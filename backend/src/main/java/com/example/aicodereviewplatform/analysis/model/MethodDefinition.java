package com.example.aicodereviewplatform.analysis.model;

import io.hypersistence.utils.hibernate.type.json.JsonType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "method_definition")
public class MethodDefinition {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_definition_id")
    private TypeDefinition typeDefinition;

    private String methodName;
    private String returnType;
    private String visibility;
    private boolean isStatic;
    private boolean isFinal;
    private boolean isAbstract;
    private int lineCount;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> parameters;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> annotations;

    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private List<String> exceptions;
}
