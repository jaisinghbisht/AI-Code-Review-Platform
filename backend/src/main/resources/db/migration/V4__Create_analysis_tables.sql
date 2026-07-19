-- Main table for a single analysis run on a project
CREATE TABLE project_analysis (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_classes INTEGER NOT NULL,
    total_interfaces INTEGER NOT NULL,
    total_enums INTEGER NOT NULL,
    total_records INTEGER NOT NULL,
    total_methods INTEGER NOT NULL,
    total_fields INTEGER NOT NULL,
    total_constructors INTEGER NOT NULL,
    analysis_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_project
        FOREIGN KEY(project_id)
            REFERENCES project(id)
);

-- Table to store details for each Java file analyzed
CREATE TABLE file_analysis (
    id UUID PRIMARY KEY,
    analysis_id UUID NOT NULL,
    file_path VARCHAR(1024) NOT NULL,
    package_name VARCHAR(255),
    line_count INTEGER NOT NULL,
    CONSTRAINT fk_project_analysis
        FOREIGN KEY(analysis_id)
            REFERENCES project_analysis(id)
);

-- Table for top-level type definitions (classes, interfaces, etc.) within a file
CREATE TABLE type_definition (
    id UUID PRIMARY KEY,
    file_analysis_id UUID NOT NULL,
    type_name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- CLASS, INTERFACE, ENUM, RECORD
    visibility VARCHAR(50),
    is_abstract BOOLEAN,
    is_final BOOLEAN,
    superclass_name VARCHAR(255),
    field_count INTEGER,
    method_count INTEGER,
    constructor_count INTEGER,
    line_count INTEGER,
    CONSTRAINT fk_file_analysis
        FOREIGN KEY(file_analysis_id)
            REFERENCES file_analysis(id)
);

-- Table for method details within a type definition
CREATE TABLE method_definition (
    id UUID PRIMARY KEY,
    type_definition_id UUID NOT NULL,
    method_name VARCHAR(255) NOT NULL,
    return_type VARCHAR(255),
    visibility VARCHAR(50),
    is_static BOOLEAN,
    is_final BOOLEAN,
    is_abstract BOOLEAN,
    line_count INTEGER,
    parameters JSONB, -- Store parameters as a JSON array
    annotations JSONB, -- Store annotations as a JSON array
    exceptions JSONB, -- Store thrown exceptions as a JSON array
    CONSTRAINT fk_type_definition
        FOREIGN KEY(type_definition_id)
            REFERENCES type_definition(id)
);
