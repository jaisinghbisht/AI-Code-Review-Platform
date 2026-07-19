CREATE TABLE project (
    id UUID PRIMARY KEY,
    project_name VARCHAR(255) NOT NULL,
    archive_name VARCHAR(255) NOT NULL,
    root_directory VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    total_files INTEGER NOT NULL,
    java_files INTEGER NOT NULL,
    package_count INTEGER NOT NULL,
    estimated_lines_of_code BIGINT NOT NULL,
    is_spring_boot_project BOOLEAN NOT NULL,
    is_maven_project BOOLEAN NOT NULL,
    is_gradle_project BOOLEAN NOT NULL,
    upload_timestamp TIMESTAMP WITHOUT TIME ZONE NOT NULL
);
