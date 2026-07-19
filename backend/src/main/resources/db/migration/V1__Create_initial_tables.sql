CREATE TABLE code_submission (
    id BIGSERIAL PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    source_code TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL
);

CREATE TABLE code_review (
    id BIGSERIAL PRIMARY KEY,
    submission_id BIGINT NOT NULL,
    bugs TEXT,
    security_issues TEXT,
    performance_issues TEXT,
    maintainability_issues TEXT,
    refactoring_suggestions TEXT,
    overall_summary TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    CONSTRAINT fk_submission
        FOREIGN KEY(submission_id)
            REFERENCES code_submission(id)
);
