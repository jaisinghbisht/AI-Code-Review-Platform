CREATE TABLE checkstyle_violation (
    id UUID PRIMARY KEY,
    file_analysis_id UUID NOT NULL,
    source_name VARCHAR(255) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    line INTEGER NOT NULL,
    column_num INTEGER,
    message TEXT,
    CONSTRAINT fk_file_analysis_checkstyle
        FOREIGN KEY(file_analysis_id)
            REFERENCES file_analysis(id)
);
